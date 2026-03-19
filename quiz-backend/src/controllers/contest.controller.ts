/**
 * @layer controller
 * @owner agent-2
 * @description HTTP request handlers for contest management
 */
import { Response, Request } from "express";
import { ContestService } from "../services/contest.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";

const contestService = new ContestService();

export class ContestController {
  /**
   * Create a new contest
   * POST /api/contests
   * Requires: owner, admin, or instructor role
   */
  createContest = asyncHandler(async (req: any, res: Response) => {
    const {
      quizId,
      title,
      description,
      startTime,
      endTime,
      maxParticipants,
      registrationDeadline,
      isPublic,
      prizeInfo,
      rules,
    } = req.body;

    // Validate required fields
    if (!quizId) {
      throw new ApiError(400, "Quiz ID is required");
    }
    if (!title) {
      throw new ApiError(400, "Title is required");
    }
    if (!startTime) {
      throw new ApiError(400, "Start time is required");
    }
    if (!endTime) {
      throw new ApiError(400, "End time is required");
    }

    const contest = await contestService.createContest(
      req.workspace.id,
      req.user.id,
      {
        quizId,
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        maxParticipants,
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : undefined,
        isPublic,
        prizeInfo,
        rules,
      }
    );

    res.status(201).json({ success: true, data: contest });
  });

  /**
   * List all contests in workspace
   * GET /api/contests
   */
  listContests = asyncHandler(async (req: any, res: Response) => {
    const contests = await contestService.listWorkspaceContests(req.workspace.id);
    res.status(200).json({ success: true, data: contests });
  });

  /**
   * List active contests
   * GET /api/contests/active
   */
  listActiveContests = asyncHandler(async (req: any, res: Response) => {
    const contests = await contestService.listActiveContests(req.workspace.id);
    res.status(200).json({ success: true, data: contests });
  });

  /**
   * List upcoming contests
   * GET /api/contests/upcoming
   */
  listUpcomingContests = asyncHandler(async (req: any, res: Response) => {
    const contests = await contestService.listUpcomingContests(req.workspace.id);
    res.status(200).json({ success: true, data: contests });
  });

  /**
   * Get contest details by ID
   * GET /api/contests/:id
   */
  getContest = asyncHandler(async (req: any, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;

    const result = await contestService.getContestById(id, userId);
    res.status(200).json({ success: true, data: result });
  });

  /**
   * Get contest by share token (public access)
   * GET /api/contests/public/:token
   */
  getContestByToken = asyncHandler(async (req: any, res: Response) => {
    const { token } = req.params;

    const result = await contestService.getContestByShareToken(token);
    res.status(200).json({ success: true, data: result });
  });

  /**
   * Update contest
   * PATCH /api/contests/:id
   * Requires: owner, admin, or instructor role
   */
  updateContest = asyncHandler(async (req: any, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;

    const contest = await contestService.updateContest(id, updateData);
    res.status(200).json({ success: true, data: contest });
  });

  /**
   * Delete contest
   * DELETE /api/contests/:id
   * Requires: owner or admin role
   */
  deleteContest = asyncHandler(async (req: any, res: Response) => {
    const { id } = req.params;

    await contestService.deleteContest(id);
    res.status(200).json({ success: true, message: "Contest deleted successfully" });
  });

  /**
   * Register for a contest
   * POST /api/contests/:id/register
   * Requires: authenticated user
   */
  registerForContest = asyncHandler(async (req: any, res: Response) => {
    const { id } = req.params;
    const userId = req.user.id;

    const participant = await contestService.registerForContest(id, userId);
    res.status(201).json({ success: true, data: participant });
  });

  /**
   * Unregister from a contest
   * POST /api/contests/:id/unregister
   * Requires: authenticated user
   */
  unregisterFromContest = asyncHandler(async (req: any, res: Response) => {
    const { id } = req.params;
    const userId = req.user.id;

    await contestService.unregisterFromContest(id, userId);
    res.status(200).json({ success: true, message: "Successfully unregistered from contest" });
  });

  /**
   * Start contest participation
   * POST /api/contests/:id/start
   * Requires: authenticated user who is registered
   */
  startContestParticipation = asyncHandler(async (req: any, res: Response) => {
    const { id } = req.params;
    const userId = req.user.id;

    const participant = await contestService.startContestParticipation(id, userId);
    res.status(200).json({ success: true, data: participant });
  });

  /**
   * Complete contest participation
   * POST /api/contests/:id/complete
   * Requires: authenticated user who has started
   */
  completeContestParticipation = asyncHandler(async (req: any, res: Response) => {
    const { id } = req.params;
    const { attemptId, score } = req.body;
    const userId = req.user.id;

    if (!attemptId) {
      throw new ApiError(400, "Attempt ID is required");
    }
    if (score === undefined || score === null) {
      throw new ApiError(400, "Score is required");
    }

    const participant = await contestService.completeContestParticipation(
      id,
      userId,
      attemptId,
      score
    );
    res.status(200).json({ success: true, data: participant });
  });

  /**
   * Get contest leaderboard
   * GET /api/contests/:id/leaderboard
   */
  getContestLeaderboard = asyncHandler(async (req: any, res: Response) => {
    const { id } = req.params;

    const result = await contestService.getContestLeaderboard(id);
    res.status(200).json({ success: true, data: result });
  });

  /**
   * Get user's contest history
   * GET /api/contests/my
   */
  getMyContests = asyncHandler(async (req: any, res: Response) => {
    const userId = req.user.id;

    const contests = await contestService.getUserContests(userId);
    res.status(200).json({ success: true, data: contests });
  });

  /**
   * End a contest (manual)
   * POST /api/contests/:id/end
   * Requires: owner or admin role
   */
  endContest = asyncHandler(async (req: any, res: Response) => {
    const { id } = req.params;

    const contest = await contestService.endContest(id);
    res.status(200).json({ success: true, data: contest });
  });

  /**
   * Cancel a contest
   * POST /api/contests/:id/cancel
   * Requires: owner or admin role
   */
  cancelContest = asyncHandler(async (req: any, res: Response) => {
    const { id } = req.params;

    const contest = await contestService.cancelContest(id);
    res.status(200).json({ success: true, data: contest });
  });

  /**
   * Disqualify a participant
   * POST /api/contests/:id/participants/:userId/disqualify
   * Requires: owner or admin role
   */
  disqualifyParticipant = asyncHandler(async (req: any, res: Response) => {
    const { id: contestId, userId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      throw new ApiError(400, "Disqualification reason is required");
    }

    const participant = await contestService.disqualifyParticipant(contestId, userId, reason);
    res.status(200).json({ success: true, data: participant });
  });

  /**
   * Get contest participants
   * GET /api/contests/:id/participants
   */
  getContestParticipants = asyncHandler(async (req: any, res: Response) => {
    const { id } = req.params;
    
    const contest = await contestService.getContestById(id);
    const participants = await contestRepo.listParticipants(id);
    
    res.status(200).json({ success: true, data: participants });
  });
}

// Import contestRepo for getContestParticipants
import { ContestRepository } from "../repositories/contest.repository";
const contestRepo = new ContestRepository();
