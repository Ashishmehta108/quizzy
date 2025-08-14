import { db } from "../config/db/index.js";
import { quizzes, results } from "../config/db/schema.js";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { calculateResult } from "../utils/calculateresult.js";

export const PostResult = async (req, res) => {
    try {
        const { totalScore, optionsFilled, quizId } = req.body;
        console.log(totalScore, optionsFilled, quizId)
        if (!totalScore || !optionsFilled || !quizId) return res.status(400).json({ error: "All fields are required" });
        const userId = req.user.id;
        const resultId = randomUUID();
        const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, quizId));
        // await db.update(quizzes).where(eq(quizzes.id, quizId)).set({ submitted: true });
        await db.update(quizzes).set({ submitted: true }).where(eq(quizzes.id, quizId));
        const [result] = await db.insert(results).values({
            id: resultId,
            optionsReview: optionsFilled,
            score: totalScore,
            quizId,
            userId,
            submittedAt: new Date(),
        }).returning();
        res.status(201).json({ data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create result" });
    }
};

export const GetResults = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });
        const data = await db.select().from(results).where(eq(results.userId, userId));
        if (!data) return res.status(404).json({ error: "No results found" });
        const quizTitles = data.map(async (result) => {
            const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, result.quizId))
            const title = quiz.title
            return {
                title: title,
                ...result
            }

        });
        res.json({
            data: await Promise.all(quizTitles)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch results" });
    }
};

export const GetResultById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });
        const [data] = await db.select().from(results).where(eq(results.id, id)).where(eq(results.userId, userId));
        if (!data) return res.status(404).json({ error: "Result not found" });
        const result = await calculateResult(id, userId, data.quizId)
        if (!result) return res.status(404).json({ error: "Result not found" });
        res.json({ result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch result" });
    }
};





