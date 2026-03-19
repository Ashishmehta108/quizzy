import { Router } from "express";
import { 
  getAssignmentAnalytics, 
  getCourseAnalytics,
  getQuizLeaderboard,
  getAssignmentLeaderboard,
  getWorkspaceLeaderboard,
  getUserQuizRank,
  checkAttemptResultConsistency
} from "../controllers/analytics.controller";

const router = Router();

// Analytics endpoints
router.get("/assignments/:id/analytics", getAssignmentAnalytics);
router.get("/courses/:id/analytics", getCourseAnalytics);

// Results view for instructor
router.get("/assignments/:id/results", (req, res) => {
  res.json({ success: true, data: [] }); // placeholder - to be implemented
});

// Leaderboard endpoints
router.get("/leaderboards/workspace", getWorkspaceLeaderboard);
router.get("/leaderboards/quiz/:quizId", getQuizLeaderboard);
router.get("/leaderboards/assignment/:assignmentId", getAssignmentLeaderboard);
router.get("/leaderboards/quiz/:quizId/user-rank", getUserQuizRank);

// Debug/consistency check endpoint (admin only in production)
router.get("/debug/consistency", checkAttemptResultConsistency);

export default router;
