import { db } from "../config/db";
import {
  assignments,
  assignmentAttempts,
  assignmentMembers,
  quizzes,
  questions,
  results,
} from "../config/db/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { Response, Request } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { checkEntitlement } from "../services/entitlements.service";

interface AssignmentRequest extends Request {
  body: {
    title?: string;
    quizId?: string;
    description?: string;
    dueDate?: string;
    maxAttempts?: number;
    timeLimitMinutes?: number;
    cohortId?: string;
    userIds?: string[];
  };
}

interface SubmitAttemptRequest extends Request {
  body: {
    answers: Record<string, number>; // questionId -> selectedOptionIndex
    timeTakenSeconds?: number;
    studentName?: string;
    studentEmail?: string;
  };
}

/**
 * Create assignment (Instructor only)
 * POST /api/assignments
 */
export const createAssignment = asyncHandler(async (req: AssignmentRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const workspaceId = req.headers["x-workspace-id"] as string;
  if (!workspaceId) throw new ApiError(400, "Workspace ID is required");

  const { title, quizId, description, dueDate, maxAttempts = 1, timeLimitMinutes, cohortId } = req.body;

  if (!title || !quizId) {
    throw new ApiError(400, "Title and quizId are required");
  }

  // Check entitlements
  const entitlement = await checkEntitlement(workspaceId, "assignment_created");
  if (!entitlement.allowed) {
    throw new ApiError(403, `Assignment limit reached for this plan`);
  }

  // Verify quiz exists
  const quiz = await db
    .select()
    .from(quizzes)
    .where(and(eq(quizzes.id, quizId), eq(quizzes.workspaceId, workspaceId)))
    .limit(1);

  if (!quiz.length) {
    throw new ApiError(404, "Quiz not found");
  }

  const assignmentId = randomUUID();
  const shareToken = randomUUID().replace(/-/g, "").substring(0, 12);

  const newAssignment = {
    id: assignmentId,
    workspaceId,
    quizId,
    title,
    description: description || "",
    dueDate: dueDate ? new Date(dueDate) : null,
    publishedAt: new Date(),
    maxAttempts,
    timeLimitMinutes: timeLimitMinutes || null,
    isPublic: true,
    shareToken,
    createdAt: new Date(),
  };

  await db.insert(assignments).values(newAssignment);

  // If cohortId provided, add cohort members
  if (cohortId) {
    const members = await db
      .select()
      .from(assignmentMembers) // Actually cohort members
      .where(eq(assignmentMembers.cohortId, cohortId as any));

    // Create assignment members
    const assignmentMembersData = members.map((m) => ({
      id: randomUUID(),
      assignmentId,
      userId: m.userId,
      status: "assigned" as const,
      attemptsUsed: 0,
      joinedAt: new Date(),
    }));

    if (assignmentMembersData.length > 0) {
      await db.insert(assignmentMembers).values(assignmentMembersData);
    }
  }

  res.status(201).json({
    success: true,
    assignment: newAssignment,
    shareUrl: `${process.env.FRONTEND_URL}/join/${shareToken}`,
    message: "Assignment created successfully",
  });
});

/**
 * Get assignment by share token (Public access)
 * GET /api/assignments/public/:shareToken
 */
export const getAssignmentByToken = asyncHandler(async (req: Request, res: Response) => {
  const { shareToken } = req.params;

  const assignmentList = await db
    .select({
      id: assignments.id,
      title: assignments.title,
      description: assignments.description,
      dueDate: assignments.dueDate,
      maxAttempts: assignments.maxAttempts,
      timeLimitMinutes: assignments.timeLimitMinutes,
      quizId: assignments.quizId,
      quizTitle: quizzes.title,
    })
    .from(assignments)
    .leftJoin(quizzes, eq(assignments.quizId, quizzes.id))
    .where(and(eq(assignments.shareToken, shareToken), eq(assignments.isPublic, true)))
    .limit(1);

  if (!assignmentList.length) {
    throw new ApiError(404, "Assignment not found or not public");
  }

  const assignment = assignmentList[0];

  // Get quiz questions (without answers for students)
  const quizQuestions = await db
    .select({
      id: questions.id,
      question: questions.question,
      options: questions.options,
      explanation: questions.explanation,
    })
    .from(questions)
    .where(eq(questions.quizId, assignment.quizId))
    .orderBy(questions.createdAt);

  res.json({
    success: true,
    assignment,
    questions: quizQuestions.map((q) => ({
      ...q,
      // Don't send correct answer to students
      options: q.options,
    })),
  });
});

