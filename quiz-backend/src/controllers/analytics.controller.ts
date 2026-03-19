/**
 * @layer controller
 * @owner agent-3
 */
import { Request, Response } from "express";
import { AnalyticsService } from "../services/analytics.service";

export const getAssignmentAnalytics = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const workspaceId = req.headers["x-workspace-id"] as string || "default_workspace";

    const data = await AnalyticsService.getAssignmentAnalytics(id, workspaceId);
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || "Internal server error" });
  }
};

export const getCourseAnalytics = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const workspaceId = req.headers["x-workspace-id"] as string || "default_workspace";

    const data = await AnalyticsService.getCourseAnalytics(id, workspaceId);
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || "Internal server error" });
  }
};

/**
 * Get leaderboard for a specific quiz
 */
export const getQuizLeaderboard = async (req: Request, res: Response) => {
  try {
    const { quizId } = req.params;
    const workspaceId = req.headers["x-workspace-id"] as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

    if (!workspaceId) {
      return res.status(400).json({ success: false, error: "Missing x-workspace-id header" });
    }

    const data = await AnalyticsService.getQuizLeaderboard(quizId, workspaceId, limit);
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || "Internal server error" });
  }
};

/**
 * Get leaderboard for a specific assignment
 */
export const getAssignmentLeaderboard = async (req: Request, res: Response) => {
  try {
    const { assignmentId } = req.params;
    const workspaceId = req.headers["x-workspace-id"] as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

    if (!workspaceId) {
      return res.status(400).json({ success: false, error: "Missing x-workspace-id header" });
    }

    const data = await AnalyticsService.getAssignmentLeaderboard(assignmentId, workspaceId, limit);
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || "Internal server error" });
  }
};

/**
 * Get workspace-wide leaderboard
 */
export const getWorkspaceLeaderboard = async (req: Request, res: Response) => {
  try {
    const workspaceId = req.headers["x-workspace-id"] as string;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

    if (!workspaceId) {
      return res.status(400).json({ success: false, error: "Missing x-workspace-id header" });
    }

    const data = await AnalyticsService.getWorkspaceLeaderboard(workspaceId, limit);
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || "Internal server error" });
  }
};

/**
 * Get user's rank for a specific quiz
 */
export const getUserQuizRank = async (req: Request, res: Response) => {
  try {
    const { quizId } = req.params;
    const workspaceId = req.headers["x-workspace-id"] as string;
    const userId = req.user?.id;

    if (!workspaceId) {
      return res.status(400).json({ success: false, error: "Missing x-workspace-id header" });
    }

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized - user ID required" });
    }

    const data = await AnalyticsService.getUserQuizRank(userId, quizId, workspaceId);
    
    if (!data) {
      return res.status(404).json({ success: false, error: "No submissions found for this user" });
    }

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || "Internal server error" });
  }
};

/**
 * Check attempt-result consistency (admin/debug endpoint)
 */
export const checkAttemptResultConsistency = async (req: Request, res: Response) => {
  try {
    const workspaceId = req.headers["x-workspace-id"] as string;

    if (!workspaceId) {
      return res.status(400).json({ success: false, error: "Missing x-workspace-id header" });
    }

    const data = await AnalyticsService.checkAttemptResultConsistency(workspaceId);
    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || "Internal server error" });
  }
};
