/**
 * @layer repository
 * @owner agent-3
 * @tables assignments, assignment_members, quizzes
 */
import { db } from "../config/db";
import { assignments, assignmentMembers } from "../config/db/schema";
import { eq, and } from "drizzle-orm";

export class AssignmentRepository {
  async createAssignment(data: any) {
    const result = await db.insert(assignments).values(data).returning();
    return result[0];
  }

  async getAssignmentById(id: string) {
    const result = await db.select().from(assignments).where(eq(assignments.id, id));
    return result[0];
  }

  async getAssignmentByShareToken(token: string) {
    const result = await db.select().from(assignments).where(eq(assignments.shareToken, token));
    return result[0];
  }

  async listAssignmentsByWorkspace(workspaceId: string) {
    return await db.select().from(assignments).where(eq(assignments.workspaceId, workspaceId));
  }

  async updateAssignment(id: string, data: any) {
    const result = await db
      .update(assignments)
      .set(data)
      .where(eq(assignments.id, id))
      .returning();
    return result[0];
  }

  // Members
  async addMember(data: any) {
    const result = await db.insert(assignmentMembers).values(data).returning();
    return result[0];
  }

  async getMember(assignmentId: string, userId: string) {
    const result = await db
      .select()
      .from(assignmentMembers)
      .where(and(eq(assignmentMembers.assignmentId, assignmentId), eq(assignmentMembers.userId, userId)));
    return result[0];
  }

  async listMembers(assignmentId: string) {
    return await db.select().from(assignmentMembers).where(eq(assignmentMembers.assignmentId, assignmentId));
  }

  async updateMemberStatus(assignmentId: string, userId: string, status: string) {
    await db
      .update(assignmentMembers)
      .set({ status })
      .where(and(eq(assignmentMembers.assignmentId, assignmentId), eq(assignmentMembers.userId, userId)));
  }

  async incrementAttempts(assignmentId: string, userId: string) {
    // Note: Drizzle raw sql or increment logic
    // For now simple update
    const member = await this.getMember(assignmentId, userId);
    if (member) {
      await db
        .update(assignmentMembers)
        .set({ attemptsUsed: member.attemptsUsed + 1, lastAttemptAt: new Date() })
        .where(and(eq(assignmentMembers.assignmentId, assignmentId), eq(assignmentMembers.userId, userId)));
    }
  }
}
