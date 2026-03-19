/**
 * @layer route
 * @owner agent-3
 */
import { Router } from "express";
import { CourseController } from "../controllers/course.controller";
import { resolveWorkspace } from "../middlewares/workspace.middleware";
import { requireRole } from "../middlewares/role.middleware";

import { resolveUser } from "../middlewares/auth.middleware";

const router = Router();
const controller = new CourseController();

// Resolve the DB user first, then the workspace
router.use(resolveUser);
router.use(resolveWorkspace);

router.get("/", controller.listCourses);
router.post("/", requireRole("owner", "admin"), controller.createCourse);
router.get("/cohorts", controller.listCohorts);
router.post("/cohorts", requireRole("owner", "admin"), controller.createCohort);
router.get("/:id", controller.getCourse);

export default router;
