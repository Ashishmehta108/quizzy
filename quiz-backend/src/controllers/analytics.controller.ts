/**
 * @layer controller
 * @owner agent-4
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
