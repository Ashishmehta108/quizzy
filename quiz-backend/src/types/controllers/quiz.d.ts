import { Request, Response } from 'express';
import { User } from '../db/schema';

export interface AuthenticatedRequest extends Request {
  auth: {
    userId: string;
  };
  files?: Express.Multer.File[];
  body: {
    title?: string;
    query?: string;
    [key: string]: any;
  };
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface GenerateQuizQuestionsParams {
  title: string;
  context: string;
  morecontext: string;
}

export interface CreateQuizResponse {
  quizId: string;
  questions: QuizQuestion[];
}

export const createQuiz: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export const getQuizzes: (req: AuthenticatedRequest, res: Response) => Promise<void>;
