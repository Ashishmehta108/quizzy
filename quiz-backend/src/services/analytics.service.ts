/**
 * @layer service
 * @owner agent-3
 */
import { AnalyticsRepository } from "../repositories/analytics.repository";
import { AttemptRepository } from "../repositories/attempt.repository";

export const AnalyticsService = {
  async getAssignmentAnalytics(assignmentId: string, workspaceId: string) {
    const stats = await AnalyticsRepository.getAssignmentStats(assignmentId, workspaceId);
    const distributionRaw = await AnalyticsRepository.getScoreDistribution(assignmentId, workspaceId);

    const total = Number(stats.totalSubmitted);
    const scoreDistribution = distributionRaw.map((row: any) => ({
      range: row.range,
      count: Number(row.count),
      percentage: total > 0 ? (Number(row.count) / total) * 100 : 0
    }));

    // Calculate median score from distribution
    let medianScore = Number(stats.averageScore);
    if (total > 0) {
      const cumulative = scoreDistribution.reduce((acc, curr, idx) => {
        const cum = acc + curr.count;
        if (cum >= total / 2 && acc < total / 2) {
          // Extract midpoint of range
          const rangeStart = parseInt(curr.range.split('-')[0]);
          const rangeEnd = parseInt(curr.range.split('-')[1]);
          medianScore = (rangeStart + rangeEnd) / 2;
        }
        return cum;
      }, 0);
    }

    return {
      assignmentId,
      totalAssigned: total, // Real data only - no mock
      totalSubmitted: total,
      completionRate: total > 0 ? 100 : 0, // Will be calculated when we have totalAssigned
      averageScore: Number(stats.averageScore),
      medianScore,
      highestScore: Number(stats.highestScore) || 0,
      lowestScore: Number(stats.lowestScore) || 0,
      passRate: 0, // To be calculated based on passing threshold
      failRate: 0,
      averageTimeTaken: 0, // To be added from attempt data
      scoreDistribution,
      questionAnalysis: [] // To be implemented with question-level analytics
    };
  },

  async getCourseAnalytics(courseId: string, workspaceId: string) {
    const trendsRaw = await AnalyticsRepository.getCoursePerformanceTrends(courseId, workspaceId);

    const performanceTrend = trendsRaw.map((row: any) => ({
      assignmentId: row.assignmentId,
      title: row.title,
      publishedAt: new Date().toISOString(),
      averageScore: Number(row.averageScore) || 0,
      completionRate: 0, // To be calculated
    }));

    // Get top performers from workspace leaderboard
    const leaderboardRaw = await AnalyticsRepository.getWorkspaceLeaderboard(workspaceId, 10);
    const topPerformers = leaderboardRaw.map((row: any) => ({
      userId: row.userId,
      name: row.userName || row.userEmail,
      averageScore: Number(row.averageScore) || 0,
      assignmentsCompleted: Number(row.quizzesCompleted) || 0,
    }));

    return {
      courseId,
      totalStudents: 0, // To be calculated from cohort members
      totalAssignments: performanceTrend.length,
      averageCompletion: 0,
      performanceTrend,
      topPerformers,
      bottomPerformers: [], // To be implemented
      weakAreas: [] // To be implemented with question analytics
    };
  },

  /**
   * Get leaderboard for a quiz
   */
  async getQuizLeaderboard(quizId: string, workspaceId: string, limit: number = 50) {
    const leaderboardRaw = await AnalyticsRepository.getQuizLeaderboard(quizId, workspaceId, limit);
    
    return leaderboardRaw.map((row: any, index: number) => ({
      rank: index + 1,
      userId: row.userId,
      userName: row.userName || row.userEmail,
      userEmail: row.userEmail,
      bestScore: Number(row.bestScore) || 0,
      attemptCount: Number(row.attemptCount) || 0,
      bestTimeTaken: Number(row.bestTimeTaken) || 0,
      lastSubmittedAt: row.lastSubmittedAt ? new Date(row.lastSubmittedAt).toISOString() : null,
    }));
  },

  /**
   * Get leaderboard for an assignment
   */
  async getAssignmentLeaderboard(assignmentId: string, workspaceId: string, limit: number = 50) {
    const leaderboardRaw = await AnalyticsRepository.getAssignmentLeaderboard(assignmentId, workspaceId, limit);
    
    return leaderboardRaw.map((row: any, index: number) => ({
      rank: index + 1,
      userId: row.userId,
      userName: row.userName || row.userEmail,
      userEmail: row.userEmail,
      bestScore: Number(row.bestScore) || 0,
      attemptCount: Number(row.attemptCount) || 0,
      bestTimeTaken: Number(row.bestTimeTaken) || 0,
      lastSubmittedAt: row.lastSubmittedAt ? new Date(row.lastSubmittedAt).toISOString() : null,
    }));
  },

  /**
   * Get workspace-wide leaderboard
   */
  async getWorkspaceLeaderboard(workspaceId: string, limit: number = 50) {
    const leaderboardRaw = await AnalyticsRepository.getWorkspaceLeaderboard(workspaceId, limit);
    
    return leaderboardRaw.map((row: any, index: number) => ({
      rank: index + 1,
      userId: row.userId,
      userName: row.userName || row.userEmail,
      userEmail: row.userEmail,
      totalAttempts: Number(row.totalAttempts) || 0,
      averageScore: Number(row.averageScore) || 0,
      highestScore: Number(row.highestScore) || 0,
      quizzesCompleted: Number(row.quizzesCompleted) || 0,
    }));
  },

  /**
   * Get user's rank for a specific quiz
   */
  async getUserQuizRank(userId: string, quizId: string, workspaceId: string) {
    const rankData = await AnalyticsRepository.getUserQuizRank(userId, quizId, workspaceId);
    
    if (!rankData) {
      return null;
    }

    return {
      userId,
      quizId,
      bestScore: Number(rankData.bestScore) || 0,
      attemptCount: Number(rankData.attemptCount) || 0,
      bestTimeTaken: Number(rankData.bestTimeTaken) || 0,
      userRank: Number(rankData.userRank) || 0,
      totalParticipants: Number(rankData.totalParticipants) || 0,
    };
  },

  /**
   * Check attempt-result consistency
   */
  async checkAttemptResultConsistency(workspaceId: string) {
    const orphanedAttempts = await AnalyticsRepository.findOrphanedAttempts(workspaceId);
    const orphanedResults = await AnalyticsRepository.findOrphanedResults(workspaceId);

    return {
      orphanedAttempts: orphanedAttempts.map((row: any) => ({
        attemptId: row.attemptId,
        quizId: row.quizId,
        userId: row.userId,
        createdAt: row.createdAt,
      })),
      orphanedResults: orphanedResults.map((row: any) => ({
        resultId: row.resultId,
        quizId: row.quizId,
        userId: row.userId,
        createdAt: row.createdAt,
      })),
      hasInconsistencies: orphanedAttempts.length > 0 || orphanedResults.length > 0,
    };
  }
};
