import { db } from "../config/db";
import { users, plans, billings, usage, workspaces, workspaceMembers } from "../config/db/schema";
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
      } catch (error: any) {
        throw new ApiError(
          500,
          `Failed to create user record: ${error.message}`
        );
      }
    }

    let billingCreated = false;

    // Ensure at least one workspace exists for the user
    let userWorkspaces = await db
      .select()
      .from(workspaceMembers)
      .where(eq(workspaceMembers.userId, user.id));

    if (userWorkspaces.length === 0) {
      // Create a default Personal Workspace
      const workspaceId = randomUUID();
      const workspaceName = `${user.name}'s Workspace`;
      const slug = workspaceName.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + randomUUID().substring(0, 5);

      await db.insert(workspaces).values({
        id: workspaceId,
        name: workspaceName,
        slug,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await db.insert(workspaceMembers).values({
        id: randomUUID(),
        workspaceId,
        userId: user.id,
        role: "owner",
        joinedAt: new Date(),
      });

      // Initialize billing for this new workspace
      const [freePlan] = await db
        .select()
        .from(plans)
        .where(eq(plans.name, "Free"))
        .limit(1);

      if (freePlan) {
        const billingId = randomUUID();
        await db.insert(billings).values({
          id: billingId,
          userId: user.id,
          workspaceId,
          planId: freePlan.id,
          startDate: new Date(),
          endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
          status: "active",
          createdAt: new Date(),
        });

        await db.insert(usage).values({
          id: randomUUID(),
          workspaceId,
          billingId,
          quizzesGeneratedUsed: 0,
          websearchesUsed: 0,
          periodStart: new Date(),
          periodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1)),
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        billingCreated = true;
      }
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
