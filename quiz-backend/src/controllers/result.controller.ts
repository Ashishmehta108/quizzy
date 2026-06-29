import { db } from "../config/db/index";
import { quizzes, results } from "../config/db/schema";
import { and, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { calculateResult } from "../utils/calculateresult";
import { Request, Response } from "express";
import { ApiError } from "../utils/apiError";

export const PostResult = async (req: Request, res: Response) => {
  try {
    const { totalScore, optionsFilled, quizId } = req.body;

    const authUser = (req as any).betterAuthUser;
    if (!authUser?.id) return res.status(401).json({ error: "Unauthorized" });

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
        userId: authUser.id,
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
    const authUser = (req as any).betterAuthUser;
    if (!authUser?.id) return res.status(401).json({ error: "Unauthorized" });

    const data = await db
      .select()
      .from(results)
      .where(eq(results.userId, authUser.id));

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

    const authUser = (req as any).betterAuthUser;
    if (!authUser?.id) {
      console.warn("⚠️ Unauthorized request - no session user");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.params;
    console.log("📦 Request param id:", id);

    if (!id) {
      console.warn("⚠️ Invalid result ID");
      return res.status(400).json({ error: "Invalid result ID" });
    }

    const resultRows = await db
      .select()
      .from(results)
      .where(and(eq(results.userId, authUser.id), eq(results.id, id)));

    console.log("📊 Result rows fetched:", resultRows.length);

    if (!resultRows || resultRows.length === 0) {
      console.warn("⚠️ Result not found for userId:", authUser.id, "resultId:", id);
      return res.status(404).json({ error: "Result not found" });
    }

    const resultData = resultRows[0];
    console.log("✅ Found resultData:", resultData);

    if (!resultData.quizId) {
      console.error("❌ Result has no quizId");
      return res.status(400).json({ error: "Result has no associated quizId" });
    }

    const result = await calculateResult(
      resultData.id,
      authUser.id,
      resultData.quizId
    );

    if (!result) {
      console.error("❌ Result calculation failed for:", resultData);
      return res.status(500).json({ error: "Result calculation failed" });
    }

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
