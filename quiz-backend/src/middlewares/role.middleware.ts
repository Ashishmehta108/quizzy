/**
 * @layer middleware
 * @owner agent-1
 */
import { Request, Response, NextFunction } from "express";

export function requireRole(...roles: string[]) {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.workspace) {
      return res.status(500).json({ success: false, error: "Workspace context missing" });
    }

    if (!roles.includes(req.workspace.role)) {
      return res.status(403).json({ success: false, error: "Insufficient permissions" });
    }

    next();
  };
}
