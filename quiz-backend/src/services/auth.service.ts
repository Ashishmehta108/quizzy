/**
 * @layer service
 * @owner agent-1
 * @tables users, workspaces, workspaceMembers, plans, billings, usage
 */
import { db } from "../config/db";
import { users, plans, billings, usage, workspaces, workspaceMembers } from "../config/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { ApiError } from "../utils/apiError";
import { redisclient } from "../utils/redis";
import { auth } from "../auth";

export interface SyncUserResult {
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: Date | null;
    apiKey: string | null;
  };
  billingCreated: boolean;
  workspaceCreated: boolean;
}

export class AuthService {
  /**
   * Sync user from Better Auth to local database
   * Creates user record, default workspace, billing if not exists
   */
  async syncUser(userId: string): Promise<SyncUserResult> {
    let user = await this.findUserById(userId);

    if (!user) {
      user = await this.createUser(userId);
    }

    const workspaceResult = await this.ensureWorkspaceAndBilling(user.id);

    return {
      user: {
        id: user.id,
        name: user.name!,
        email: user.email ?? "",
        createdAt: user.createdAt,
        apiKey: user.apiKey,
      },
      billingCreated: workspaceResult.billingCreated,
      workspaceCreated: workspaceResult.workspaceCreated,
    };
  }

  /**
   * Ensure user has at least one workspace and billing
   */
  async ensureWorkspaceAndBilling(userId: string): Promise<{
    workspaceCreated: boolean;
    billingCreated: boolean;
  }> {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const userWorkspaces = await db
      .select()
      .from(workspaceMembers)
      .where(eq(workspaceMembers.userId, userId));

    if (userWorkspaces.length === 0) {
      const workspaceId = randomUUID();
      const workspaceName = `${user.name}'s Workspace`;
      const slug =
        workspaceName.toLowerCase().replace(/[^a-z0-9]/g, "-") +
        "-" +
        randomUUID().substring(0, 5);

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

      const billingCreated = await this.initializeBilling(userId, workspaceId);

      await this.logAuthEvent(userId, "workspace_created");

      return { workspaceCreated: true, billingCreated };
    }

    return { workspaceCreated: false, billingCreated: false };
  }

  /**
   * Create new user record from Better Auth user data
   */
  async createUser(userId: string) {
    // Get user info from Better Auth session
    const session = await auth.api.getSession({
      headers: new Headers(),
    });

    const email = session?.user?.email || "";
    const name = session?.user?.name || email.split("@")[0] || "Anonymous";

    const [user] = await db
      .insert(users)
      .values({
        id: userId,
        email,
        name,
        createdAt: new Date(),
        updatedAt: new Date(),
        apiKey: randomUUID().replace(/-/g, ""),
        apiKeyLastRotatedAt: new Date(),
        
      })
      .returning();

    await this.logAuthEvent(userId, "user_created");

    return user;
  }

  /**
   * Find user by internal ID
   */
  async findUserById(id: string) {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0];
  }

  /**
   * Initialize billing and usage for a workspace
   */
  async initializeBilling(
    userId: string,
    workspaceId: string
  ): Promise<boolean> {
    const [freePlan] = await db
      .select()
      .from(plans)
      .where(eq(plans.name, "Free"))
      .limit(1);

    if (!freePlan) {
      console.warn("Free plan not found in database");
      return false;
    }

    const billingId = randomUUID();
    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + 1);

    await db.insert(billings).values({
      id: billingId,
      userId,
      workspaceId,
      planId: freePlan.id,
      startDate: now,
      endDate,
      status: "active",
      createdAt: now,
    });

    await db.insert(usage).values({
      id: randomUUID(),
      workspaceId,
      billingId,
      quizzesGeneratedUsed: 0,
      websearchesUsed: 0,
      periodStart: now,
      periodEnd: endDate,
      createdAt: now,
      updatedAt: now,
    });

    return true;
  }

  /**
   * Log authentication event to Redis for audit/monitoring
   */
  async logAuthEvent(userId: string, eventType: string): Promise<void> {
    try {
      const event = {
        userId,
        eventType,
        timestamp: new Date().toISOString(),
      };
      const key = `auth:events:${userId}`;
      await redisclient.lPush(key, JSON.stringify(event));
      await redisclient.lTrim(key, 0, 99); // Keep last 100 events
    } catch (error) {
      console.error("Failed to log auth event:", error);
    }
  }

  /**
   * Get authentication events for a user
   */
  async getAuthEvents(userId: string): Promise<string[]> {
    try {
      const key = `auth:events:${userId}`;
      const events = await redisclient.lRange(key, 0, -1);
      return events ?? [];
    } catch (error) {
      console.error("Failed to get auth events:", error);
      return [];
    }
  }
}

export const authService = new AuthService();
