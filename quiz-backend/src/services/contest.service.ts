/**
 * @layer service
 * @owner agent-2
 * @tables contests, contest_participants, quizzes, quiz_attempts
 */
import { ContestRepository } from "../repositories/contest.repository";
import { QuizRepository } from "../repositories/quiz.repository";
import * as AttemptRepository from "../repositories/attempt.repository";

const contestRepo = new ContestRepository();
const quizRepo = new QuizRepository();

export interface CreateContestInput {
  quizId: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  maxParticipants?: number;
  registrationDeadline?: Date;
  isPublic?: boolean;
  prizeInfo?: string;
  rules?: string;
}

export interface ContestWithDetails {
  contest: any;
  quiz?: any;
  participantCount?: number;
  userRegistered?: boolean;
}

export class ContestService {
  /**
   * Create a new contest
   */
  async createContest(
    workspaceId: string,
    createdBy: string,
    data: CreateContestInput
  ) {
    // Validate time range
    if (data.startTime >= data.endTime) {
      throw new Error("Contest start time must be before end time");
    }

    // Validate registration deadline if provided
    if (data.registrationDeadline && data.registrationDeadline >= data.startTime) {
      throw new Error("Registration deadline must be before contest start time");
    }

    // Verify quiz exists
    const quiz = await quizRepo.getQuizById(data.quizId);
    if (!quiz) {
      throw new Error("Quiz not found");
    }

    // Create contest
    const contest = await contestRepo.createContest({
      workspaceId,
      createdBy,
      ...data,
    });

    return contest;
  }

  /**
   * Get contest by ID with optional details
   */
  async getContestById(contestId: string, userId?: string): Promise<ContestWithDetails> {
    const contest = await contestRepo.getContestById(contestId);
    if (!contest) {
      throw new Error("Contest not found");
    }

    const quiz = await quizRepo.getQuizById(contest.quizId);
    const participantCount = await contestRepo.getParticipantCount(contestId);
    
    let userRegistered = false;
    if (userId) {
      const participant = await contestRepo.getParticipant(contestId, userId);
      userRegistered = !!participant;
    }

    return {
      contest,
      quiz,
      participantCount,
      userRegistered,
    };
  }

  /**
   * Get contest by share token (for public access)
   */
  async getContestByShareToken(token: string): Promise<ContestWithDetails> {
    const contest = await contestRepo.getContestByShareToken(token);
    if (!contest) {
      throw new Error("Contest not found");
    }

    const quiz = await quizRepo.getQuizById(contest.quizId);
    const participantCount = await contestRepo.getParticipantCount(contest.id);

    return {
      contest,
      quiz,
      participantCount,
    };
  }

  /**
   * List all contests in a workspace
   */
  async listWorkspaceContests(workspaceId: string) {
    return await contestRepo.listContestsByWorkspace(workspaceId);
  }

  /**
   * List active contests (ongoing now)
   */
  async listActiveContests(workspaceId?: string) {
    return await contestRepo.listActiveContests(workspaceId);
  }

  /**
   * List upcoming contests
   */
  async listUpcomingContests(workspaceId?: string) {
    return await contestRepo.listUpcomingContests(workspaceId);
  }

  /**
   * Update contest details
   */
  async updateContest(contestId: string, data: Partial<CreateContestInput>) {
    const contest = await contestRepo.getContestById(contestId);
    if (!contest) {
      throw new Error("Contest not found");
    }

    // Validate time range if updating times
    if (data.startTime && data.endTime) {
      if (data.startTime >= data.endTime) {
        throw new Error("Contest start time must be before end time");
      }
    } else if (data.startTime && contest.endTime) {
      if (data.startTime >= contest.endTime) {
        throw new Error("Contest start time must be before end time");
      }
    } else if (data.endTime && contest.startTime) {
      if (contest.startTime >= data.endTime) {
        throw new Error("Contest start time must be before end time");
      }
    }

    return await contestRepo.updateContest(contestId, data);
  }

  /**
   * Delete a contest
   */
  async deleteContest(contestId: string) {
    const contest = await contestRepo.getContestById(contestId);
    if (!contest) {
      throw new Error("Contest not found");
    }

    // Can only delete scheduled or cancelled contests
    if (contest.status === "active") {
      throw new Error("Cannot delete an active contest. End the contest first.");
    }

    await contestRepo.deleteContest(contestId);
  }

  /**
   * Register a user for a contest
   */
  async registerForContest(contestId: string, userId: string) {
    const contest = await contestRepo.getContestById(contestId);
    if (!contest) {
      throw new Error("Contest not found");
    }

    // Check if contest is scheduled or active
    if (contest.status === "ended" || contest.status === "cancelled") {
      throw new Error("Cannot register for a contest that has ended or been cancelled");
    }

    // Check registration deadline
    if (contest.registrationDeadline && new Date() > contest.registrationDeadline) {
      throw new Error("Registration deadline has passed");
    }

    // Check if already registered
    const existingParticipant = await contestRepo.getParticipant(contestId, userId);
    if (existingParticipant) {
      throw new Error("Already registered for this contest");
    }

    // Check max participants
    if (contest.maxParticipants) {
      const currentCount = await contestRepo.getParticipantCount(contestId);
      if (currentCount >= contest.maxParticipants) {
        throw new Error("Contest is full");
      }
    }

    // Register participant
    return await contestRepo.registerParticipant(contestId, userId);
  }

