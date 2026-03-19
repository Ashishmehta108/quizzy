import { Worker, Job } from "bullmq";
import { redis } from "../config/redis";
import { db } from "../config/db";
import {
  quizzes,
  questions,
  users,
  usage,
  billings,
  documents,
} from "../config/db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { processPdf } from "../ai/parsedoc/doc";
import { upsertChunks } from "../ai/pinecone";
import { chunkText } from "../utils/chunk";
import fs from "fs/promises";
import { airaAgent } from "../ai/agent/airaAgent";
import type { QuizGenerationJob, QuizGenerationResult } from "../queues/quiz.queue";
import { emitToSocket } from "../utils/socketEmitter";

// Redis connection for worker
const redisConnection = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  maxRetriesPerRequest: 3,
};

const emitUpdate = (
  socketId: string | undefined,
  event: string,
  message: string,
  step?: number
) => {
  if (socketId) {
    emitToSocket(socketId, event, { message, step });
  } else {
    emitToSocket("broadcast", event, { message, step });
  }
};

async function processFiles(
  files: QuizGenerationJob["files"],
  userId: string,
  title: string
): Promise<{ docIds: string[]; fullDoc: string }> {
  const docIds: string[] = [];
  let fullDoc = "";

  if (!files || files.length === 0) {
    return { docIds, fullDoc };
  }

  // Process files in parallel with concurrency limit
  const CONCURRENCY_LIMIT = 3;
  const results = await processWithConcurrency(
    files,
    CONCURRENCY_LIMIT,
    async (file) => {
      const documentId = randomUUID();
      docIds.push(documentId);

      if (file.mimetype === "application/pdf") {
        const text = await processPdf(file.path, userId, documentId, {
          buffer: file.buffer,
          mimetype: file.mimetype,
          path: file.path,
          originalname: file.originalname,
          size: file.size,
          fieldname: "files",
          filename: file.originalname,
          encoding: "7bit",
          stream: null as any,
          destination: "",
        });
        fullDoc += text;
      } else if (file.mimetype === "text/plain") {
        const buffer = await fs.readFile(file.path);
        const chunks = chunkText(buffer.toString(), 1000, 100);
        await upsertChunks(userId, documentId, chunks);
        await db.insert(documents).values({
          id: documentId,
          title,
          userId,
          content: chunks.map((c) => c.text).join(" "),
          uploadUrl: "",
          createdAt: new Date(),
        });
        fullDoc += chunks.map((c) => c.text).join(" ");
      } else if (
        ["image/png", "image/jpg", "image/jpeg"].includes(file.mimetype)
      ) {
        const extractTextFromImage = await import("../utils/ocr");
        const data = await extractTextFromImage.default(file.path);
        const chunks = chunkText(data, 1000, 100);
        await upsertChunks(userId, documentId, chunks);
        await db.insert(documents).values({
          id: documentId,
          title,
          userId,
          content: chunks.map((c) => c.text).join(" "),
          uploadUrl: "",
          createdAt: new Date(),
        });
        fullDoc += chunks.map((c) => c.text).join(" ");
      }

      // Clean up temp file
      try {
        await fs.unlink(file.path);
      } catch (err) {
        console.error("Failed to delete temp file:", file.path, err);
      }

      return { docId: documentId, text: fullDoc };
    }
  );

  return { docIds, fullDoc };
}

async function processWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  const executing: Promise<void>[] = [];

  for (let i = 0; i < items.length; i++) {
    const p = Promise.resolve().then(async () => {
      results[i] = await fn(items[i], i);
      executing.splice(executing.indexOf(p), 1);
    });
    executing.push(p);

    if (executing.length >= limit) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
  return results;
}

export const quizWorker = new Worker<QuizGenerationJob, QuizGenerationResult>(
  "quiz-generation",
  async (job) => {
    const { userId, clerkId, title, query, description, webSearch, socketId, files, workspaceId } = job.data;

    try {
      await job.updateProgress(10);
      emitUpdate(socketId, "status", "Processing uploaded files…", 1);

      // Get user
      const [getUser] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, clerkId));

      if (!getUser?.id) {
        throw new Error("User not found");
      }

      // Check for existing quiz with same title
      const existingQuiz = await db
        .select()
        .from(quizzes)
        .where(and(eq(quizzes.title, title), eq(quizzes.userId, getUser.id)));

      if (existingQuiz.length > 0) {
        throw new Error("Quiz with this title already exists");
      }

      // Process files
      await job.updateProgress(30);
      emitUpdate(socketId, "status", "Processing uploaded files…", 2);

      const { docIds, fullDoc } = await processFiles(files, getUser.id, title);

      // Generate quiz with AI
      await job.updateProgress(50);
      emitUpdate(socketId, "status", "Generating quiz with AiraAgent…", 3);

      const aira = await airaAgent.invoke(
        { input: { title, query }, usage: { webSearchesDone: 0 } },
        {
          configurable: {
            userId: getUser.id,
            docIds,
            websearchOn: webSearch,
          },
        }
      );

      const { quiz: quizQuestions } = aira;
      if (!Array.isArray(quizQuestions) || quizQuestions.length === 0) {
        throw new Error("Failed to generate quiz questions");
      }

      // Update usage
      await job.updateProgress(80);
      emitUpdate(socketId, "status", "Saving quiz to database…", 4);

      const [billing] = await db
        .select()
        .from(billings)
        .where(eq(billings.userId, getUser.id))
        .limit(1);

      if (billing) {
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
      }

      // Create quiz
      const quizId = randomUUID();
      await db.insert(quizzes).values({
        id: quizId,
        title,
        userId: getUser.id,
        createdAt: new Date(),
        submitted: false,
        description,
      });

      // Create questions
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

      await job.updateProgress(100);
      emitUpdate(socketId, "status", "Quiz created successfully ✅", 5);

      return {
        quizId,
        questions: quizQuestions.map(q => ({
          question: q.question,
          options: q.options,
          answer: q.answer,
          explanation: q.explanation ?? "",
        })),
      };
    } catch (error) {
      console.error("[QuizWorker] Error:", error);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 3, // Process 3 jobs concurrently
  }
);

quizWorker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed`);
  // Emit quiz completion event to frontend
  if (job.data.socketId && job.returnvalue) {
    emitToSocket(job.data.socketId, "quiz_completed", {
      jobId: job.id,
      quizId: job.returnvalue.quizId,
      questionCount: job.returnvalue.questions.length,
    });
  }
});

quizWorker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
  if (job?.data.socketId) {
    emitUpdate(job.data.socketId, "status", `Failed: ${err.message}`, -1);
    emitToSocket(job.data.socketId, "quiz_failed", {
      jobId: job.id,
      error: err.message,
    });
  }
});

quizWorker.on("error", (err) => {
  console.error("Worker error:", err);
});

export default quizWorker;
