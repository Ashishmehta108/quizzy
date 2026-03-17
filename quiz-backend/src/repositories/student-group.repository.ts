/**
 * @layer repository
 * @owner agent-2
 * @tables student_groups, workspaces
 */
import { db } from "../config/db";
import { studentGroups } from "../config/db/schema";
import { eq, and } from "drizzle-orm";

export class StudentGroupRepository {
  async createGroup(data: { workspaceId: string; name: string; description?: string }) {
    const result = await db.insert(studentGroups).values(data).returning();
    return result[0];
  }

  async getGroupById(id: string) {
    const result = await db.select().from(studentGroups).where(eq(studentGroups.id, id));
    return result[0];
  }

  async listGroupsByWorkspace(workspaceId: string) {
    return await db.select().from(studentGroups).where(eq(studentGroups.workspaceId, workspaceId));
  }

  async deleteGroup(id: string) {
    await db.delete(studentGroups).where(eq(studentGroups.id, id));
  }
}