  /**
   * Unregister from a contest
   */
  async unregisterFromContest(contestId: string, userId: string) {
    const contest = await contestRepo.getContestById(contestId);
    if (!contest) {
      throw new Error("Contest not found");
    }

    // Can only unregister if contest hasn't started or user hasn't participated
    const participant = await contestRepo.getParticipant(contestId, userId);
    if (!participant) {
      throw new Error("Not registered for this contest");
    }

    if (participant.status !== "registered") {
      throw new Error("Cannot unregister after starting the contest");
    }

    if (contest.status === "active" || new Date() >= contest.startTime) {
      throw new Error("Cannot unregister after contest has started");
    }

    await contestRepo.unregisterParticipant(contestId, userId);
  }

  /**
   * Start contest participation (when user begins the quiz)
   */
  async startContestParticipation(contestId: string, userId: string) {
    const contest = await contestRepo.getContestById(contestId);
    if (!contest) {
      throw new Error("Contest not found");
    }

    // Check if contest is active
    if (contest.status !== "active") {
      throw new Error("Contest is not active");
    }

    // Check if registered
    const participant = await contestRepo.getParticipant(contestId, userId);
    if (!participant) {
      throw new Error("Not registered for this contest");
    }

    if (participant.status !== "registered") {
      throw new Error("Contest participation already started");
    }

    // Check if contest has ended
    if (new Date() > contest.endTime) {
      throw new Error("Contest has ended");
    }

    return await contestRepo.updateParticipantStartedAt(contestId, userId, new Date());
  }

  /**
   * Complete contest participation (when user submits the quiz)
   */
  async completeContestParticipation(
    contestId: string,
    userId: string,
    attemptId: string,
    score: number
  ) {
    const contest = await contestRepo.getContestById(contestId);
    if (!contest) {
      throw new Error("Contest not found");
    }

    const participant = await contestRepo.getParticipant(contestId, userId);
    if (!participant) {
      throw new Error("Not registered for this contest");
    }

    // Update participant with score and completion
    return await contestRepo.updateParticipantCompletion(
      contestId,
      userId,
      score,
      attemptId,
      new Date()
    );
  }

  /**
   * End a contest and calculate rankings
   */
  async endContest(contestId: string) {
    const contest = await contestRepo.getContestById(contestId);
    if (!contest) {
      throw new Error("Contest not found");
    }

    if (contest.status === "ended" || contest.status === "cancelled") {
      throw new Error("Contest has already ended or been cancelled");
    }

    // Update contest status
    await contestRepo.updateContestStatus(contestId, "ended");

    // Calculate and assign ranks
    await contestRepo.calculateAndAssignRanks(contestId);

    return await contestRepo.getContestById(contestId);
  }

  /**
   * Cancel a contest
   */
  async cancelContest(contestId: string) {
    const contest = await contestRepo.getContestById(contestId);
    if (!contest) {
      throw new Error("Contest not found");
    }

    if (contest.status === "ended" || contest.status === "cancelled") {
      throw new Error("Contest has already ended or been cancelled");
    }

    if (contest.status === "active") {
      throw new Error("Cannot cancel an active contest. End it first.");
    }

    return await contestRepo.updateContestStatus(contestId, "cancelled");
  }

  /**
   * Get contest leaderboard
   */
  async getContestLeaderboard(contestId: string) {
    const contest = await contestRepo.getContestById(contestId);
    if (!contest) {
      throw new Error("Contest not found");
    }

    const participants = await contestRepo.listParticipants(contestId);
    
    return {
      contest,
      leaderboard: participants.map((p) => ({
        userId: p.userId,
        score: p.score,
        rank: p.rank,
        status: p.status,
        completedAt: p.completedAt,
      })),
    };
  }

  /**
   * Get user's contest participation history
   */
  async getUserContests(userId: string) {
    return await contestRepo.getUserContests(userId);
  }

  /**
   * Disqualify a participant
   */
  async disqualifyParticipant(contestId: string, userId: string, reason: string) {
    const contest = await contestRepo.getContestById(contestId);
    if (!contest) {
      throw new Error("Contest not found");
    }

    const participant = await contestRepo.getParticipant(contestId, userId);
    if (!participant) {
      throw new Error("Participant not found");
    }

    return await contestRepo.updateParticipantStatus(
      contestId,
      userId,
      "disqualified",
      { disqualifiedReason: reason }
    );
  }

  /**
   * Auto-update contest statuses based on time
   * This should be called periodically (e.g., via cron job)
   */
  async updateContestStatuses() {
    const now = new Date();
    
    // Get all scheduled contests that should be active
    const scheduledContests = await contestRepo.listUpcomingContests();
    for (const contest of scheduledContests) {
      if (contest.startTime <= now && contest.status === "scheduled") {
        await contestRepo.updateContestStatus(contest.id, "active");
      }
    }

    // Get all active contests that should be ended
    const activeContests = await contestRepo.listActiveContests();
    for (const contest of activeContests) {
      if (contest.endTime <= now && contest.status === "active") {
        await this.endContest(contest.id);
      }
    }
  }
}
