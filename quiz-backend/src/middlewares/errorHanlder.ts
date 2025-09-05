import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(new ApiResponse(false, err.message));
  }
  
  return res.status(500).json(new ApiResponse(false, "Internal Server Error"));
};
