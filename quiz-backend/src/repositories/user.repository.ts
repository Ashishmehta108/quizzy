import { db } from "../config/db";
import { user } from "../config/db/schema";
import { eq } from "drizzle-orm";

export class UserRepository {
  async getById(id: string) {
    const result = await db.select().from(user).where(eq(user.id, id)).limit(1);
    return result[0];
  }
}

