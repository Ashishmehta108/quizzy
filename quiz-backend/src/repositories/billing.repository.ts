/**
 * @layer repository
 * @owner agent-1
 * @tables workspaces, workspace_members, plans, billings, usage, usage_ledger
 */
import { db } from "../config/db";
import { plans, billings, usage, usageLedger } from "../config/db/schema";
import { eq, and, desc } from "drizzle-orm";

export class BillingRepository {
  async getPlanById(id: string) {
    const result = await db.select().from(plans).where(eq(plans.id, id));
    return result[0];
  }

  async listPlans() {
    return await db.select().from(plans);
  }

  async getActiveBillingByWorkspace(workspaceId: string) {
    const result = await db
      .select()
      .from(billings)
      .where(and(eq(billings.workspaceId, workspaceId), eq(billings.status, "active")))
      .orderBy(desc(billings.createdAt))
      .limit(1);
    return result[0];
  }

  async createBilling(data: any) {
    const result = await db.insert(billings).values(data).returning();
    return result[0];
  }

  async updateBilling(id: string, data: any) {
    const result = await db
      .update(billings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(billings.id, id))
      .returning();
    return result[0];
  }

  async getUsageByWorkspace(workspaceId: string) {
    const result = await db
      .select()
      .from(usage)
      .where(eq(usage.workspaceId, workspaceId))
      .limit(1);
    return result[0];
  }

  async createUsage(data: any) {
    const result = await db.insert(usage).values(data).returning();
    return result[0];
  }

  async updateUsage(id: string, data: any) {
    const result = await db
      .update(usage)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(usage.id, id))
      .returning();
    return result[0];
  }

  async logUsageEvent(data: { workspaceId: string; eventType: any; quantity?: number; metadata?: any }) {
    const result = await db.insert(usageLedger).values(data).returning();
    return result[0];
  }

  async getUsageLedgerSummary(workspaceId: string) {
    return await db
      .select()
      .from(usageLedger)
      .where(eq(usageLedger.workspaceId, workspaceId))
      .orderBy(desc(usageLedger.createdAt));
  }
}
