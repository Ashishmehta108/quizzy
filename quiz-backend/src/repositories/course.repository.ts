/**
 * @layer repository
 * @owner agent-2
 * @tables courses, workspaces
 */
import { db } from "../config/db";
import { courses } from "../config/db/schema";
import { eq, and } from "drizzle-orm";

export class CourseRepository {
  async createCourse(data: { workspaceId: string; title: string; description?: string; thumbnailUrl?: string }) {
    const result = await db.insert(courses).values(data).returning();
    return result[0];
  }

  async getCourseById(id: string) {
    const result = await db.select().from(courses).where(eq(courses.id, id));
    return result[0];
  }

  async listCoursesByWorkspace(workspaceId: string) {
    return await db.select().from(courses).where(eq(courses.workspaceId, workspaceId));
  }

  async updateCourse(id: string, data: Partial<{ title: string; description: string; thumbnailUrl: string }>) {
    const result = await db
      .update(courses)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return result[0];
  }

  async deleteCourse(id: string) {
    await db.delete(courses).where(eq(courses.id, id));
  }
}
