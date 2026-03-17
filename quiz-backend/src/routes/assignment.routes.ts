/**
 * @layer route
 * @owner agent-3
 */
import { Router } from "express";
import { AssignmentController } from "../controllers/assignment.controller";
import { resolveWorkspace } from "../middlewares/workspace.middleware";
import { requireRole } from "../middlewares/role.middleware";

const router = Router();
const controller = new AssignmentController();

router.post("/join", controller.joinAssignment);

router.use(resolveWorkspace);

router.post("/", requireRole("owner", "admin", "instructor"), controller.createAssignment);
router.get("/", controller.listAssignments);
router.get("/:id", controller.getAssignmentDetail);

export default router;
