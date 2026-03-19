/**
 * @layer repository
 * @owner agent-3
 * @tables quiz_attempts, results
 */
import { eq, and } from "drizzle-orm";
import { db } from "../config/db/index";
import { quizAttempts, results } from "../config/db/schema";

export const AttemptRepository = {
  async getAttemptById(attemptId: string) {
    return db.select().from(quizAttempts).where(eq(quizAttempts.id, attemptId));
  },

  async getResultByAttemptId(attemptId: string) {
    return db.select().from(results).where(eq(results.attemptId, attemptId));
  },

  async getAttemptsByUserAndQuiz(userId: string, quizId: string) {
    return db.select()
      .from(quizAttempts)
      .where(and(eq(quizAttempts.userId, userId), eq(quizAttempts.quizId, quizId)))
      .orderBy(quizAttempts.submittedAt);
  },

  async getAttemptWithResult(attemptId: string) {
    const attempts = await db
      .select({
        attempt: quizAttempts,
        result: results,
      })
      .from(quizAttempts)
      .leftJoin(results, eq(results.attemptId, quizAttempts.id))
      .where(eq(quizAttempts.id, attemptId));

    return attempts[0] || null;
  },

  async createAttempt(data: {
    id: string;
    userId: string;
    quizId: string;
    workspaceId?: string;
    assignmentId?: string;
    answers?: any;
    status?: string;
  }) {
    const newAttempt = await db
      .insert(quizAttempts)
      .values({
        id: data.id,
        userId: data.userId,
        quizId: data.quizId,
        workspaceId: data.workspaceId,
        assignmentId: data.assignmentId,
        answers: data.answers,
        status: data.status || 'in_progress',
        startedAt: new Date(),
      })
      .returning();

    return newAttempt[0];
  },

  async updateAttempt(attemptId: string, data: {
    score?: number;
    status?: string;
    submittedAt?: Date;
    timeTakenSeconds?: number;
    answers?: any;
  }) {
    const updated = await db
      .update(quizAttempts)
      .set({
        ...data,
        completedAt: new Date(),
      })
      .where(eq(quizAttempts.id, attemptId))
      .returning();

    return updated[0];
  },

  async linkResultToAttempt(attemptId: string, resultId: string) {
    await db
      .update(quizAttempts)
      .set({ status: 'submitted' })
      .where(eq(quizAttempts.id, attemptId));

    await db
      .update(results)
      .set({ attemptId })
      .where(eq(results.id, resultId));
  },

  async updateGrade(attemptId: string, overrideScore: number | null, instructorComments: string | null, gradedBy: string) {
    await db.update(quizAttempts)
      .set({ status: 'graded' })
      .where(eq(quizAttempts.id, attemptId));

    await db.update(results)
      .set({
        overrideScore,
        instructorComments,
        gradedBy,
        gradedAt: new Date()
      })
      .where(eq(results.attemptId, attemptId));
  },

  async getRecentAttemptsByWorkspace(workspaceId: string, limit: number = 20) {
    return db.select()
      .from(quizAttempts)
      .where(eq(quizAttempts.workspaceId, workspaceId))
      .orderBy(quizAttempts.submittedAt)
      .limit(limit);
  }
};
