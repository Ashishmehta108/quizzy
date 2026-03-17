import { Router } from "express";
import { exportAssignmentResults } from "../controllers/export.controller";

const router = Router();

router.get("/assignments/:id/export", exportAssignmentResults);
router.get("/assignments/:id/export/questions", exportAssignmentResults); // Could map to specific questions CSV

export default router;
