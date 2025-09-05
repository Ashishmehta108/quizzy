import { db } from "@/config/db";
import { results, users, billings, plans, usage } from "@/config/db/schema";
import { processActivityData, Result } from "@/services/activity.service";
import { ApiError } from "@/utils/apiError";
import { asyncHandler } from "@/utils/asyncHandler";
import { and, eq, gte } from "drizzle-orm";
import { Router } from "express";

export const utilityRouter = Router();

utilityRouter.route("/activityData").post(
  asyncHandler(async (req, res) => {
    try {
      console.log("[ActivityData] Request received");
      const userId = req.auth?.userId;
      const { resultId } = req.body;

      console.log("[ActivityData] userId:", userId, "resultId:", resultId);
      if (!userId) throw new ApiError(400, "Missing userId in request body");

      const [user] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.clerkId, userId));
      console.log("[ActivityData] User fetched:", user);
      if (!user) throw new ApiError(404, "User not found");

      const date30DaysAgo = new Date();
      date30DaysAgo.setDate(date30DaysAgo.getDate() - 30);
      console.log("[ActivityData] date30DaysAgo:", date30DaysAgo);

      const selectCols = {
        id: results.id,
        quizId: results.quizId,
        userId: results.userId,
        score: results.score,
        optionsReview: results.optionsReview,
        submittedAt: results.submittedAt,
      };

      let dbResults;
      if (resultId) {
        console.log("[ActivityData] Fetching single result by resultId");
        dbResults = await db
          .select(selectCols)
          .from(results)
          .where(
            and(
              eq(results.id, resultId),
              eq(results.userId, user.id),
              gte(results.submittedAt, date30DaysAgo)
            )
          );
      } else {
        console.log("[ActivityData] Fetching all results in last 30 days");
        dbResults = await db
          .select(selectCols)
          .from(results)
          .where(
            and(
              eq(results.userId, user.id),
              gte(results.submittedAt, date30DaysAgo)
            )
          );
      }

      console.log("[ActivityData] dbResults fetched:", dbResults?.length);
      if (!dbResults || dbResults.length === 0) {
        return res.json({ success: false, data: [] });
      }

      const resultData: Result[] = dbResults.map((r) => ({
        ...r,
        quizId: r.quizId ?? "",
        userId: r.userId ?? "",
      }));

      const data = processActivityData(resultData);
      console.log("[ActivityData] Processed data:", data.length);

      res.json({ success: true, data });
    } catch (err) {
      console.error("[ActivityData] Error:", err);
      throw err;
    }
  })
);

utilityRouter.route("/usage").post(
  asyncHandler(async (req, res) => {
    try {
      console.log("[Usage] Request received");
      const userId = req.auth?.userId;
      console.log("[Usage] userId:", userId);

      if (!userId) throw new ApiError(400, "Missing userId in request body");

      const [user] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.clerkId, userId));
      console.log("[Usage] User fetched:", user);
      if (!user) throw new ApiError(404, "User not found");

      const [billing] = await db
        .select({
          id: billings.id,
          planId: billings.planId,
          status: billings.status,
          startDate: billings.startDate,
          endDate: billings.endDate,
        })
        .from(billings)
        .where(eq(billings.userId, user.id));
      console.log("[Usage] Billing fetched:", billing);
      if (!billing) throw new ApiError(404, "No billing found for this user");

      const [plan] = await db
        .select({
          id: plans.id,
          name: plans.name,
          description: plans.description,
          price: plans.price,
          currency: plans.currency,
          monthlyLimit: plans.monthlyLimit,
        })
        .from(plans)
        .where(eq(plans.id, billing.planId));
      console.log("[Usage] Plan fetched:", plan);
      if (!plan) throw new ApiError(404, "Plan not found");

      const [billingUsage] = await db
        .select({
          websearchesUsed: usage.websearchesUsed,
          quizzesGeneratedUsed: usage.quizzesGeneratedUsed,
          periodStart: usage.periodStart,
          periodEnd: usage.periodEnd,
        })
        .from(usage)
        .where(eq(usage.billingId, billing.id));
      console.log("[Usage] Usage fetched:", billingUsage);

      res.json({
        success: true,
        data: {
          billing: {
            id: billing.id,
            status: billing.status,
            startDate: billing.startDate,
            endDate: billing.endDate,
          },
          plan,
          usage: billingUsage || {
            websearchesUsed: 0,
            quizzesGeneratedUsed: 0,
            periodStart: null,
            periodEnd: null,
          },
        },
      });
    } catch (err) {
      console.error("[Usage] Error:", err);
      throw err;
    }
  })
);
