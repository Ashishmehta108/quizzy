import { db } from "../config/db";
import { users } from "../config/db/schema";
import { asyncHandler } from "../utils/asyncHandler";
import { eq } from "drizzle-orm";
import { ApiError } from "../utils/apiError";

export const userChecks = asyncHandler(async (req, res, next) => {
  const userId = req.auth?.userId;

  if (!userId) {
    throw new ApiError(401, "Unauthorized: User ID missing");
  }
  const [user] = await db.select().from(users).where(eq(users.clerkId, userId));
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  if (user.isBanned) {
    throw new ApiError(403, "Access denied: User is banned");
  }
  next();
});
