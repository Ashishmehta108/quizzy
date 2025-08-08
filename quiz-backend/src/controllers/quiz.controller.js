import { db } from "../config/db/index.js";
import { quizzes, questions } from "../config/db/schema.js";
import { eq } from "drizzle-orm";
import { generateQuizQuestions } from "../utils/ai.js";
import { randomUUID } from "node:crypto";
import { processPdf } from "../ai/parsedoc/doc.js";
import { queryChunks, upsertChunks } from "../ai/pinecone.js";
import { chunkText } from "../utils/chunk.js";
import fs from "fs";
// import { generateRelevantQuery } from "../utils/generateRelevantQuery.js";

export const createQuiz = async (req, res) => {
    try {
        const filePath = req?.files[0]?.path;
        const fileType = req?.files[0]?.mimetype;
        const { title, query } = req.body;
        const docId = randomUUID();
        let fulldoc = ""
        let retrivalcontext = null
        if (filePath) {
            if (fileType !== "text/plain") {
                fulldoc = await processPdf(filePath, req.user.id, docId);
            } else {
                const text = await fs.readFile(filePath, async (err, buffer) => {
                    console.log(buffer)
                    const chunktext = chunkText(buffer.toString(), 1000, 100);
                    await upsertChunks(req.user.id, docId, chunktext);
                    fulldoc = chunktext.map((chunk) => chunk.text).join(" ");
                });
            }
            retrivalcontext = (await queryChunks(query, req.user.id, 4, docId)).map((chunk) => ({
                data: chunk.text
            }));
        }
        const finalQuestions = await generateQuizQuestions(
            {
                title: title,
                context: query,
                morecontext: retrivalcontext && retrivalcontext + " This is the data parsed from the document uploaded by the user so make the quiz accordingly." + "this is the full document " + fulldoc
            }
        );

        const quizId = randomUUID();
        const [quiz] = await db.insert(quizzes).values({
            id: quizId,
            title,
            userId: req.user.id,
        }).returning();

        for (let q of finalQuestions) {
            await db.insert(questions).values({
                id: randomUUID(),
                quizId: quiz.id,
                question: q.question,
                options: JSON.stringify(q.options),
                answer: q.answer,
                createdAt: new Date(),
                explanation: q.explanation
            });
        }

        res.json({ quiz, questions: finalQuestions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

export const getQuizzes = async (req, res) => {
    try {
        const { id } = req.user;
        const all = await db.select()
            .from(quizzes)
            .where(eq(quizzes.userId, id));

        const result = [];
        for (let q of all) {
            console.log(all)
            const questionsList = await db.select().from(questions).where(eq(questions.quizId, q.id));
            result.push({
                quiz: q,
                questions: questionsList,
            });
        }
        console.log(result)
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};
