/**
 * @layer repository
 * @owner agent-4
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
  }
};
