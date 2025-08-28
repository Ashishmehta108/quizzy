import { Request, Response } from "express";
import { db } from "@/config/db";
import { goals } from "@/config/db/schema";
import { eq } from "drizzle-orm";
import { generateGoalPlan } from "@/services/goalAi.service";
import { v4 as uuidv4 } from "uuid";

export const createGoal = async (req: Request, res: Response) => {
  try {
    const { userId, rawGoal } = req.body;

    if (!userId || !rawGoal) {
      return res.status(400).json({ error: "userId and rawGoal required" });
    }

    const aiPlan = await generateGoalPlan(rawGoal);

    const newGoal = {
      id: uuidv4(),
      userId,
      title: rawGoal,
      description: aiPlan.description,
      steps: JSON.stringify(aiPlan.steps),
    };

    await db.insert(goals).values(newGoal);

    return res.status(201).json({ message: "Goal created", goal: newGoal });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to create goal" });
  }
};

export const getUserGoals = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const result = await db
      .select()
      .from(goals)
      .where(eq(goals.userId, userId));

    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch goals" });
  }
};

export const completeGoal = async (req: Request, res: Response) => {
  try {
    const { goalId } = req.params;

    await db.update(goals).set({ completed: true }).where(eq(goals.id, goalId));

    return res.json({ message: "Goal marked as completed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update goal" });
  }
};
