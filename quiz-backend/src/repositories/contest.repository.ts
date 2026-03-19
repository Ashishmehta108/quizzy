/**
 * @layer repository
 * @owner agent-2
 * @tables contests, contest_participants
 */
import { db } from "../config/db";
import { contests, contestParticipants } from "../config/db/schema";
import { eq, and, desc, asc, gte, lte, lt, gt, or } from "drizzle-orm";
import { randomUUID } from "node:crypto";

export interface CreateContestData {
  workspaceId: string;
  quizId: string;
  title: string;
  description?: string;
  status?: "scheduled" | "active" | "ended" | "cancelled";
  startTime: Date;
  endTime: Date;
  maxParticipants?: number;
  registrationDeadline?: Date;
  isPublic?: boolean;
  prizeInfo?: string;
  rules?: string;
  createdBy: string;
}

export interface UpdateContestData {
  title?: string;
  description?: string;
  status?: "scheduled" | "active" | "ended" | "cancelled";
  startTime?: Date;
  endTime?: Date;
  maxParticipants?: number;
  registrationDeadline?: Date;
  isPublic?: boolean;
  prizeInfo?: string;
  rules?: string;
}

export class ContestRepository {
  // ==================== CONTEST CRUD ====================

  async createContest(data: CreateContestData) {
    const shareToken = randomUUID();
    const result = await db
      .insert(contests)
      .values({ ...data, shareToken })
      .returning();
    return result[0];
  }

  async getContestById(id: string) {
    const result = await db.select().from(contests).where(eq(contests.id, id));
    return result[0];
  }

  async getContestByShareToken(token: string) {
    const result = await db.select().from(contests).where(eq(contests.shareToken, token));
    return result[0];
  }

  async listContestsByWorkspace(workspaceId: string) {
    return await db
      .select()
      .from(contests)
      .where(eq(contests.workspaceId, workspaceId))
      .orderBy(desc(contests.createdAt));
  }

  async listActiveContests(workspaceId?: string) {
    const now = new Date();
    const conditions = [
      eq(contests.status, "active"),
      lte(contests.startTime, now),
      gte(contests.endTime, now),
    ];

    if (workspaceId) {
      conditions.push(eq(contests.workspaceId, workspaceId));
    }

    return await db
      .select()
      .from(contests)
      .where(and(...conditions))
      .orderBy(desc(contests.startTime));
  }

  async listUpcomingContests(workspaceId?: string) {
    const now = new Date();
    const conditions = [
      eq(contests.status, "scheduled"),
      gt(contests.startTime, now),
    ];

    if (workspaceId) {
      conditions.push(eq(contests.workspaceId, workspaceId));
    }

    return await db
      .select()
      .from(contests)
      .where(and(...conditions))
      .orderBy(asc(contests.startTime));
  }

  async updateContest(id: string, data: UpdateContestData) {
    const result = await db
      .update(contests)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(contests.id, id))
      .returning();
    return result[0];
  }

  async deleteContest(id: string) {
    await db.delete(contests).where(eq(contests.id, id));
  }

  async updateContestStatus(id: string, status: "scheduled" | "active" | "ended" | "cancelled") {
    const result = await db
      .update(contests)
      .set({ status, updatedAt: new Date() })
      .where(eq(contests.id, id))
      .returning();
    return result[0];
  }

  // ==================== CONTEST PARTICIPANTS ====================

  async registerParticipant(contestId: string, userId: string) {
    const result = await db
      .insert(contestParticipants)
      .values({
        contestId,
        userId,
        status: "registered",
      })
      .returning();
    return result[0];
  }

  async getParticipant(contestId: string, userId: string) {
    const result = await db
      .select()
      .from(contestParticipants)
      .where(and(eq(contestParticipants.contestId, contestId), eq(contestParticipants.userId, userId)));
    return result[0];
  }

  async listParticipants(contestId: string) {
    return await db
      .select()
      .from(contestParticipants)
      .where(eq(contestParticipants.contestId, contestId))
      .orderBy(desc(contestParticipants.score), asc(contestParticipants.completedAt));
  }

  async getParticipantCount(contestId: string) {
    const result = await db
      .select({ count: db.$count(contestParticipants.id) })
      .from(contestParticipants)
      .where(eq(contestParticipants.contestId, contestId));
    return result[0]?.count || 0;
  }

  async updateParticipantStatus(
    contestId: string,
    userId: string,
    status: "registered" | "participated" | "completed" | "disqualified",
    extraData?: { score?: number; attemptId?: string; completedAt?: Date; disqualifiedReason?: string }
  ) {
    const updateData: any = { status };
    if (extraData) {
      if (extraData.score !== undefined) updateData.score = extraData.score;
      if (extraData.attemptId) updateData.attemptId = extraData.attemptId;
      if (extraData.completedAt) updateData.completedAt = extraData.completedAt;
      if (extraData.disqualifiedReason) updateData.disqualifiedReason = extraData.disqualifiedReason;
    }

    const result = await db
      .update(contestParticipants)
      .set(updateData)
      .where(and(eq(contestParticipants.contestId, contestId), eq(contestParticipants.userId, userId)))
      .returning();
    return result[0];
  }

  async updateParticipantStartedAt(contestId: string, userId: string, startedAt: Date) {
    const result = await db
      .update(contestParticipants)
      .set({ startedAt, status: "participated" })
      .where(and(eq(contestParticipants.contestId, contestId), eq(contestParticipants.userId, userId)))
      .returning();
    return result[0];
  }

  async updateParticipantCompletion(
    contestId: string,
    userId: string,
    score: number,
    attemptId: string,
    completedAt: Date
  ) {
    const result = await db
      .update(contestParticipants)
      .set({
        score,
        attemptId,
        completedAt,
        status: "completed",
      })
      .where(and(eq(contestParticipants.contestId, contestId), eq(contestParticipants.userId, userId)))
      .returning();
    return result[0];
  }

  async calculateAndAssignRanks(contestId: string) {
    // Get all completed participants ordered by score (desc) and completion time (asc)
    const participants = await db
      .select()
      .from(contestParticipants)
      .where(
        and(
          eq(contestParticipants.contestId, contestId),
          eq(contestParticipants.status, "completed")
        )
      )
      .orderBy(desc(contestParticipants.score), asc(contestParticipants.completedAt));

    // Assign ranks
    let currentRank = 1;
    let previousScore: number | null = null;

    for (let i = 0; i < participants.length; i++) {
      const participant = participants[i];
      
      // If score is same as previous, keep same rank
      if (previousScore !== null && participant.score === previousScore) {
        // Same rank as previous
      } else {
        currentRank = i + 1;
      }
      
      await db
        .update(contestParticipants)
        .set({ rank: currentRank })
        .where(eq(contestParticipants.id, participant.id));

      previousScore = participant.score;
    }

    return participants.length;
  }

  async unregisterParticipant(contestId: string, userId: string) {
    await db
      .delete(contestParticipants)
      .where(and(eq(contestParticipants.contestId, contestId), eq(contestParticipants.userId, userId)));
  }

  async getUserContests(userId: string) {
    return await db
      .select({
        contest: contests,
        participant: contestParticipants,
      })
      .from(contestParticipants)
      .innerJoin(contests, eq(contests.id, contestParticipants.contestId))
      .where(eq(contestParticipants.userId, userId))
      .orderBy(desc(contests.createdAt));
  }
}
