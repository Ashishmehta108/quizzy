/**
 * @layer route
 * @owner agent-1
 * @description Workspace routes with RBAC enforcement for member management
 */
import { Router } from "express";
import { WorkspaceController } from "../controllers/workspace.controller";
import { resolveWorkspace } from "../middlewares/workspace.middleware";
import { requireRole, WORKSPACE_ROLES } from "../middlewares/role.middleware";
import { resolveUser } from "../middlewares/better-auth.middleware";

const router = Router();
const controller = new WorkspaceController();

// All workspace routes require a resolved user
router.use(resolveUser);

// Create workspace (user-level, no workspace context needed)
router.post("/", controller.createWorkspace);

// List user's workspaces (user-level, no workspace context needed)
router.get("/", controller.listUserWorkspaces);

// Workspace-scoped routes - require workspace resolution
router.use("/:workspaceId", resolveWorkspace);

// Get workspace detail (all members can view)
router.get("/:workspaceId", controller.getWorkspaceDetail);

// Update workspace (only owners and admins)
router.patch(
  "/:workspaceId",
  requireRole(WORKSPACE_ROLES.OWNER, WORKSPACE_ROLES.ADMIN),
  controller.updateWorkspace
);

// Get current user's role in workspace
router.get("/:workspaceId/my-role", controller.getMyRole);

// List members (all members can view)
router.get("/:workspaceId/members", controller.listMembers);

// Get entitlements (all members can view)
router.get("/:workspaceId/entitlements", controller.getEntitlements);

// Member management routes (RBAC protected)
// Add member (only owners and admins)
router.post(
  "/:workspaceId/members",
  requireRole(WORKSPACE_ROLES.OWNER, WORKSPACE_ROLES.ADMIN),
  controller.addMember
);

// Update member role (only owners and admins, with hierarchy checks in controller)
router.patch(
  "/:workspaceId/members/:memberId",
  requireRole(WORKSPACE_ROLES.OWNER, WORKSPACE_ROLES.ADMIN),
  controller.updateMemberRole
);

// Remove member (only owners and admins, with protection for last owner)
router.delete(
  "/:workspaceId/members/:memberId",
  requireRole(WORKSPACE_ROLES.OWNER, WORKSPACE_ROLES.ADMIN),
  controller.removeMember
);

export default router;
