/**
 * @layer service
 * @owner agent-1
 * @tables workspaces, workspace_members, plans, billings, usage, usage_ledger
 */
import { BillingRepository } from "../repositories/billing.repository";

const billingRepo = new BillingRepository();

export class BillingService {
  async listPlans() {
    return await billingRepo.listPlans();
  }

  async getCurrentPlan(workspaceId: string) {
    const billing = await billingRepo.getActiveBillingByWorkspace(workspaceId);
    if (!billing) return null;
    return await billingRepo.getPlanById(billing.planId);
  }

  async getUsageSummary(workspaceId: string) {
    return await billingRepo.getUsageByWorkspace(workspaceId);
  }

  async getUsageLedger(workspaceId: string) {
    return await billingRepo.getUsageLedgerSummary(workspaceId);
  }

  async createInitialBilling(workspaceId: string, userId: string) {
    // Find free plan
    const plans = await billingRepo.listPlans();
    const freePlan = plans.find(p => p.name.toLowerCase() === "free");
    
    if (!freePlan) throw new Error("Free plan not found in database");

    const billing = await billingRepo.createBilling({
      workspaceId,
      userId,
      planId: freePlan.id,
      status: "active",
      startDate: new Date(),
    });

    await billingRepo.createUsage({
      workspaceId,
      billingId: billing.id,
      websearchesUsed: 0,
      quizzesGeneratedUsed: 0,
      periodStart: new Date(),
    });

    return billing;
  }
}
