import { db } from "../config/db/index.js";
import { quizzes, questions, users } from "../config/db/schema.js";
import { eq } from "drizzle-orm";
import { generateQuizQuestions } from "../utils/ai.js";
import { randomUUID } from "node:crypto";
import { processPdf } from "../ai/parsedoc/doc.js";
import { queryChunks, upsertChunks } from "../ai/pinecone.js";
import { chunkText } from "../utils/chunk.js";
import fs from "fs/promises";

export const createQuiz = async (req, res) => {
    try {
        const { userId } = req.auth;
        const [getUserId] = await db.select().from(users).where(eq(users.clerkId, userId))
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const filePath = req?.files?.[0]?.path;
        const fileType = req?.files?.[0]?.mimetype;
        const { title, query } = req.body;

        const docId = randomUUID();
        let fulldoc = "";
        let retrivalcontext = [];

        if (filePath) {
            if (fileType !== "text/plain") {
                fulldoc = await processPdf(filePath, getUserId.id, docId);
            } else {
                const buffer = await fs.readFile(filePath);
                const chunktext = chunkText(buffer.toString(), 1000, 100);
                await upsertChunks(userId, docId, chunktext);
                fulldoc = chunktext.map((chunk) => chunk.text).join(" ");
            }

            const chunks = await queryChunks(query, getUserId.id, 4, docId);
            retrivalcontext = chunks.map((chunk) => chunk.text);
        }

        const finalQuestions = await generateQuizQuestions({
            title,
            context: query,
            morecontext:
                retrivalcontext.join(" ") +
                " This is the data parsed from the document uploaded by the user. " +
                "This is the full document: " +
                fulldoc,
        });

        const quizId = randomUUID();
        const [quiz] = await db
            .insert(quizzes)
            .values({
                id: quizId,
                title,
                userId: getUserId.id,
            })
            .returning();

        if (finalQuestions.length > 0) {
            await db.insert(questions).values(
                finalQuestions.map((q) => ({
                    id: randomUUID(),
                    quizId: quiz.id,
                    question: q.question,
                    options: JSON.stringify(q.options),
                    answer: q.answer,
                    explanation: q.explanation,
                    createdAt: new Date(),
                }))
            );
        }

        res.json({ quiz, questions: finalQuestions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

export const getQuizzes = async (req, res) => {
    try {
        const { userId } = req.auth;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const all = await db
            .select()
            .from(quizzes)
            .where(eq(quizzes.userId, userId));

        const result = await Promise.all(
            all.map(async (q) => {
                const questionsList = await db
                    .select()
                    .from(questions)
                    .where(eq(questions.quizId, q.id));
                return { quiz: q, questions: questionsList };
            })
        );

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};
