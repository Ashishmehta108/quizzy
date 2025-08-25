import { Router } from "express";
import { createQuiz, getQuizzes } from "../controllers/quiz.controller.js";
import { upload } from "../middlewares/upload.middleware.js";
import fs from "fs";
import { db } from "../config/db/index.js";
import { questions, quizzes } from "../config/db/schema.js";
import { and, eq } from "drizzle-orm";
import { checkAuth } from "../utils/checkAuth.js"
const quizRouter = Router();

quizRouter.post(
    "/",
    checkAuth,
    upload.array("files", 5),
    async (req, res, nextquizRouter) => {
        try {
            await createQuiz(req, res);
        } finally {
            if (req.files && req.files.length > 0) {
                for (const file of req.files) {
                    fs.unlink(file.path, (err) => {
                        if (err) console.error(`Error deleting ${file.filename}:`, err);
                    });
                }
            }
        }
    }
);

quizRouter.get("/", checkAuth, getQuizzes);

quizRouter.get("/:id", checkAuth, async (req, res) => {
    const { id } = req.params;
    const userId = req.auth.userId;
    console.log("this is id", id)
    const [getUserId] = await db.select().from(quizzes).where(eq(quizzes.id, id))
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const [data] = await db.select().from(quizzes).where(
        and(
            eq(quizzes.id, id),
            // eq(quizzes.userId, getUserId.id)
        ));
    if (!data) return res.status(404).json({ error: "Quiz not found" });
    const questionsList = await db.select().from(questions).where(eq(questions.quizId, id));
    res.json({ quiz: data, questions: questionsList });

});

export default quizRouter;
