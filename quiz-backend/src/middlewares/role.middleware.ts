/**
 * @layer middleware
 * @owner agent-1
 * @description Role-Based Access Control (RBAC) middleware for workspace operations
 */
import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../utils/apiResponse";

/**
 * Workspace roles hierarchy (from highest to lowest):
 * - owner: Full control over workspace, including deletion and billing
 * - admin: Can manage members, courses, and assignments
 * - instructor: Can create/edit courses, assignments, and view student progress
 * - learner: Can only view assigned content and submit attempts
 */
export const WORKSPACE_ROLES = {
  OWNER: "owner",
  ADMIN: "admin",
  INSTRUCTOR: "instructor",
  LEARNER: "learner",
} as const;

export type WorkspaceRole = (typeof WORKSPACE_ROLES)[keyof typeof WORKSPACE_ROLES];

/**
 * Role hierarchy for permission checks
 */
const ROLE_HIERARCHY: Record<WorkspaceRole, number> = {
  owner: 4,
  admin: 3,
  instructor: 2,
  learner: 1,
};

/**
 * Check if a role has at least the required permission level
 */
export function hasRolePermission(userRole: WorkspaceRole, requiredRoles: WorkspaceRole[]): boolean {
  if (!userRole) return false;
  
  // Direct role match
  if (requiredRoles.includes(userRole)) return true;
  
  // Check hierarchy - higher roles can perform lower role actions
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  return requiredRoles.some(role => {
    const requiredLevel = ROLE_HIERARCHY[role] || 0;
    return userLevel >= requiredLevel;
  });
}

/**
 * Middleware to enforce role-based access control
 * @param roles - List of roles allowed to access the route
 * @returns Express middleware function
 * 
 * @example
 * // Only owners and admins can delete workspace
 * router.delete("/", requireRole("owner", "admin"), deleteWorkspace);
 * 
 * // Instructors and above can create quizzes
 * router.post("/quizzes", requireRole("owner", "admin", "instructor"), createQuiz);
 */
export function requireRole(...roles: WorkspaceRole[]) {
  return (req: any, res: Response, next: NextFunction) => {
    // Check if workspace context exists
    if (!req.workspace) {
      return res.status(500).json(new ApiResponse(false, "Workspace context missing. Ensure resolveWorkspace middleware is applied."));
    }

    const userRole = req.workspace.role as WorkspaceRole;
    
    // Validate user role exists in our role system
    if (!ROLE_HIERARCHY[userRole]) {
      return res.status(500).json(new ApiResponse(false, `Invalid user role: ${userRole}`));
    }

    // Check if user has required permission
    if (!hasRolePermission(userRole, roles)) {
      return res.status(403).json(new ApiResponse(
        false, 
        `Insufficient permissions. Required roles: ${roles.join(", ")}. Your role: ${userRole}`,
        { requiredRoles: roles, userRole }
      ));
    }

    next();
  };
}

/**
 * Middleware to check if user has ANY of the specified roles (non-hierarchical)
 * Use this when you need exact role matches without hierarchy escalation
 */
export function requireExactRole(...roles: WorkspaceRole[]) {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.workspace) {
      return res.status(500).json(new ApiResponse(false, "Workspace context missing"));
    }

    const userRole = req.workspace.role as WorkspaceRole;
    
    if (!roles.includes(userRole)) {
      return res.status(403).json(new ApiResponse(
        false, 
        `Access denied. Required roles: ${roles.join(", ")}. Your role: ${userRole}`,
        { requiredRoles: roles, userRole }
      ));
    }

    next();
  };
}

/**
 * Middleware to check if user is at least a certain role level
 * @param minimumRole - The minimum role level required
 */
export function requireMinimumRole(minimumRole: WorkspaceRole) {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.workspace) {
      return res.status(500).json(new ApiResponse(false, "Workspace context missing"));
    }

    const userRole = req.workspace.role as WorkspaceRole;
    const userLevel = ROLE_HIERARCHY[userRole] || 0;
    const requiredLevel = ROLE_HIERARCHY[minimumRole] || 0;

    if (userLevel < requiredLevel) {
      return res.status(403).json(new ApiResponse(
        false, 
        `Access denied. Minimum role required: ${minimumRole}. Your role: ${userRole}`,
        { minimumRole, userRole }
      ));
    }

    next();
  };
}
