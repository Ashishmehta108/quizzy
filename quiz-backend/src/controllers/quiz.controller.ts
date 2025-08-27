import { db } from "../config/db";
import { quizzes, questions, users } from "../config/db/schema";
import { eq } from "drizzle-orm";
import { generateQuizQuestions } from "../utils/ai";
import { randomUUID } from "node:crypto";
import { processPdf } from "../ai/parsedoc/doc";
import { queryChunks, upsertChunks } from "../ai/pinecone";
import { chunkText } from "../utils/chunk";
import fs from "fs/promises";
import { Response, Request } from "express";
import type { InferSelectModel } from "drizzle-orm";
import { ReadStream } from "node:fs";
// import { QuizRequest, QuizResponse } from "@/types/routes/quiz";
import { QuizRequest, QuizResponse } from "../types/routes/quiz";

export interface QuizFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
  stream: ReadStream;
}

export interface FileRequest extends Request {
  files?: QuizFile[] | { [fieldname: string]: QuizFile[] };
  body: {
    title?: string;
    query?: string;
  };
}

type User = InferSelectModel<typeof users>;

interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

function getFirstFile(req: QuizRequest): QuizFile | undefined {
  if (!req.files) return undefined;
  if (Array.isArray(req.files)) return req.files[0] as QuizFile;
  const firstField = Object.keys(req.files)[0];
  return req.files[firstField][0] as QuizFile;
}

export const createQuiz = async (req: QuizRequest, res: Response) => {
  try {
    const userId = req.auth?.userId!;
    const [getUserId]: User[] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId));
    if (!getUserId) return res.status(401).json({ error: "User not found" });

    const firstFile = getFirstFile(req);

    const filePath = firstFile?.path;
    const fileType = firstFile?.mimetype;
    const { title, query } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const docId = randomUUID();
    let fulldoc = "";
    let retrivalcontext: string[] = [];

    if (filePath && req.files) {
      let pdfFiles: QuizFile[] | undefined;

      if (Array.isArray(req.files)) {
        pdfFiles = req.files as QuizFile[];
      } else if (req.files && typeof req.files === "object") {
        pdfFiles = req.files["file"] as QuizFile[] | undefined;
      }
      if (fileType === "application/pdf" && pdfFiles) {
        fulldoc = await processPdf(filePath, getUserId.id, docId, pdfFiles);
      } else if (fileType === "text/plain") {
        const buffer = await fs.readFile(filePath);
        const chunktext = chunkText(buffer.toString(), 1000, 100);
        await upsertChunks(userId, docId, chunktext);
        fulldoc = chunktext
          .map((chunk: { text: string }) => chunk.text)
          .join(" ");
      } else {
        return res.status(400).json({ error: "Unsupported file type" });
      }

      if (query) {
        const chunks = await queryChunks(query, 4, docId);
        retrivalcontext = chunks.map((chunk) => chunk.text);
      }
    }

    const quizParams: {
      title: string;
      context: string;
      morecontext: string;
    } = {
      title: title as string,
      context: (query as string) || "",
      morecontext:
        retrivalcontext.join(" ") +
        " This is the data parsed from the document uploaded by the user. " +
        "This is the full document: " +
        fulldoc,
    };

    const quizQuestions = await generateQuizQuestions(quizParams);

    if (!Array.isArray(quizQuestions)) {
      throw new Error("Failed to generate quiz questions");
    }

    const quizId = randomUUID();
    await db
      .insert(quizzes)
      .values({
        id: quizId,
        title: title as string,
        userId: getUserId.id,
        createdAt: new Date(),
        submitted: false,
      })
      .execute();

    const questionsData = quizQuestions.map((q: QuizQuestion) => ({
      id: randomUUID(),
      quizId,
      question: q.question,
      options: JSON.stringify(q.options),
      answer: q.answer,
      explanation: q.explanation,
      createdAt: new Date(),
      submittedAt: new Date(),
    }));

    await db.insert(questions).values(questionsData).execute();

    res.status(201).json({
      quizId,
      questions: quizQuestions,
    });
  } catch (error) {
    console.error("Error creating quiz:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getQuizzes = async (req: QuizRequest, res: QuizResponse) => {
  try {
    const userId = req.auth?.userId!;
    const [user]: User[] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId));

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const userQuizzes = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.userId, user.id))
      .execute();

    res.json(userQuizzes);
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
