import { db } from "../config/db/index";
import { quizzes, results, users } from "../config/db/schema";
import { and, eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { calculateResult } from "../utils/calculateresult";
import { Request, Response } from "express";
import { asyncHandler } from "@/utils/asyncHandler";

export const PostResult = async (req: Request, res: Response) => {
  try {
    const { totalScore, optionsFilled, quizId } = req.body;
    console.log(totalScore, optionsFilled, quizId);
    if (!totalScore || !optionsFilled || !quizId)
      return res.status(400).json({ error: "All fields are required" });
    const userId = req?.auth?.userId;
    const resultId = randomUUID();
    const [quiz] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, quizId));

    const [result] = await db
      .insert(results)
      .values({
        id: resultId,
        optionsReview: optionsFilled,
        score: totalScore,
        quizId,
        userId,
        submittedAt: new Date(),
      })
      .returning();
    await db
      .update(quizzes)
      .set({ submitted: true })
      .where(eq(quizzes.id, quizId));
    res.status(201).json({ data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create result" });
  }
};

export const GetResults = async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const [user] = await db
      .select({ userId: users.id })
      .from(users)
      .where(eq(users.clerkId, userId));
    console.log(user);
    const data = await db
      .select()
      .from(results)
      .where(eq(results.userId, user.userId));
    console.log(data);

    if (data.length == 0)
      return res.json({
        data: [],
      });
    const quizTitles = data.map(async (result) => {
      const [quiz] = await db
        .select()
        .from(quizzes)
        .where(eq(quizzes.id, result.quizId!));
      const title = quiz.title;
      return {
        title: title,
        ...result,
      };
    });
    res.json({
      data: await Promise.all(quizTitles),
    });
  } catch (error) {
    console.error(error);
  }
  res.status(500).json({ error: "Failed to fetch results" });
};

export const GetResultById = async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkId, userId));
    console.log(user);
    const { id } = req.params;
    const data = await db
      .select()
      .from(results)
      .where(and(eq(results.userId, user.id), eq(results.id, id!)));
    console.log(data);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    console.log(data);
    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Result not found" });
    }
    const resultData = data[0];
    const result = await calculateResult(
      resultData.id,
      userId,
      resultData.quizId!
    );
    if (!result) return res.status(404).json({ error: "Result not found" });
    res.json({ result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch result" });
  }
};
