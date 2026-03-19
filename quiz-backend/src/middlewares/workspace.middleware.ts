/**
 * @layer middleware
 * @owner agent-1
 * @description Middleware to resolve workspace from request and validate membership
 */
import { Request, Response, NextFunction } from "express";
import { WorkspaceService } from "../services/workspace.service";
import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";

const workspaceService = new WorkspaceService();

export async function resolveWorkspace(req: any, res: Response, next: NextFunction) {
  const workspaceId = req.headers["x-workspace-id"] || req.query.workspaceId || req.params.workspaceId;
  const dbUserId = req.user?.id;

  if (!dbUserId) {
    return res.status(401).json(new ApiResponse(false, "Unauthorized: DB User not resolved"));
  }

  if (!workspaceId) {
    return res.status(400).json(new ApiResponse(false, "Workspace ID is required"));
  }

  try {
    const membership = await workspaceService.checkMembership(workspaceId as string, dbUserId);

    if (!membership) {
      return res.status(403).json(new ApiResponse(false, "Not a member of this workspace"));
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
    if (error instanceof ApiError) {
      return next(error);
    }
    res.status(500).json(new ApiResponse(false, "Internal server error"));
  }
}