/**
 * Submit assignment attempt (Public or authenticated)
 * POST /api/assignments/:id/submit
 */
export const submitAttempt = asyncHandler(async (req: SubmitAttemptRequest, res: Response) => {
  const { id } = req.params;
  const { answers, timeTakenSeconds = 0, studentName, studentEmail } = req.body;

  const userId = req.user?.id;

  const assignmentList = await db
    .select()
    .from(assignments)
    .where(eq(assignments.id, id))
    .limit(1);

  if (!assignmentList.length) {
    throw new ApiError(404, "Assignment not found");
  }

  const assignment = assignmentList[0];

  // Check if user has already submitted max attempts
  if (userId) {
    const member = await db
      .select()
      .from(assignmentMembers)
      .where(and(eq(assignmentMembers.assignmentId, id), eq(assignmentMembers.userId, userId)))
      .limit(1);

    if (member.length && member[0].attemptsUsed >= assignment.maxAttempts) {
      throw new ApiError(400, `Maximum attempts (${assignment.maxAttempts}) reached`);
    }
  }

  // Get correct answers and calculate score
  const quizQuestions = await db
    .select()
    .from(questions)
    .where(eq(questions.quizId, assignment.quizId));

  let correctCount = 0;
  const questionAnswers: Record<string, number> = {};

  for (const question of quizQuestions) {
    const selectedAnswer = answers[question.id];
    questionAnswers[question.id] = selectedAnswer;

    if (selectedAnswer === question.answer) {
      correctCount++;
    }
  }

  const totalQuestions = quizQuestions.length;
  const percentage = totalQuestions > 0 ? ((correctCount / totalQuestions) * 100).toFixed(2) : "0";

  // Create attempt record
  const attemptId = randomUUID();
  const attemptNumber = userId
    ? ((await db
        .select({ count: count() })
        .from(assignmentAttempts)
        .where(and(eq(assignmentAttempts.assignmentId, id), eq(assignmentAttempts.userId, userId)))
        .then((r) => r[0]?.count || 0)) + 1)
    : 1;

  const attempt = {
    id: attemptId,
    assignmentId: id,
    userId: userId || null,
    studentEmail: !userId ? studentEmail : null,
    studentName: !userId ? studentName : null,
    quizId: assignment.quizId,
    answers: questionAnswers,
    score: correctCount,
    totalQuestions,
    percentage,
    timeTakenSeconds,
    startedAt: new Date(),
    submittedAt: new Date(),
    status: "submitted" as const,
    attemptNumber,
    metadata: {
      userAgent: req.headers["user-agent"],
      ip: req.ip,
    },
    createdAt: new Date(),
  };

  await db.insert(assignmentAttempts).values(attempt);

  // Update member's attempt count
  if (userId) {
    await db
      .update(assignmentMembers)
      .set({
        attemptsUsed: attemptNumber,
        lastAttemptAt: new Date(),
      })
      .where(and(eq(assignmentMembers.assignmentId, id), eq(assignmentMembers.userId, userId)));
  }

  // Create result record for authenticated users
  if (userId) {
    await db.insert(results).values({
      id: randomUUID(),
      userId,
      quizId: assignment.quizId,
      score: correctCount,
      optionsReview: JSON.stringify(questionAnswers),
      submittedAt: new Date(),
      assignmentId: id,
      attemptId,
    });
  }

  res.json({
    success: true,
    attempt: {
      id: attemptId,
      score: correctCount,
      totalQuestions,
      percentage,
      timeTakenSeconds,
    },
    message: "Attempt submitted successfully",
  });
});

/**
 * Get assignment attempts (Instructor view)
 * GET /api/assignments/:id/attempts
 */
