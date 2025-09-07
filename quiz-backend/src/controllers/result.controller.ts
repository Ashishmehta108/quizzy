import { db } from "../config/db/index";
import { quizzes, results, users } from "../config/db/schema";
import { and, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { calculateResult } from "../utils/calculateresult";
import { Request, Response } from "express";

export const PostResult = async (req: Request, res: Response) => {
  try {
    const { totalScore, optionsFilled, quizId } = req.body;

    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkId, userId));
    if (!user) return res.status(404).json({ error: "User not found" });

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
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkId, userId));
    if (!user) return res.status(404).json({ error: "User not found" });

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
    res.status(500).json({ error: error.message || "Failed to fetch results" });
  }
};

export const GetResultById = async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkId, userId));
    if (!user) return res.status(404).json({ error: "User not found" });

    const { id } = req.params;
    const data = await db
      .select()
      .from(results)
      .where(and(eq(results.userId, user.id), eq(results.id, id!)));
    if (!data || data.length === 0)
      return res.status(404).json({ error: "Result not found" });

    const resultData = data[0];
    const result = await calculateResult(
      resultData.id,
      userId,
      resultData.quizId!
    );
    if (!result) return res.status(404).json({ error: "Result not found" });

    res.json({ result });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to fetch result" });
  }
};
