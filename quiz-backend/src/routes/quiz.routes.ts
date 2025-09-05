import { Router } from "express";
import { createQuiz, getQuizzes } from "../controllers/quiz.controller";
import { checkAuth } from "../utils/checkAuth";
import { upload } from "../middlewares/upload.middleware";
import { db } from "../config/db/index";
import { questions, quizzes } from "../config/db/schema";
import { eq } from "drizzle-orm";
import { QuizRequest, QuizResponse } from "../types/routes/quiz";
import { quizChecks } from "@/checks/quiz.checks";

const quizRouter = Router();

quizRouter.post("/check", checkAuth, quizChecks, (req, res) => {
  res.json({ ok: true });
});
quizRouter.post(
  "/",
  checkAuth,
  upload.array("files", 5),
  createQuiz
);

quizRouter.get("/", checkAuth, getQuizzes);

quizRouter.get(
  "/:id",
  checkAuth,
  async (req: QuizRequest, res: QuizResponse) => {
    const { id } = req.params;
    const userId = req.auth?.userId;

    if (!id) {
      return res.status(400).json({ error: "Quiz ID is required" });
    }
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const [quizRecord] = await db
      .select()
      .from(quizzes)
      .where(eq(quizzes.id, id));
    if (!quizRecord) {
      return res.status(201).json({
        quiz: [],
        questions: [],
      });
    }

    const questionsList = await db
      .select()
      .from(questions)
      .where(eq(questions.quizId, id));

    return res.json({ quiz: quizRecord, questions: questionsList });
  }
);

export default quizRouter;
