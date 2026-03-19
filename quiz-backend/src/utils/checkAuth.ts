import { NextFunction, Request, Response } from "express";

export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new Error("Unauthenticated"));
  }
  console.log(req.user);
  console.log("checking if session exists");
  console.log(req.user.id);
  if (!req?.user?.id) {
    return next(new Error("Unauthenticated"));
  }
  next();
};
