/**
 * @layer middleware
 * @owner agent-1
 */
import { Request, Response, NextFunction } from "express";
import { WorkspaceService } from "../services/workspace.service";

const workspaceService = new WorkspaceService();

export async function resolveWorkspace(req: any, res: Response, next: NextFunction) {
  const workspaceId = req.headers["x-workspace-id"] || req.query.workspaceId;
  const userId = req.auth?.userId; // Assuming Clerk middleware attaches auth

  if (!userId) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  if (!workspaceId) {
    return res.status(400).json({ success: false, error: "Workspace ID is required" });
  }

  try {
    const membership = await workspaceService.checkMembership(workspaceId as string, userId);
    
    if (!membership) {
      return res.status(403).json({ success: false, error: "Not a member of this workspace" });
    }

    const workspace = await workspaceService.getWorkspaceDetail(workspaceId as string);
    
    req.workspace = {
      id: workspace.id,
      name: workspace.name,
      role: membership.role,
    };

    next();
  } catch (error) {
    console.error("Workspace resolution error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}
