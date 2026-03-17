import { Router } from "express";
import { getAttemptReview, updateGrade } from "../controllers/grading.controller";

const router = Router();

router.get("/attempts/:id/review", getAttemptReview);
router.patch("/attempts/:id/grade", updateGrade);

export default router;
