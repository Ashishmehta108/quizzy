/**
 * @layer repository
 * @owner agent-3
 * @tables results, quiz_attempts, assignments, quizzes, users
 */
import { sql } from "drizzle-orm";
import { db } from "../config/db/index";
import { quizAttempts, results, assignments, quizzes, users, workspaces } from "../config/db/schema";

export const AnalyticsRepository = {
  async getAssignmentStats(assignmentId: string, workspaceId: string) {
    const res = await db.execute(sql`
      SELECT
        COUNT(*) as "totalSubmitted",
        COALESCE(AVG(score), 0) as "averageScore",
        MAX(score) as "highestScore",
        MIN(score) as "lowestScore"
      FROM quiz_attempts
      WHERE assignment_id = ${assignmentId}
        AND workspace_id = ${workspaceId}
        AND status = 'submitted'
    `);

    return res[0] || { totalSubmitted: 0, averageScore: 0, highestScore: 0, lowestScore: 0 };
  },

  async getScoreDistribution(assignmentId: string, workspaceId: string) {
    return db.execute(sql`
      SELECT
        CASE
          WHEN score BETWEEN 0 AND 20 THEN '0-20'
          WHEN score BETWEEN 21 AND 40 THEN '21-40'
          WHEN score BETWEEN 41 AND 60 THEN '41-60'
          WHEN score BETWEEN 61 AND 80 THEN '61-80'
          WHEN score BETWEEN 81 AND 100 THEN '81-100'
        END as range,
        COUNT(*) as count
      FROM quiz_attempts
      WHERE assignment_id = ${assignmentId}
        AND workspace_id = ${workspaceId}
        AND status = 'submitted'
      GROUP BY range
      ORDER BY range
    `);
  },

  async getCoursePerformanceTrends(courseId: string, workspaceId: string) {
    return db.execute(sql`
      SELECT
        a.id as "assignmentId",
        a.title,
        AVG(qa.score) as "averageScore"
      FROM assignments a
      LEFT JOIN quiz_attempts qa ON qa.assignment_id = a.id AND qa.status = 'submitted'
      WHERE a.course_id = ${courseId} AND a.workspace_id = ${workspaceId}
      GROUP BY a.id, a.title
      ORDER BY a.created_at ASC
    `);
  },

  /**
   * Get leaderboard for a specific quiz within a workspace
   * Returns ranked users with their best scores
   */
  async getQuizLeaderboard(quizId: string, workspaceId: string, limit: number = 50) {
    return db.execute(sql`
      SELECT
        u.id as "userId",
        u.name as "userName",
        u.email as "userEmail",
        MAX(qa.score) as "bestScore",
        COUNT(qa.id) as "attemptCount",
        MIN(qa.time_taken_seconds) as "bestTimeTaken",
        MAX(qa.submitted_at) as "lastSubmittedAt"
      FROM quiz_attempts qa
      INNER JOIN users u ON u.id = qa.user_id
      WHERE qa.quiz_id = ${quizId}
        AND qa.workspace_id = ${workspaceId}
        AND qa.status = 'submitted'
        AND qa.score IS NOT NULL
      GROUP BY u.id, u.name, u.email
      ORDER BY "bestScore" DESC, "bestTimeTaken" ASC
      LIMIT ${limit}
    `);
  },

  /**
   * Get leaderboard for a specific assignment within a workspace
   * Returns ranked users with their best scores for that assignment
   */
  async getAssignmentLeaderboard(assignmentId: string, workspaceId: string, limit: number = 50) {
    return db.execute(sql`
      SELECT
        u.id as "userId",
        u.name as "userName",
        u.email as "userEmail",
        MAX(qa.score) as "bestScore",
        COUNT(qa.id) as "attemptCount",
        MIN(qa.time_taken_seconds) as "bestTimeTaken",
        MAX(qa.submitted_at) as "lastSubmittedAt"
      FROM quiz_attempts qa
      INNER JOIN users u ON u.id = qa.user_id
      WHERE qa.assignment_id = ${assignmentId}
        AND qa.workspace_id = ${workspaceId}
        AND qa.status = 'submitted'
        AND qa.score IS NOT NULL
      GROUP BY u.id, u.name, u.email
      ORDER BY "bestScore" DESC, "bestTimeTaken" ASC
      LIMIT ${limit}
    `);
  },

  /**
   * Get workspace-wide leaderboard across all quizzes
   * Returns top performers in the workspace
   */
  async getWorkspaceLeaderboard(workspaceId: string, limit: number = 50) {
    return db.execute(sql`
      SELECT
        u.id as "userId",
        u.name as "userName",
        u.email as "userEmail",
        COUNT(qa.id) as "totalAttempts",
        COALESCE(AVG(qa.score), 0) as "averageScore",
        MAX(qa.score) as "highestScore",
        COUNT(DISTINCT qa.quiz_id) as "quizzesCompleted"
      FROM quiz_attempts qa
      INNER JOIN users u ON u.id = qa.user_id
      WHERE qa.workspace_id = ${workspaceId}
        AND qa.status = 'submitted'
        AND qa.score IS NOT NULL
      GROUP BY u.id, u.name, u.email
      ORDER BY "averageScore" DESC, "quizzesCompleted" DESC, "highestScore" DESC
      LIMIT ${limit}
    `);
  },

  /**
   * Get user's rank and stats for a specific quiz
   */
  async getUserQuizRank(userId: string, quizId: string, workspaceId: string) {
    const res = await db.execute(sql`
      WITH user_stats AS (
        SELECT
          MAX(score) as "bestScore",
          COUNT(*) as "attemptCount",
          MIN(time_taken_seconds) as "bestTimeTaken"
        FROM quiz_attempts
        WHERE user_id = ${userId}
          AND quiz_id = ${quizId}
          AND workspace_id = ${workspaceId}
          AND status = 'submitted'
          AND score IS NOT NULL
      ),
      rank_calc AS (
        SELECT
          u2.id,
          MAX(qa2.score) as "bestScore",
          COUNT(*) OVER () as "totalParticipants"
        FROM quiz_attempts qa2
        INNER JOIN users u2 ON u2.id = qa2.user_id
        WHERE qa2.quiz_id = ${quizId}
          AND qa2.workspace_id = ${workspaceId}
          AND qa2.status = 'submitted'
          AND qa2.score IS NOT NULL
        GROUP BY u2.id
      )
      SELECT
        us."bestScore",
        us."attemptCount",
        us."bestTimeTaken",
        rc."totalParticipants",
        (SELECT COUNT(*) + 1 FROM rank_calc WHERE "bestScore" > (SELECT "bestScore" FROM user_stats)) as "userRank"
      FROM user_stats us
      CROSS JOIN (SELECT "totalParticipants" FROM rank_calc LIMIT 1) rc
    `);

    return res[0] || null;
  },

  /**
   * Get attempt-result consistency check - find attempts without linked results
   */
  async findOrphanedAttempts(workspaceId: string) {
    return db.execute(sql`
      SELECT qa.id as "attemptId", qa.quiz_id as "quizId", qa.user_id as "userId", qa.created_at as "createdAt"
      FROM quiz_attempts qa
      LEFT JOIN results r ON r.attempt_id = qa.id
      WHERE qa.workspace_id = ${workspaceId}
        AND qa.status = 'submitted'
        AND r.id IS NULL
    `);
  },

  /**
   * Get result without linked attempt
   */
  async findOrphanedResults(workspaceId: string) {
    return db.execute(sql`
      SELECT r.id as "resultId", r.quiz_id as "quizId", r.user_id as "userId", r.created_at as "createdAt"
      FROM results r
      LEFT JOIN quiz_attempts qa ON qa.id = r.attempt_id
      WHERE r.workspace_id = ${workspaceId}
        AND qa.id IS NULL
    `);
  }
};
