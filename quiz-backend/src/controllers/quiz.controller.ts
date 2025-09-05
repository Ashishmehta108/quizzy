import { db } from "../config/db";
import {
  quizzes,
  questions,
  users,
  usage,
  billings,
} from "../config/db/schema";
import { and, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { processPdf } from "../ai/parsedoc/doc";
import { upsertChunks } from "../ai/pinecone";
import { chunkText } from "../utils/chunk";
import fs from "fs/promises";
import { Response, Request } from "express";
import type { InferSelectModel } from "drizzle-orm";
import { Readable } from "stream";
import { QuizRequest, QuizResponse } from "../types/routes/quiz";
import extractTextFromImage from "@/utils/ocr";
import { io } from "@/server";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { airaAgent } from "@/ai/agent/airaAgent";

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
  stream: Readable;
}

export interface FileRequest extends Request {
  files?: QuizFile[] | { [fieldname: string]: QuizFile[] };
  body: {
    title?: string;
    query?: string;
    websearch?: string;
    socketId?: string;
    description?: string;
  };
}

type User = InferSelectModel<typeof users>;

interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

const emitUpdate = (
  socketId: string | undefined,
  event: string,
  message: string
) => {
  if (socketId) {
    io.to(socketId).emit(event, { message });
  } else {
    io.emit(event, { message });
  }
};

export const createQuiz = asyncHandler(
  async (req: FileRequest, res: Response) => {
    console.log("[CreateQuiz] Request received");
    console.log(req.body);
    const socketId = req.body.socketId;
    const description = req.body.description || "No description provided";

    const userId = req.auth?.userId;
    if (!userId) {
      throw new ApiError(401, "Unauthorized: userId missing");
    }

    emitUpdate(socketId, "status", "Authenticating user…");

    const [getUserId] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId));
    if (!getUserId?.id) {
      throw new ApiError(401, "User not found");
    }

    emitUpdate(socketId, "status", "Checking for existing quiz…");

    const { title, query } = req.body;
    if (!title) {
      throw new ApiError(400, "Title is required");
    }

    const existingQuiz = await db
      .select()
      .from(quizzes)
      .where(and(eq(quizzes.title, title), eq(quizzes.userId, getUserId.id)));

    if (existingQuiz.length > 0) {
      throw new ApiError(400, "Quiz with this title already exists");
    }

    let docId = null;
    let fullDoc = "";

    if (req.files?.length !== 0) {
      emitUpdate(socketId, "status", "Processing uploaded files…");

      let allFiles: Express.Multer.File[] = [];
      docId = randomUUID();

      if (Array.isArray(req.files)) {
        allFiles = req.files;
      } else if (typeof req.files === "object") {
        for (const key of Object.keys(req.files)) {
          const val = req.files[key];
          if (Array.isArray(val)) {
            allFiles = allFiles.concat(val);
          }
        }
      }

      for (const file of allFiles) {
        const filePath = file.path;
        const fileType = file.mimetype;

        if (fileType === "application/pdf") {
          fullDoc += await processPdf(filePath, getUserId.id, docId, file);
        } else if (fileType === "text/plain") {
          const buffer = await fs.readFile(filePath);
          const chunktext = chunkText(buffer.toString(), 1000, 100);
          await upsertChunks(getUserId.id, docId, chunktext);
          fullDoc += chunktext.map((c) => c.text).join(" ");
        } else if (
          ["image/png", "image/jpg", "image/jpeg"].includes(fileType)
        ) {
          const data = await extractTextFromImage(filePath);
          const chunktext = chunkText(data, 1000, 100);
          await upsertChunks(getUserId.id, docId, chunktext);
          fullDoc += chunktext.map((c) => c.text).join(" ");
        } else {
          throw new ApiError(400, `Unsupported file type: ${fileType}`);
        }
      }
    }

    emitUpdate(socketId, "status", "Generating quiz with AiraAgent…");
    if (!query) throw new ApiError(500, "query not found ");
    const aira = await airaAgent.invoke(
      { input: { title, query }, usage: { webSearchesDone: 0 } },
      { configurable: { userId: getUserId.id, docId: docId || null } }
    );

    const { quiz: quizQuestions } = aira;
    if (!Array.isArray(quizQuestions) || quizQuestions.length === 0) {
      throw new ApiError(500, "Failed to generate quiz questions");
    }

    emitUpdate(socketId, "status", "Saving quiz to database…");
    const billing = await db
      .select()
      .from(billings)
      .where(eq(billings.userId, getUserId.id))
      .limit(1);

    const [currentUsage] = await db
      .select()
      .from(usage)
      .where(eq(usage.billingId, billing[0].id));

    await db
      .update(usage)
      .set({
        quizzesGeneratedUsed: (currentUsage?.quizzesGeneratedUsed ?? 0) + 1,
        websearchesUsed:
          (currentUsage?.websearchesUsed ?? 0) +
          (aira.usage?.webSearchesDone ?? 0),
        updatedAt: new Date(),
      })
      .where(eq(usage.billingId, billing[0].id));
    const quizId = randomUUID();
    await db.insert(quizzes).values({
      id: quizId,
      title,
      userId: getUserId.id,
      createdAt: new Date(),
      submitted: false,
      description: description,
    });

    const questionsData = quizQuestions.map((q) => ({
      id: randomUUID(),
      quizId,
      question: q.question,
      options: JSON.stringify(q.options),
      answer: q.answer,
      explanation: q.explanation ?? "",
      createdAt: new Date(),
      submittedAt: new Date(),
    }));

    await db.insert(questions).values(questionsData);

    emitUpdate(socketId, "status", "Quiz created successfully ✅");

    res.status(201).json({ quizId, questions: quizQuestions });
  }
);

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

    // Get all quizzes for user
    const userQuizzes = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.userId, user.id))
      .execute();

    // Attach questions properly
    const quizzesWithQuestions = await Promise.all(
      userQuizzes.map(async (quiz) => {
        const questionsList = await db
          .select()
          .from(questions)
          .where(eq(questions.quizId, quiz.id));

        return {
          ...quiz,
          /*parameter) quiz: {
    id: string;
    title: string;
    userId: string | null;
    createdAt: Date;
    submitted: boolean;
}*/
          questions: questionsList /*const questionsList: {
    id: string;
    quizId: string | null;
    question: string;
    options: string;
    answer: number;
    createdAt: Date;
    submittedAt: Date;
    explanation: string;
}[] */,
        };
      })
    );

    console.log(quizzesWithQuestions);
    res.json(quizzesWithQuestions);
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
