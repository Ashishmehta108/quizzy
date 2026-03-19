/**
 * @layer middleware
 * @owner agent-1
 * @tables users
 */
import { Request, Response, NextFunction } from "express";
import { UserRepository } from "../repositories/user.repository";

const userRepo = new UserRepository();

/**
 * Middleware to resolve the internal database user from the Clerk ID.
 * Attaches the user object to req.user.
 */
export async function resolveUser(req: any, res: Response, next: NextFunction) {
  const clerkId = req.auth?.userId;

  if (!clerkId) {
    return res.status(401).json({ success: false, error: "Unauthorized: No token provided" });
  }

  try {
    const user = await userRepo.getByClerkId(clerkId);

    if (!user) {
      // In a real app, you might want to auto-sync here OR redirect to a sync endpoint
      return res.status(401).json({ success: false, error: "User record not found. Please sync your account." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("User resolution error:", error);
    res.status(500).json({ success: false, error: "Internal server error resolving user" });
  }
}
