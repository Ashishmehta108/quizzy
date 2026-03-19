/**
 * @layer route
 * @owner agent-1
 */
import { Router } from "express";
import { WorkspaceController } from "../controllers/workspace.controller";
import { resolveWorkspace } from "../middlewares/workspace.middleware";
import { requireRole } from "../middlewares/role.middleware";

import { resolveUser } from "../middlewares/auth.middleware";

const router = Router();
const controller = new WorkspaceController();

// All workspace routes require a resolved user
router.use(resolveUser);

router.post("/", controller.createWorkspace);
router.get("/", controller.listUserWorkspaces);

// Workspace-scoped routes
router.use("/:workspaceId", resolveWorkspace);

router.get("/:workspaceId", controller.getWorkspaceDetail);
router.patch("/:workspaceId", requireRole("owner", "admin"), controller.updateWorkspace);
router.get("/:workspaceId/members", controller.listMembers);
router.get("/:workspaceId/entitlements", controller.getEntitlements);

export default router;
