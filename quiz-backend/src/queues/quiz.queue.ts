import { Queue, Job } from "bullmq";
import type { RedisOptions } from "ioredis";

// Redis connection options for BullMQ
const redisConnection: RedisOptions = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  maxRetriesPerRequest: 3,
};

export interface QuizGenerationJob {
  userId: string;
  clerkId: string;
  title: string;
  query: string;
  description: string;
  webSearch: boolean;
  socketId?: string;
  files?: Array<{
    path: string;
    originalname: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
  }>;
  workspaceId: string;
}

export interface QuizGenerationResult {
  quizId: string;
  questions: Array<{
    question: string;
    options: string[];
    answer: number;
    explanation: string;
  }>;
}

// Quiz generation queue
export const quizGenerationQueue = new Queue<QuizGenerationJob, QuizGenerationResult>(
  "quiz-generation",
  {
    connection: redisConnection,
    defaultJobOptions: {
      attempts: 2,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
      removeOnComplete: {
        count: 100, // Keep last 100 completed jobs
      },
      removeOnFail: {
        age: 24 * 3600, // Keep failed jobs for 24 hours
      },
    },
  }
);

// Job status tracking
export interface JobStatus {
  status: "waiting" | "active" | "completed" | "failed";
  progress: number;
  message: string;
  error?: string;
  result?: QuizGenerationResult;
}

export async function getJobStatus(jobId: string): Promise<JobStatus | null> {
  const job = await Job.fromId<QuizGenerationJob, QuizGenerationResult>(quizGenerationQueue, jobId);
  
  if (!job) return null;

  const state = await job.getState();
  const progress = typeof job.progress === 'number' ? job.progress : 0;
  
  return {
    status: state as JobStatus["status"],
    progress,
    message: job.returnvalue?.quizId 
      ? "Quiz generated successfully" 
      : state === "failed" 
        ? job.failedReason || "Job failed"
        : "Processing...",
    error: job.failedReason,
    result: job.returnvalue,
  };
}

export async function cancelJob(jobId: string): Promise<boolean> {
  const job = await Job.fromId<QuizGenerationJob, QuizGenerationResult>(quizGenerationQueue, jobId);
  if (job) {
    await job.remove();
    return true;
  }
  return false;
}
