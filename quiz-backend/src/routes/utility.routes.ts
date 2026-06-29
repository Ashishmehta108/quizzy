import { db } from "../config/db";
import { results, user as userTable, billings, plans, usage } from "../config/db/schema";
import { processActivityData, Result } from "../services/activity.service";
import { ApiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";
import { and, eq, gte } from "drizzle-orm";
import { Router } from "express";
import { checkAuth } from "../utils/checkAuth";

export const utilityRouter = Router();

/**
 * Generates plausible demo activity for the last 30 days so a brand-new user's
 * dashboard (heatmap, streaks, performance trend) renders meaningfully.
 * This is ephemeral — it is not persisted to the database.
 */
function generateSeedActivity() {
  const days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date;
  });

  return days.map((date, i) => {
    const dateKey = date.toISOString().split("T")[0];
    // ~60% of days active, with a stronger trailing streak near "today"
    const isRecent = i >= 25;
    const active = isRecent ? Math.random() < 0.85 : Math.random() < 0.5;
    const quizzes = active ? 1 + Math.floor(Math.random() * 4) : 0;
    const score = quizzes > 0 ? 55 + Math.floor(Math.random() * 45) : 0;
    return {
      date: dateKey,
      name: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      quizzes,
      score,
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
    };
  });
}

utilityRouter.route("/activityData").post(checkAuth,
  asyncHandler(async (req, res) => {
    try {
      console.log("[ActivityData] Request received");
      const authUser = (req as any).betterAuthUser;
      const { resultId } = req.body;

      console.log("[ActivityData] userId:", authUser?.id, "resultId:");
      if (!authUser?.id) throw new ApiError(400, "Missing userId in request");

      const userId = authUser.id;

      const date30DaysAgo = new Date();
      date30DaysAgo.setDate(date30DaysAgo.getDate() - 30);
      console.log("[ActivityData] date30DaysAgo:");

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
              eq(results.userId, userId),
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
              eq(results.userId, userId),
              gte(results.submittedAt, date30DaysAgo)
            )
          );
      }

      console.log("[ActivityData] dbResults fetched:");
      if (!dbResults || dbResults.length === 0) {
        // No real activity yet — return seeded demo data so the dashboard
        // (heatmap, streaks, performance trend) renders meaningfully.
        return res.json({ success: true, data: generateSeedActivity(), seeded: true });
      }

      const resultData: Result[] = dbResults.map((r) => {
        const totalQuestions = r.optionsReview
          ? JSON.parse(r.optionsReview).length
          : 1;
        const percentageScore = Math.round((r.score / totalQuestions) * 100);

        return {
          ...r,
          score: percentageScore,
          quizId: r.quizId ?? "",
          userId: r.userId ?? "",
        };
      });

      const data = processActivityData(resultData);
      console.log("[ActivityData] Processed data:");

      res.json({ success: true, data });
    } catch (err) {
      console.error("[ActivityData] Error:", err);
      throw err;
    }
  })
);

utilityRouter.route("/usage").post(checkAuth,
  asyncHandler(async (req, res) => {
    try {
      console.log("[Usage] Request received");
      const authUser2 = (req as any).betterAuthUser;
      console.log("[Usage] userId:", authUser2?.id);

      if (!authUser2?.id) throw new ApiError(400, "Missing userId in request");

      const userId2 = authUser2.id;

      const [billing] = await db
        .select({
          id: billings.id,
          planId: billings.planId,
          status: billings.status,
          startDate: billings.startDate,
          endDate: billings.endDate,
        })
        .from(billings)
        .where(eq(billings.userId, userId2));
      console.log("[Usage] Billing fetched:");

      if (!billing) {
        // User hasn't been synced yet — return free-tier defaults so UI doesn't break
        const [freePlan] = await db.select().from(plans).where(eq(plans.name, "Free")).limit(1);
        return res.json({
          success: true,
          data: {
            billing: null,
            plan: freePlan ? {
              ...freePlan,
              monthlyLimit: {
                quizzesGenerated: freePlan.maxAiGenerations,
                websearches: freePlan.maxWebsearches,
              },
            } : null,
            usage: { websearchesUsed: 0, quizzesGeneratedUsed: 0, periodStart: null, periodEnd: null },
          },
        });
      }

      const [plan] = await db
        .select({
          id: plans.id,
          name: plans.name,
          description: plans.description,
          price: plans.price,
          currency: plans.currency,
          maxAiGenerations: plans.maxAiGenerations,
          maxWebsearches: plans.maxWebsearches,
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
      console.log("[Usage] Usage fetched:");

      res.json({
        success: true,
        data: {
          billing: {
            id: billing.id,
            status: billing.status,
            startDate: billing.startDate,
            endDate: billing.endDate,
          },
          plan: {
            ...plan,
            monthlyLimit: {
              quizzesGenerated: (plan as any).maxAiGenerations,
              websearches: (plan as any).maxWebsearches,
            }
          },
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
