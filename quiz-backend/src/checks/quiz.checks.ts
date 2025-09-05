import { db } from "@/config/db";
import { quizzes, users, billings, plans, usage } from "@/config/db/schema";
import { ApiError } from "@/utils/apiError";
import { asyncHandler } from "@/utils/asyncHandler";
import { and, eq } from "drizzle-orm";

// Middleware to check if user can create a quiz
export const quizChecks = asyncHandler(async (req, res, next) => {
  const { title, query } = req.body;
  const userId = req.auth?.userId;

  if (!userId) throw new ApiError(401, "Unauthorized: User ID missing");
  if (!title) throw new ApiError(400, "Quiz title is required");
  if (!query) throw new ApiError(400, "Quiz query/description is required");

  // Check if quiz with same title already exists
  const [existingQuiz] = await db
    .select({ title: quizzes.title })
    .from(quizzes)
    .where(and(eq(quizzes.title, title), eq(quizzes.userId, userId)));

  if (existingQuiz) {
    throw new ApiError(409, "Quiz with this title already exists");
  }

  // Optionally: check active subscription & usage
  const [activeBilling] = await db
    .select()
    .from(billings)
    .where(and(eq(billings.userId, userId), eq(billings.status, "active")));

  if (!activeBilling) throw new ApiError(403, "No active subscription found");

  const [userPlan] = await db
    .select()
    .from(plans)
    .where(eq(plans.id, activeBilling.planId));

  if (!userPlan) throw new ApiError(403, "Plan not found");

  const [currentUsage] = await db
    .select()
    .from(usage)
    .where(eq(usage.billingId, activeBilling.id));

  const quizzesUsed = currentUsage?.quizzesGeneratedUsed ?? 0;
  //@ts-ignore
  const quizzesLimit = userPlan.monthlyLimit.quizzesGenerated;

  if (quizzesUsed >= quizzesLimit) {
    throw new ApiError(403, "Monthly quiz generation limit reached");
  }

  // Everything is OK — move to next middleware
  next();
});
