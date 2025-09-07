import { db } from "../config/db";
import { users, plans, billings, usage } from "../config/db/schema";
import { eq } from "drizzle-orm";
import { Request, Response, NextFunction } from "express";
import { randomUUID } from "node:crypto";
import { clerkClient } from "../config/clerk/clerk";
import { ApiError } from "../utils/apiError";

const syncUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log(req.auth?.userId);
    const userId = req.auth?.userId || req.body.auth?.userId;
    if (!userId) throw new ApiError(401, "Unauthorized: User ID not provided");

    let [user] = await db.select().from(users).where(eq(users.clerkId, userId));

    if (!user) {
      let clerkUser;
      try {
        clerkUser = await clerkClient.users.getUser(userId);
      } catch {
        clerkUser = null;
      }

      const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
      const name = clerkUser?.firstName || email?.split("@")[0] || "Anonymous";

      try {
        [user] = await db
          .insert(users)
          .values({
            id: randomUUID(),
            clerkId: userId,
            email: email || "",
            name,
            createdAt: new Date(),
            updatedAt: new Date(),
            apiKey: randomUUID().replace(/-/g, ""),
            apiKeyLastRotatedAt: new Date(),
          })
          .returning();
      } catch {
        throw new ApiError(500, "Failed to create user");
      }
    }

    let billingCreated = false;

    try {
      const [existingBilling] = await db
        .select()
        .from(billings)
        .where(eq(billings.userId, user.id))
        .limit(1);

      if (!existingBilling) {
        const [freePlan] = await db
          .select()
          .from(plans)
          .where(eq(plans.name, "Free"))
          .limit(1);

        if (!freePlan) throw new ApiError(500, "Free plan not found");

        const [billing] = await db
          .insert(billings)
          .values({
            id: randomUUID(),
            userId: user.id,
            planId: freePlan.id,
            startDate: new Date(),
            endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
            status: "active",
            createdAt: new Date(),
          })
          .returning();

        const [existingUsage] = await db
          .select()
          .from(usage)
          .where(eq(usage.billingId, billing.id))
          .limit(1);

        if (!existingUsage) {
          await db.insert(usage).values({
            id: randomUUID(),
            billingId: billing.id,
            quizzesGeneratedUsed: 0,
            websearchesUsed: 0,
            periodStart: new Date(),
            periodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)),
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }

        billingCreated = true;
      }
    } catch {
      // fail silently on billing/usage issues
      billingCreated = false;
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        apiKey: user.apiKey,
      },
      billingCreated,
    });
  } catch (error: any) {
    const status = error instanceof ApiError ? error.statusCode : 500;
    console.log(error);
    const message =
      error instanceof ApiError ? error.message : "Internal server error";

    // Respond safely without console logging the error
    res.status(status).json({ message });
  }
};

export { syncUser };
