/**
 * @layer repository
 * @owner agent-1
 * @tables workspaces, workspace_members, plans, billings, usage, usage_ledger
 */
import { db } from "../config/db";
import { workspaces, workspaceMembers, users } from "../config/db/schema";
import { eq, and } from "drizzle-orm";

export class WorkspaceRepository {
  async createWorkspace(data: { name: string; slug: string; logoUrl?: string }) {
    const result = await db.insert(workspaces).values(data).returning();
    console.log("SQL execution: createWorkspace", result);
    return result[0];
  }

  async getWorkspaceById(id: string) {
    const result = await db.select().from(workspaces).where(eq(workspaces.id, id));
    return result[0];
  }

  async getWorkspaceBySlug(slug: string) {
    const result = await db.select().from(workspaces).where(eq(workspaces.slug, slug));
    return result[0];
  }

  async listUserWorkspaces(userId: string) {
    const result = await db
      .select({
        id: workspaces.id,
        name: workspaces.name,
        slug: workspaces.slug,
        logoUrl: workspaces.logoUrl,
        role: workspaceMembers.role,
      })
      .from(workspaces)
      .innerJoin(workspaceMembers, eq(workspaces.id, workspaceMembers.workspaceId))
      .where(eq(workspaceMembers.userId, userId));
    return result;
  }

  async updateWorkspace(id: string, data: Partial<{ name: string; logoUrl: string }>) {
    const result = await db
      .update(workspaces)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(workspaces.id, id))
      .returning();
    return result[0];
  }

  async deleteWorkspace(id: string) {
    await db.delete(workspaces).where(eq(workspaces.id, id));
  }

  // Member management
  async addMember(data: { workspaceId: string; userId: string; role: "owner" | "admin" | "instructor" | "learner" }) {
    const result = await db.insert(workspaceMembers).values(data).returning();
    return result[0];
  }

  async getMember(workspaceId: string, userId: string) {
    const result = await db
      .select()
      .from(workspaceMembers)
      .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, userId)));
    return result[0];
  }

  async getMemberById(memberId: string) {
    const result = await db
      .select()
      .from(workspaceMembers)
      .where(eq(workspaceMembers.id, memberId));
    return result[0];
  }

  async listMembers(workspaceId: string) {
    const result = await db
      .select()
      .from(workspaceMembers)
      .where(eq(workspaceMembers.workspaceId, workspaceId));
    return result;
  }

  async updateMemberRole(id: string, role: "owner" | "admin" | "instructor" | "learner") {
    const result = await db
      .update(workspaceMembers)
      .set({ role })
      .where(eq(workspaceMembers.id, id))
      .returning();
    return result[0];
  }

  async removeMember(id: string) {
    await db.delete(workspaceMembers).where(eq(workspaceMembers.id, id));
  }
}
