/**
 * @layer service
 * @owner agent-1
 * @tables workspaces, workspace_members, plans, billings, usage, usage_ledger
 */
import { BillingRepository } from "../repositories/billing.repository";

const billingRepo = new BillingRepository();

export async function checkEntitlement(
  workspaceId: string,
  action: "assignment_created" | "attempt_submitted" | "ai_generation" | "material_ingested" | "export_downloaded" | "websearch_used",
  quantity: number = 1
): Promise<{
  allowed: boolean;
  limit: number;
  used: number;
  remaining: number;
}> {
  const billing = await billingRepo.getActiveBillingByWorkspace(workspaceId);
  if (!billing) {
    // Default to free if no billing found? Or strict deny?
    // Let's assume there's always a billing record (inserted on workspace creation)
    return { allowed: false, limit: 0, used: 0, remaining: 0 };
  }

  const plan = await billingRepo.getPlanById(billing.planId);
  if (!plan) return { allowed: false, limit: 0, used: 0, remaining: 0 };

  const usageStats = await billingRepo.getUsageByWorkspace(workspaceId);
  
  // Map action to plan column and usage column
  let limit = 0;
  let used = 0;

  switch (action) {
    case "assignment_created":
      limit = plan.maxAssignmentsPerMonth;
      // In a real app, you'd count from usage_ledger or a counter
      // For now, let's use a placeholder count or implement the ledger query
      break;
    case "attempt_submitted":
      limit = plan.maxAttemptsPerMonth;
      break;
    case "ai_generation":
      limit = plan.maxAiGenerations;
      break;
    case "material_ingested":
      limit = plan.maxMaterialPages;
      break;
    case "websearch_used":
      limit = plan.maxWebsearches;
      used = usageStats?.websearchesUsed || 0;
      break;
    case "export_downloaded":
      // Export check is usually binary or a count
      const canExport = (plan.exportTypes as string[]).includes("csv");
      return { allowed: canExport, limit: canExport ? 1 : 0, used: 0, remaining: canExport ? 1 : 0 };
  }

  // Handle unlimited (-1)
  if (limit === -1) {
    return { allowed: true, limit: -1, used, remaining: 999999 };
  }

  const allowed = (used + quantity) <= limit;
  return {
    allowed,
    limit,
    used,
    remaining: limit - used,
  };
}
