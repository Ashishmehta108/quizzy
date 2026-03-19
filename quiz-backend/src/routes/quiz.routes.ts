/**
 * @layer route
 * @owner agent-1
 * @description Quiz routes with RBAC enforcement
 */
import { Router } from "express";
import { createQuiz, getQuizzes, getJobStatus, getQuizById } from "../controllers/quiz.controller";
import { checkAuth } from "../utils/checkAuth";
import { upload } from "../middlewares/upload.middleware";
import { db } from "../config/db/index";
import { questions, quizzes } from "../config/db/schema";
import { eq } from "drizzle-orm";
import { QuizRequest, QuizResponse } from "../types/routes/quiz";
import { quizChecks } from "../checks/quiz.checks";
import { resolveUser } from "../middlewares/better-auth.middleware";
import { resolveWorkspace } from "../middlewares/workspace.middleware";
import { requireRole, requireMinimumRole, WORKSPACE_ROLES } from "../middlewares/role.middleware";

const quizRouter = Router();

/**
 * Quiz check endpoint - requires authentication
 */
quizRouter.post("/check", checkAuth, quizChecks, (req, res) => {
  res.json({ ok: true });
});

/**
 * Create quiz endpoint
 * - Requires authenticated user
 * - Requires workspace context
 * - Requires instructor role or higher (owner, admin, instructor)
 * - Validates workspace membership
 */
quizRouter.post(
  "/",
  resolveUser,
  resolveWorkspace,
  requireRole(WORKSPACE_ROLES.OWNER, WORKSPACE_ROLES.ADMIN, WORKSPACE_ROLES.INSTRUCTOR),
  upload.array("files", 5),
  createQuiz
);

/**
 * List all quizzes for the authenticated user's workspace
 * - Requires authenticated user
 * - Requires workspace context
 * - Validates workspace membership
 * - All workspace members can view quizzes
 */
quizRouter.get(
  "/",
  resolveUser,
  resolveWorkspace,
  getQuizzes
);

/**
 * Get job status for async quiz generation
 * - Requires authenticated user
 * - Requires workspace context
 */
quizRouter.get(
  "/job/:jobId",
  resolveUser,
  resolveWorkspace,
  getJobStatus
);

/**
 * Get quiz by ID
 * - Requires authenticated user
 * - Requires workspace context
 * - Validates that quiz belongs to the workspace
 * - All workspace members can view quizzes
 */
quizRouter.get(
  "/:id",
  resolveUser,
  resolveWorkspace,
  getQuizById
);

export default quizRouter;
