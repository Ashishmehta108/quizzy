import { Router } from "express";
import { getAssignmentAnalytics, getCourseAnalytics } from "../controllers/analytics.controller";

const router = Router();

router.get("/assignments/:id/analytics", getAssignmentAnalytics);
router.get("/courses/:id/analytics", getCourseAnalytics);

// Results view for instructor, mapped in analytics per specs
router.get("/assignments/:id/results", (req, res) => {
  res.json({ success: true, data: [] }); // dummy for now
});

export default router;
