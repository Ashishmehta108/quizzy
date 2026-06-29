import "express";
import { GetUser } from "../config/db/schema";

declare global {
  namespace Express {
    interface Request {
      betterAuthUser?: { id: string; email: string; name: string; emailVerified: boolean; image?: string | null; createdAt: Date; updatedAt: Date };
      user?: GetUser;
      file?: Express.Multer.File;
    }
  }
}
