import { db } from "../config/db";
import {
  quizzes,
  questions,
  users,
  usage,
  billings,
  documents,
  results,
} from "../config/db/schema";
import { and, eq, inArray } from "drizzle-orm";
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
import { checkEntitlement } from "../services/entitlements.service";
import { quizGenerationQueue } from "../queues/quiz.queue";
import type { QuizGenerationJob } from "../queues/quiz.queue";

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

export const createQuiz = asyncHandler(async (req: FileRequest, res: Response) => {
  try {
    console.log("[CreateQuiz] Request received:", req.body);

    const websearch = req.body.webSearch === "true";
    const socketId = req.body.socketId;
    const description = req.body.description || "No description provided";
    const userId = req.user?.id;
    if (!userId) throw new ApiError(401, "Unauthorized: userId missing");

    // Use workspace from middleware (already validated membership)
    const workspaceId = req.workspace?.id;
    if (!workspaceId) throw new ApiError(400, "Workspace context missing. Please ensure resolveWorkspace middleware is applied.");

    const entitlement = await checkEntitlement(workspaceId, "ai_generation");
    if (!entitlement.allowed) {
      throw new ApiError(403, `You have reached your limit of ${entitlement.limit} AI generations for this plan. Please upgrade.`);
    }

    const getUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const user = getUser[0];
    if (!user?.id) throw new ApiError(401, "User not found");

    const { title, query } = req.body;
    if (!title) throw new ApiError(400, "Title is required");
    if (!query) throw new ApiError(400, "Query is required");

    // Check for existing quiz with same title in this workspace
    const existingQuiz = await db
      .select()
      .from(quizzes)
      .where(and(
        eq(quizzes.title, title),
        eq(quizzes.workspaceId, workspaceId)
      ));

    if (existingQuiz.length > 0) {
      throw new ApiError(400, "Quiz with this title already exists in this workspace");
    }

    // Prepare files for job
    const filesForJob: QuizGenerationJob["files"] = [];
    if (req.files && Object.keys(req.files).length > 0) {
      const allFiles: Express.Multer.File[] = Array.isArray(req.files)
        ? req.files
        : (Object.values(req.files).flat() as Express.Multer.File[]);

      for (const file of allFiles) {
        filesForJob.push({
          path: file.path,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          buffer: file.buffer,
        });
      }
    }

    // Add job to queue
    const job = await quizGenerationQueue.add(
      "generate-quiz",
      {
        userId: user.id,
        clerkId: userId,
        title,
        query,
        description,
        webSearch: websearch,
        socketId,
        files: filesForJob,
        workspaceId,
      } as QuizGenerationJob,
      {
        jobId: randomUUID(),
      }
    );

    // Return immediately with job ID
    res.status(202).json({
      jobId: job.id,
      status: "processing",
      message: "Quiz generation started. Listen to WebSocket for updates.",
    });
  } catch (err: any) {
    console.error("[CreateQuiz] Error:", err);

    // Clean up uploaded files on error
    if (req.files) {
      const deleteUploadedFiles = async (files: Express.Multer.File[]) => {
        for (const file of files) {
          try {
            await fs.unlink(file.path);
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

    res
      .status(err.statusCode || 500)
      .json({ error: err.message || "Internal Server Error" });
  }
});

export const getQuizzes = async (req: QuizRequest, res: QuizResponse) => {
  try {
    const userId = req.user?.id!;
    const workspaceId = req.workspace?.id;

    if (!workspaceId) {
      return res.status(400).json({ 
        success: false,
        error: "Workspace context missing" 
      });
    }

    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const user = userResult[0];
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: "User not found" 
      });
    }

    // Get all quizzes for the workspace (not just user's quizzes)
    const workspaceQuizzes = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.workspaceId, workspaceId))
      .execute();

    if (workspaceQuizzes.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // Get all results in a single query
    const allResults = await db
      .select()
      .from(results)
      .where(eq(results.userId, user.id));

    // FIXED: Batch load all questions in a single query instead of N+1
    const allQuestions = await db
      .select()
      .from(questions)
      .where(inArray(questions.quizId, workspaceQuizzes.map(q => q.id)));

    // Group questions by quizId for efficient lookup
    const questionsByQuiz = new Map<string, typeof allQuestions>();
    for (const question of allQuestions) {
      const existing = questionsByQuiz.get(question.quizId!) || [];
      existing.push(question);
      questionsByQuiz.set(question.quizId!, existing);
    }

    // Map results by quizId for quick lookup
    const resultsByQuiz = new Map<string, string>();
    for (const result of allResults) {
      if (result.quizId) {
        resultsByQuiz.set(result.quizId, result.id);
      }
    }

    // Build response without additional queries
    const quizzesWithQuestions = workspaceQuizzes.map((quiz) => ({
      ...quiz,
      questions: questionsByQuiz.get(quiz.id) || [],
      resultId: resultsByQuiz.get(quiz.id) || "",
    }));

    res.json({ success: true, data: quizzesWithQuestions });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    res.status(500).json({ 
      success: false,
      error: "Internal server error" 
    });
  }
};

export const getJobStatus = asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;

  const job = await import("../queues/quiz.queue").then(m => m.getJobStatus(jobId));

  if (!job) {
    throw new ApiError(404, "Job not found");
  }

  res.json(job);
});

/**
 * Get quiz by ID with workspace validation
 * - Validates that the quiz belongs to the requesting user's workspace
 * - Returns 404 if quiz doesn't exist or doesn't belong to workspace
 */
export const getQuizById = asyncHandler(async (req: QuizRequest, res: QuizResponse) => {
  const { id } = req.params;
  const userId = req.user?.id;
  const workspaceId = req.workspace?.id;

  if (!id) {
    return res.status(400).json({ 
      success: false,
      error: "Quiz ID is required" 
    });
  }
  
  if (!userId) {
    return res.status(401).json({ 
      success: false,
      error: "Unauthorized: User not authenticated" 
    });
  }

  if (!workspaceId) {
    return res.status(400).json({ 
      success: false,
      error: "Workspace context missing" 
    });
  }

  // Fetch quiz with workspace validation
  const [quizRecord] = await db
    .select()
    .from(quizzes)
    .where(
      and(
        eq(quizzes.id, id),
        eq(quizzes.workspaceId, workspaceId)
      )
    );

  if (!quizRecord) {
    // Return 404 instead of 201 for non-existent quizzes
    return res.status(404).json({
      success: false,
      error: "Quiz not found or access denied"
    });
  }

  // Fetch questions for this quiz
  const questionsList = await db
    .select()
    .from(questions)
    .where(eq(questions.quizId, id));

  return res.json({ 
    success: true,
    data: { 
      quiz: quizRecord, 
      questions: questionsList 
    } 
  });
});
