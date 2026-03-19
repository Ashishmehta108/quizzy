/**
 * @layer middleware
 * @owner agent-1
 * @tables users
 * @description Middleware to resolve user from Clerk ID with Redis caching
 */
import { Request, Response, NextFunction } from "express";
import { UserRepository } from "../repositories/user.repository";
import { redisclient } from "../utils/redis";
import { ApiError } from "../utils/apiError";

const userRepo = new UserRepository();

interface CachedUser {
  id: string;
  clerkId: string;
  email: string | null;
  name: string;
  apiKey: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

const USER_CACHE_TTL = 300; // 5 minutes

/**
 * Get user from cache
 */
async function getCachedUser(clerkId: string): Promise<CachedUser | null> {
  try {
    const key = `user:cache:${clerkId}`;
    const cached = await redisclient.get(key);
    if (cached) {
      return JSON.parse(cached) as CachedUser;
    }
    return null;
  } catch (error) {
    console.error("Cache get error:", error);
    return null;
  }
}

/**
 * Set user in cache
 */
async function setCachedUser(
  clerkId: string,
  user: CachedUser
): Promise<void> {
  try {
    const key = `user:cache:${clerkId}`;
    await redisclient.setEx(key, USER_CACHE_TTL, JSON.stringify(user));
  } catch (error) {
    console.error("Cache set error:", error);
  }
}

/**
 * Invalidate user cache
 */
export async function invalidateUserCache(clerkId: string): Promise<void> {
  try {
    const key = `user:cache:${clerkId}`;
    await redisclient.del(key);
  } catch (error) {
    console.error("Cache invalidation error:", error);
  }
}

/**
 * Middleware to resolve the internal database user from the Clerk ID.
 * Uses Redis caching to reduce database load.
 * Attaches the user object to req.user.
 */
export async function resolveUser(
  req: any,
  res: Response,
  next: NextFunction
) {
  const clerkId = req.auth?.userId;

  if (!clerkId) {
    throw new ApiError(401, "Unauthorized: No token provided");
  }

  try {
    // Try cache first
    let user = await getCachedUser(clerkId);

    if (!user) {
      // Cache miss - fetch from database
      //@ts-ignore
      user = await userRepo.getByClerkId(clerkId);

      if (!user) {
        // Auto-sync: create user record if not exists
        const { authService } = await import("../services/auth.service");
        const syncResult = await authService.syncUser(clerkId);
        //@ts-ignore
        user = await userRepo.getByClerkId(clerkId);


        if (!user) {
          throw new ApiError(
            401,
            "User record not found. Please sync your account."
          );
        }
      }

      // Cache the user
      await setCachedUser(clerkId, user);
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("User resolution error:", error);
    if (error instanceof ApiError) {
      return next(error);
    }
    next(new ApiError(500, "Internal server error resolving user"));
  }
}

/**
 * Middleware to ensure user has an active workspace
 */
export async function ensureWorkspace(
  req: any,
  res: Response,
  next: NextFunction
) {
  try {
    const user = req.user;

    if (!user) {
      throw new ApiError(401, "User not resolved");
    }

    const { db } = await import("../config/db");
    const { workspaceMembers } = await import("../config/db/schema");
    const { eq } = await import("drizzle-orm");

    const memberships = await db
      .select()
      .from(workspaceMembers)
      .where(eq(workspaceMembers.userId, user.id));

    if (!memberships || memberships.length === 0) {
      throw new ApiError(403, "User has no active workspace");
    }

    req.userWorkspaces = memberships;
    next();
  } catch (error) {
    console.error("Workspace check error:", error);
    if (error instanceof ApiError) {
      return next(error);
    }
    next(new ApiError(500, "Internal server error checking workspace"));
  }
}
