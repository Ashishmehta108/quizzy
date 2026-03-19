/**
 * @layer route
 * @owner agent-3
 */
import { Router } from "express";
import { AssignmentController } from "../controllers/assignment.controller";
import { resolveWorkspace } from "../middlewares/workspace.middleware";
import { requireRole } from "../middlewares/role.middleware";

import { resolveUser } from "../middlewares/better-auth.middleware";

const router = Router();
const controller = new AssignmentController();

router.post("/join", controller.joinAssignment);

// Require DB user and workspace for other operations
router.use(resolveUser);
router.use(resolveWorkspace);

router.post("/", requireRole("owner", "admin", "instructor"), controller.createAssignment);
router.get("/", controller.listAssignments);
router.get("/:id", controller.getAssignmentDetail);

export default router;
