import { db } from "../config/db";
import {
  quizzes,
  questions,
  users,
  usage,
  billings,
  documents,
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
import extractTextFromImage from "../utils/ocr";
import { io } from "../server";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { airaAgent } from "../ai/agent/airaAgent";

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
    webSearch?: string;
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
    try {
      console.log("[CreateQuiz] Request received:", req.body);

      const websearch = req.body.webSearch === "true";
      const socketId = req.body.socketId;
      const description = req.body.description || "No description provided";
      const userId = req.auth?.userId;
      if (!userId) throw new ApiError(401, "Unauthorized: userId missing");

      emitUpdate(socketId, "status", "Creating quiz request recieved ");

      const [getUser] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, userId));

      if (!getUser?.id) throw new ApiError(401, "User not found");

      const { title, query } = req.body;
      if (!title) throw new ApiError(400, "Title is required");

      const existingQuiz = await db
        .select()
        .from(quizzes)
        .where(and(eq(quizzes.title, title), eq(quizzes.userId, getUser.id)));

      if (existingQuiz.length > 0) {
        emitUpdate(socketId, "status", "Quiz with this title already exists");
        throw new ApiError(400, "Quiz with this title already exists");
      }

      let docIds: string[] = [];
      let fullDoc = "";

      if (req.files && Object.keys(req.files).length > 0) {
        emitUpdate(socketId, "status", "Processing uploaded files…");

        const allFiles: Express.Multer.File[] = Array.isArray(req.files)
          ? req.files
          : (Object.values(req.files).flat() as Express.Multer.File[]);

        for (const file of allFiles) {
          const filePath = file.path;
          const fileType = file.mimetype;
          const documentId = randomUUID();
          docIds.push(documentId);

          if (fileType === "application/pdf") {
            fullDoc += await processPdf(filePath, getUser.id, documentId, file);
          } else if (fileType === "text/plain") {
            const buffer = await fs.readFile(filePath);
            const chunks = chunkText(buffer.toString(), 1000, 100);
            await upsertChunks(getUser.id, documentId, chunks);
            await db.insert(documents).values({
              id: documentId,
              title,
              userId: getUser.id,
              content: chunks.map((c) => c.text).join(" "),
              uploadUrl: "",
              createdAt: new Date(),
            });
            fullDoc += chunks.map((c) => c.text).join(" ");
          } else if (
            ["image/png", "image/jpg", "image/jpeg"].includes(fileType)
          ) {
            const data = await extractTextFromImage(filePath);
            const chunks = chunkText(data, 1000, 100);
            await upsertChunks(getUser.id, documentId, chunks);
            await db.insert(documents).values({
              id: documentId,
              title,
              userId: getUser.id,
              content: chunks.map((c) => c.text).join(" "),
              uploadUrl: "",
              createdAt: new Date(),
            });
            fullDoc += chunks.map((c) => c.text).join(" ");
          } else {
            throw new ApiError(400, `Unsupported file type: ${fileType}`);
          }
        }
      }

      emitUpdate(socketId, "status", "Generating quiz with AiraAgent…");

      if (!query) throw new ApiError(400, "Query not found");

      const aira = await airaAgent.invoke(
        { input: { title, query }, usage: { webSearchesDone: 0 } },
        {
          configurable: {
            userId: getUser.id,
            docIds,
            websearchOn: websearch,
          },
        }
      );

      const { quiz: quizQuestions } = aira;
      if (!Array.isArray(quizQuestions) || quizQuestions.length === 0)
        throw new ApiError(500, "Failed to generate quiz questions");

      emitUpdate(socketId, "status", "Saving quiz to database…");

      const [billing] = await db
        .select()
        .from(billings)
        .where(eq(billings.userId, getUser.id))
        .limit(1);

      const [currentUsage] = await db
        .select()
        .from(usage)
        .where(eq(usage.billingId, billing.id));

      await db
        .update(usage)
        .set({
          quizzesGeneratedUsed: (currentUsage?.quizzesGeneratedUsed ?? 0) + 1,
          websearchesUsed:
            (currentUsage?.websearchesUsed ?? 0) +
            (aira.usage?.webSearchesDone ?? 0),
          updatedAt: new Date(),
        })
        .where(eq(usage.billingId, billing.id));

      const quizId = randomUUID();
      await db.insert(quizzes).values({
        id: quizId,
        title,
        userId: getUser.id,
        createdAt: new Date(),
        submitted: false,
        description,
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
    } catch (err: any) {
      console.error("[CreateQuiz] Error:", err);

      res
        .status(err.statusCode || 500)
        .json({ error: err.message || "Internal Server Error" });
    } finally {
      const deleteUploadedFiles = async (files: Express.Multer.File[]) => {
        for (const file of files) {
          try {
            await fs.unlink(file.path);
            console.log("Deleted file:", file.path);
          } catch (err: any) {
            console.error("Failed to delete file:", file.path, err);
          }
        }
      };
      deleteUploadedFiles(
        Array.isArray(req.files)
          ? req.files
          : (Object.values(req.files || {}).flat() as Express.Multer.File[])
      );
    }
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

    const userQuizzes = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.userId, user.id))
      .execute();

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
