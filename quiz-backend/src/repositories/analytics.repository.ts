/**
 * @layer repository
 * @owner agent-4
 * @tables results, quiz_attempts
 */
import { sql } from "drizzle-orm";
import { db } from "../config/db/index";
import { quizAttempts, results } from "../config/db/schema";

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
  }
};
