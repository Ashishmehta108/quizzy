import { Request, Response, NextFunction } from "express";

export interface QuizRequest extends Request {
  body: {
    title?: string;
    query?: string;
    [key: string]: any;
  };
}

export type QuizResponse = Response;
export type QuizNextFunction = NextFunction;
