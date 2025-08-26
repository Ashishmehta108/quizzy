import { Router, Request, Response } from "express";
import { createQuiz, getQuizzes } from "../controllers/quiz.controller";
import { checkAuth } from "../utils/checkAuth";
import { upload } from "../middlewares/upload.middleware";
import { db } from "../config/db/index";
import { questions, quizzes } from "../config/db/schema";
import { and, eq } from "drizzle-orm";
import {
  QuizRequest,
  QuizResponse,
} from "../types/routes/quiz";
const quizRouter = Router();

quizRouter.post(
  "/",
  checkAuth,
  upload.array("files", 5),
  async (req: QuizRequest, res: QuizResponse) => {
    await createQuiz(req, res);
  }
);

quizRouter.get("/", checkAuth, async (req: QuizRequest, res: QuizResponse) => {
  await getQuizzes(req, res);
});

quizRouter.get("/:id", checkAuth, async (req, res) => {
  const { id } = req.params;
  const userId = req.auth?.userId;
  console.log("this is id", id);
  const [getUserId] = await db.select().from(quizzes).where(eq(quizzes.id, id));
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  const [data] = await db
    .select()
    .from(quizzes)
    .where(
      and(
        eq(quizzes.id, id)
        // eq(quizzes.userId, getUserId.id)
      )
    );
  if (!data) return res.status(404).json({ error: "Quiz not found" });
  const questionsList = await db
    .select()
    .from(questions)
    .where(eq(questions.quizId, id));
  res.json({ quiz: data, questions: questionsList });
});

export default quizRouter;
