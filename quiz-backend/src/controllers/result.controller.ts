import { db } from "../config/db/index";
import { quizzes, results, users } from "../config/db/schema";
import { and, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { calculateResult } from "../utils/calculateresult";
import { Request, Response } from "express";
import { ApiError } from "../utils/apiError";

export const PostResult = async (req: Request, res: Response) => {
  try {
    const { totalScore, optionsFilled, quizId } = req.body;

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!user || user.length === 0) return res.status(404).json({ error: "User not found" });

    const [quiz] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, quizId));
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    const resultId = randomUUID();
    const [result] = await db
      .insert(results)
      .values({
        id: resultId,
        optionsReview: optionsFilled,
        score: totalScore,
        quizId,
        userId: user.id,
        submittedAt: new Date(),
      })
      .returning();

    await db
      .update(quizzes)
      .set({ submitted: true })
      .where(eq(quizzes.id, quizId));

    res.status(201).json({ data: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to create result" });
  }
};

export const GetResults = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    console.log(user);
    if (!user || user.length === 0) return res.status(404).json({ error: "User not found" });

    const data = await db
      .select()
      .from(results)
      .where(eq(results.userId, user.id));

    if (!data.length) return res.json({ data: [] });

    const quizTitles = await Promise.all(
      data.map(async (result) => {
        const [quiz] = await db
          .select()
          .from(quizzes)
          .where(eq(quizzes.id, result.quizId!));
        return { title: quiz?.title || "", ...result };
      })
    );

    res.json({ data: quizTitles });
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error.message || "Failed to fetch results", data: [] });
  }
};

export const GetResultById = async (req: Request, res: Response) => {
  try {
    console.log("➡️ GetResultById called");

    // 1. Check authentication
    const userId = req.user?.id;
    console.log("🔑 userId from auth:", userId);

    if (!userId) {
      console.warn("⚠️ Unauthorized request - no userId found");
      return res.status(401).json({ error: "Unauthorized" });
    }

    // 2. Validate user existence
    const user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    console.log("👤 DB user lookup result:", user);

    if (!user || user.length === 0) {
      console.warn("⚠️ User not found for userId:");
      return res.status(404).json({ error: "User not found" });
    }

    // 3. Validate request param
    const { id } = req.params;
    console.log("📦 Request param id:");

    if (!id) {
      console.warn("⚠️ Invalid result ID:");
      return res.status(400).json({ error: "Invalid result ID" });
    }

    // 4. Fetch result entry
    const resultRows = await db
      .select()
      .from(results)
      .where(and(eq(results.userId, user.id), eq(results.id, id)));

    console.log("📊 Result rows fetched:");

    if (!resultRows || resultRows.length === 0) {
      console.warn(
        "⚠️ Result not found for userId:",
        user.id,
        " resultId:",
        id
      );
      return res.status(404).json({ error: "Result not found" });
    }

    const resultData = resultRows[0];
    console.log("✅ Found resultData:", resultData);

    // 5. Ensure quizId exists
    if (!resultData.quizId) {
      console.error("❌ Result has no quizId:");
      return res.status(400).json({ error: "Result has no associated quizId" });
    }

    // 6. Calculate result
    console.log("🧮 Calculating result for:", {
      resultId: resultData.id,

      quizId: resultData.quizId,
    });

    const result = await calculateResult(
      resultData.id,
      user.id,
      resultData.quizId
    );

    if (!result) {
      console.error("❌ Result calculation failed for:", resultData);
      return res.status(500).json({ error: "Result calculation failed" });
    }

    // 7. Success
    console.log("🎉 Successfully calculated result:", result);
    return res.json({ result });
  } catch (error: any) {
    console.error("💥 GetResultById error:", error);

    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    return res
      .status(500)
      .json({ error: error.message || "Failed to fetch result" });
  }
};
