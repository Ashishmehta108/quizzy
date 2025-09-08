import { Router } from "express";
import { quizAI, ensureSession } from "../services/aiservice";
import { db } from "../config/db/index";
import {
  chatMessages,
  chatSessions,
  questions,
  quizzes,
  users,
} from "../config/db/schema";
import { eq, desc, asc, and } from "drizzle-orm";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";

const chatRouter = Router();

chatRouter.get(
  "/chats",
  asyncHandler(async (req, res) => {
    const userId = req.auth?.userId;
    console.log(userId);
    if (!userId) return res.status(200).json({ chats: [] });
    const quizzesWithChats = await db
      .select({
        id: chatSessions.id,
        title: quizzes.title,
        quizId: quizzes.id,
      })
      .from(chatSessions)
      .where(eq(chatSessions.userId, userId))
      .innerJoin(quizzes, eq(chatSessions.quizId, quizzes.id));
    if (!quizzesWithChats[0].id) return res.json({ chats: [] });

    res.json({ chats: quizzesWithChats });
  })
);

chatRouter.get(
  "/chat/:id",
  asyncHandler(async (req, res) => {
    const { id: quizId } = req.params;
    const { userId } = req.query as { userId?: string };
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const sessionId = await ensureSession(quizId, userId);
    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(asc(chatMessages.createdAt));

    res.json({ sessionId, messages });
  })
);

chatRouter.post(
  "/chat/:id",
  asyncHandler(async (req, res) => {
    const { id: quizId } = req.params;
    const { role, content, sessionId, userId } = req.body;
    if (!sessionId || !userId)
      return res.status(400).json({ error: "Missing sessionId or userId" });

    await db.insert(chatMessages).values({
      sessionId,
      quizId,
      role,
      content,
      status: role === "user" ? "sent" : "received",
      tokensIn: 0,
      tokensOut: 0,
      createdAt: new Date(),
    });

    res.json({ success: true });
  })
);

chatRouter.post(
  "/chat/:id/ai",
  asyncHandler(async (req, res) => {
    const { id: quizId } = req.params;
    const { userId, question, explanation, userQuery, type } = req.body;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const result = await quizAI(type || "chat", {
      quizId,
      userId,
      question,
      explanation,
      userQuery,
    });

    res.json(result);
  })
);

chatRouter.get(
  "/chat/:id/questions",
  asyncHandler(async (req, res) => {
    const { id: quizId } = req.params;
    const userId = req.auth?.userId;
    const qns = await db
      .select()
      .from(questions)
      .where(eq(questions.quizId, quizId));
    console.log(qns[0].id);
    if (!qns) throw new ApiError(404, "Questions not found");

    res.json({ questions: qns });
  })
);

export default chatRouter;
