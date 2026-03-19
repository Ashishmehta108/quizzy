/**
 * @layer repository
 * @owner agent-1
 * @tables users
 */
import { db } from "../config/db";
import { users } from "../config/db/schema";
import { eq } from "drizzle-orm";

export class UserRepository {
  async getByClerkId(clerkId: string) {
    const result = await db.select().from(users).where(eq(users.clerkId, clerkId)).limit(1);
    return result[0];
  }

  async getById(id: string) {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getByEmail(email: string) {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }
}
