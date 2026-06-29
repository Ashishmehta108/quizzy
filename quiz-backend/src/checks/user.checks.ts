import { db } from "../config/db";
import { user as userTable } from "../config/db/schema";
import { asyncHandler } from "../utils/asyncHandler";
import { eq } from "drizzle-orm";
import { ApiError } from "../utils/apiError";

export const userChecks = asyncHandler(async (req, res, next) => {
  const authUser = (req as any).betterAuthUser;

  if (!authUser?.id) {
    throw new ApiError(401, "Unauthorized: User ID missing");
  }

  const [user] = await db.select().from(userTable).where(eq(userTable.id, authUser.id));
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  if (user.isBanned) {
    throw new ApiError(403, "Access denied: User is banned");
  }
  next();
});
