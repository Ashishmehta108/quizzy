/**
 * @layer route
 * @owner agent-2
 * @description Contest management routes
 */
import { Router } from "express";
import { ContestController } from "../controllers/contest.controller";
import { resolveWorkspace } from "../middlewares/workspace.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { resolveUser } from "../middlewares/better-auth.middleware";

const router = Router();
const controller = new ContestController();

// Public contest access by share token (no auth required)
router.get("/public/:token", controller.getContestByToken);

// All other routes require authentication
router.use(resolveUser);

// Workspace-scoped routes
router.use(resolveWorkspace);

// ==================== CONTEST MANAGEMENT (Instructor+) ====================

// Create contest - requires instructor, admin, or owner role
router.post(
  "/",
  requireRole("owner", "admin", "instructor"),
  controller.createContest
);

// List all contests in workspace
router.get("/", controller.listContests);

// List active contests
router.get("/active", controller.listActiveContests);

// List upcoming contests
router.get("/upcoming", controller.listUpcomingContests);

// Contest-specific routes
router.param("id", async (req: any, res: any, next: any, id: string) => {
  // Attach contest to request for subsequent middleware/routes
  const { ContestRepository } = await import("../repositories/contest.repository");
  const contestRepo = new ContestRepository();
  
  try {
    const contest = await contestRepo.getContestById(id);
    if (!contest) {
      return res.status(404).json({ success: false, error: "Contest not found" });
    }
    req.contest = contest;
    next();
  } catch (error) {
    next(error);
  }
});

// Get contest details
router.get("/:id", controller.getContest);

// Update contest - requires instructor, admin, or owner role
router.patch(
  "/:id",
  requireRole("owner", "admin", "instructor"),
  controller.updateContest
);

// Delete contest - requires admin or owner role
router.delete(
  "/:id",
  requireRole("owner", "admin"),
  controller.deleteContest
);

// End contest - requires admin or owner role
router.post(
  "/:id/end",
  requireRole("owner", "admin"),
  controller.endContest
);

// Cancel contest - requires admin or owner role
router.post(
  "/:id/cancel",
  requireRole("owner", "admin"),
  controller.cancelContest
);

// Get contest leaderboard
router.get("/:id/leaderboard", controller.getContestLeaderboard);

// Get contest participants
router.get("/:id/participants", controller.getContestParticipants);

// Disqualify participant - requires admin or owner role
router.post(
  "/:id/participants/:userId/disqualify",
  requireRole("owner", "admin"),
  controller.disqualifyParticipant
);

// ==================== PARTICIPATION (All authenticated users) ====================

// Register for contest
router.post("/:id/register", controller.registerForContest);

// Unregister from contest
router.post("/:id/unregister", controller.unregisterFromContest);

// Start contest participation
router.post("/:id/start", controller.startContestParticipation);

// Complete contest participation
router.post("/:id/complete", controller.completeContestParticipation);

// Get user's contest history
router.get("/my", controller.getMyContests);

export default router;
