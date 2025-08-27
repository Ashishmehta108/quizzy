import "express";
import { User } from "@clerk/express";

declare global {
  namespace Express {
    interface Request {
      auth?: { userId: string };
      file?: Express.Multer.File;
    }
  }
}
