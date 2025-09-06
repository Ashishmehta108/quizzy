import { NextFunction, Request, Response } from "express";

export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.auth) {
    return next(new Error("Unauthenticated"));
  }
  console.log("checking if session exists");
  if (!req?.auth?.userId) {
    return next(new Error("Unauthenticated"));
  }
  next();
};
