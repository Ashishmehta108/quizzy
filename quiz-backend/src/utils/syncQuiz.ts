import { db } from "../config/db/index";
import { results, user as userTable } from "../config/db/schema";
import { and, eq, gte, sql } from "drizzle-orm";
import { Request, Response } from "express";

export const quizzesThisMonth = async (req: Request, res: Response) => {
  const authUser = (req as any).betterAuthUser;

  if (!authUser?.id) {
    throw new Error("Unauthorized");
  }

  const [data] = await db
    .select({
      userId: userTable.id,
      name: userTable.name,
      quizzesCompletedThisMonth: sql<number>`COUNT(${results.id})`,
    })
    .from(userTable)
    .where(eq(userTable.id, authUser.id))
    .leftJoin(
      results,
      and(
        eq(userTable.id, results.userId),
        gte(results.submittedAt, sql`date_trunc('month', now())`)
      )
    );

  return (
    data.quizzesCompletedThisMonth ?? { userId: authUser.id, quizzesCompletedThisMonth: 0 }
);
};
