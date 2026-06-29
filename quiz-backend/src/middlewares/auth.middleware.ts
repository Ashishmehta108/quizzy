import { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../auth";
import { UserRepository } from "../repositories/user.repository";

const userRepo = new UserRepository();

/**
 * Middleware to resolve the internal database user from the Better Auth session.
 * Attaches the user object to req.user.
 */
export async function resolveUser(req: any, res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session || !session.user) {
      return res.status(401).json({ success: false, error: "Unauthorized: No active session found" });
    }

    const dbUser = await userRepo.getById(session.user.id);

    if (!dbUser) {
      return res.status(401).json({ success: false, error: "User record not found. Please sync your account." });
    }

    req.user = dbUser;
    next();
  } catch (error) {
    console.error("User resolution error:", error);
    res.status(500).json({ success: false, error: "Internal server error resolving user" });
  }
}

