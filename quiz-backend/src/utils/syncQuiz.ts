import { db } from "@/config/db";
import { results, users } from "@/config/db/schema";
import { and, eq, gte, sql } from "drizzle-orm";
import { Request, Response } from "express";
export const quizzesThisMonth = async (req: Request, res: Response) => {
  const userId = req.auth?.userId;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const [data] = await db
    .select({
      userId: users.id,
      name: users.name,
      quizzesCompletedThisMonth: sql<number>`COUNT(${results.id})`,
    })
    .from(users)
    .where(eq(users.clerkId, userId))
    .leftJoin(
      results,
      and(
        eq(users.id, results.userId),
        gte(results.submittedAt, sql`date_trunc('month', now())`)
      )
    );

  return (
    data.quizzesCompletedThisMonth ?? { userId, quizzesCompletedThisMonth: 0 }
  );
};
