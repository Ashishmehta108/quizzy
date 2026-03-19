/**
 * @layer controller
 * @owner agent-1
 * @description Authentication controller handling user sync and session management
 */
import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { ApiError } from "../utils/apiError";

/**
 * Sync user from Better Auth to local database
 * Creates user record, default workspace, and billing if not exists
 */
export const syncUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(401, "Unauthorized: User ID not provided");
    }

    const result = await authService.syncUser(userId);

    await authService.logAuthEvent(userId, "user_synced");

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    const status = error instanceof ApiError ? error.statusCode : 500;
    const message =
      error instanceof ApiError ? error.message : "Internal server error";

    console.error("Sync user error:", error);

    res.status(status).json({
      success: false,
      error: message,
    });
  }
};

/**
 * Get authentication events for the current user
 */
export const getAuthEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new ApiError(401, "Unauthorized: User ID not provided");
    }

    const events = await authService.getAuthEvents(userId);

    res.status(200).json({
      success: true,
      data: { events },
    });
  } catch (error) {
    const status = error instanceof ApiError ? error.statusCode : 500;
    const message =
      error instanceof ApiError ? error.message : "Internal server error";

    console.error("Get auth events error:", error);

    res.status(status).json({
      success: false,
      error: message,
    });
  }
};
