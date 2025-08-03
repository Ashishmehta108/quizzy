import { db } from "../config/db/index.js";
import { results } from "../config/db/schema.js";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { calculateResult } from "../utils/calculateresult.js";

export const PostResult = async (req, res) => {
    try {
        const { totalScore, optionsFilled, quizId } = req.body;
        if (!totalScore || !optionsFilled || !quizId) return res.status(400).json({ error: "All fields are required" });
        const userId = req.user.id;
        const resultId = randomUUID();
        const [result] = await db.insert(results).values({
            id: resultId,
            optionsReview: optionsFilled,
            score: totalScore,
            quizId,
            userId
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
        console.log(data)
        res.json({ data });
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
        console.log("result via id")
        const result = await calculateResult(id, userId, data.quizId)
        if (!result) return res.status(404).json({ error: "Result not found" });
        console.log(result)
        res.json({ result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch result" });
    }
};





