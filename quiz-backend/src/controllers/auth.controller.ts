import { db } from "../config/db";
import { user, plans, billings, usage, workspaces, workspaceMembers } from "../config/db/schema";
import { eq } from "drizzle-orm";
import { Request, Response, NextFunction } from "express";
import { randomUUID } from "node:crypto";
import { ApiError } from "../utils/apiError";
import { auth } from "../auth";
import { fromNodeHeaders } from "better-auth/node";

const syncUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session || !session.user) {
      throw new ApiError(401, "Unauthorized: No active session found");
    }

    const userId = session.user.id;

    let [dbUser] = await db.select().from(user).where(eq(user.id, userId));

    if (!dbUser) {
      try {
        [dbUser] = await db
          .insert(user)
          .values({
            id: userId,
            email: session.user.email,
            name: session.user.name || "Anonymous",
            emailVerified: session.user.emailVerified || false,
            image: session.user.image,
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
    } else if (!dbUser.apiKey) {
      try {
        [dbUser] = await db
          .update(user)
          .set({
            apiKey: randomUUID().replace(/-/g, ""),
            apiKeyLastRotatedAt: new Date(),
          })
          .where(eq(user.id, userId))
          .returning();
      } catch (error: any) {
        throw new ApiError(
          500,
          `Failed to initialize API key: ${error.message}`
        );
      }
    }

    let billingCreated = false;

    // Ensure at least one workspace exists for the user
    let userWorkspaces = await db
      .select()
      .from(workspaceMembers)
      .where(eq(workspaceMembers.userId, dbUser.id));

    if (userWorkspaces.length === 0) {
      // Create a default Personal Workspace
      const workspaceId = randomUUID();
      const workspaceName = `${dbUser.name}'s Workspace`;
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
        userId: dbUser.id,
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
          userId: dbUser.id,
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
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        createdAt: dbUser.createdAt,
        apiKey: dbUser.apiKey,
      },
      billingCreated,
    });
  } catch (error: any) {
    const status = error instanceof ApiError ? error.statusCode : 500;
    console.log(error);
    const message =
      error instanceof ApiError ? error.message : "Internal server error";

    res.status(status).json({ message });
  }
};

export { syncUser };