export const getAssignmentAttempts = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const { id } = req.params;
  const { status } = req.query;

  const assignmentList = await db
    .select()
    .from(assignments)
    .where(and(eq(assignments.id, id), eq(assignments.workspaceId, req.headers["x-workspace-id"] as string)))
    .limit(1);

  if (!assignmentList.length) {
    throw new ApiError(404, "Assignment not found");
  }

  let query = db
    .select({
      attempt: assignmentAttempts,
      user: {
        id: users.id,
        name: users.name,
        email: users.email,
      },
    })
    .from(assignmentAttempts)
    .leftJoin(users, eq(assignmentAttempts.userId, users.id))
    .where(eq(assignmentAttempts.assignmentId, id));

  if (status) {
    query = query.and(eq(assignmentAttempts.status, status as string));
  }

  query = query.orderBy(desc(assignmentAttempts.submittedAt));

  const attempts = await query;

  res.json({
    success: true,
    attempts: attempts.map((a) => ({
      ...a.attempt,
      studentName: a.attempt.studentName || a.user?.name,
      studentEmail: a.attempt.studentEmail || a.user?.email,
    })),
    total: attempts.length,
  });
});

/**
 * Grade assignment attempt (Instructor only)
 * POST /api/assignments/attempts/:attemptId/grade
 */
export const gradeAttempt = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const { attemptId } = req.params;
  const { feedback, overrideScore } = req.body;

  await db
    .update(assignmentAttempts)
    .set({
      status: "graded",
      gradedBy: userId,
      gradedAt: new Date(),
      feedback: feedback || null,
      ...(overrideScore !== undefined && { score: overrideScore }),
    })
    .where(eq(assignmentAttempts.id, attemptId));

  res.json({
    success: true,
    message: "Attempt graded successfully",
  });
});

/**
 * Get student's own attempts
 * GET /api/assignments/:id/my-attempts
 */
export const getMyAttempts = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const { id } = req.params;

  const attempts = await db
    .select()
    .from(assignmentAttempts)
    .where(and(eq(assignmentAttempts.assignmentId, id), eq(assignmentAttempts.userId, userId)))
    .orderBy(desc(assignmentAttempts.submittedAt));

  res.json({
    success: true,
    attempts,
    total: attempts.length,
  });
});

/**
 * Get assignment statistics (Instructor analytics)
 * GET /api/assignments/:id/stats
 */
export const getAssignmentStats = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const { id } = req.params;
  const workspaceId = req.headers["x-workspace-id"] as string;

  const assignmentList = await db
    .select()
    .from(assignments)
    .where(and(eq(assignments.id, id), eq(assignments.workspaceId, workspaceId)))
    .limit(1);

  if (!assignmentList.length) {
    throw new ApiError(404, "Assignment not found");
  }

  // Get all attempts
  const attempts = await db
    .select()
    .from(assignmentAttempts)
    .where(eq(assignmentAttempts.assignmentId, id));

  const submittedAttempts = attempts.filter((a) => a.submittedAt);

  // Calculate statistics
  const totalStudents = attempts.length;
  const submittedCount = submittedAttempts.length;
  const completionRate = totalStudents > 0 ? ((submittedCount / totalStudents) * 100).toFixed(1) : "0";

  const scores = submittedAttempts.map((a) => parseFloat(a.percentage));
  const avgScore = scores.length > 0
    ? (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(2)
    : "0";

  const minScore = scores.length > 0 ? Math.min(...scores).toFixed(2) : "0";
  const maxScore = scores.length > 0 ? Math.max(...scores).toFixed(2) : "0";

  // Score distribution
  const distribution = {
    "0-20": scores.filter((s) => s >= 0 && s < 20).length,
    "20-40": scores.filter((s) => s >= 20 && s < 40).length,
    "40-60": scores.filter((s) => s >= 40 && s < 60).length,
    "60-80": scores.filter((s) => s >= 60 && s < 80).length,
    "80-100": scores.filter((s) => s >= 80).length,
  };

  res.json({
    success: true,
    stats: {
      totalStudents,
      submittedCount,
      completionRate: parseFloat(completionRate),
      averageScore: parseFloat(avgScore),
      minScore: parseFloat(minScore),
      maxScore: parseFloat(maxScore),
      distribution,
      attempts: attempts.length,
    },
  });
});
