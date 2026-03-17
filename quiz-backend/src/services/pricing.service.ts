/**
 * @layer service
 * @owner agent-4
 */

export interface UpgradePrompt {
  triggered: boolean;
  triggerAction: string;
  currentLimit: number;
  currentUsage: number;
  upgradePlan: string;
  message: string;
  ctaText: string;
  ctaUrl: string;
}

export async function checkUpgradeTrigger(
  workspaceId: string,
  action: string,
): Promise<UpgradePrompt | null> {
  const limits: Record<string, number> = {
    "assignment_created": 1,
    "student_seats": 25,
    "export_downloaded": 0,
    "material_ingested": 50,
    "ai_generation": 5
  };
  
  const messages: Record<string, string> = {
    "assignment_created": "Upgrade to Educator Pro for unlimited assignments",
    "student_seats": "Your plan supports 25 students. Upgrade to add more.",
    "export_downloaded": "Upgrade to Pro to export your results as CSV",
    "material_ingested": "You've reached the free plan's material limit",
    "ai_generation": "Upgrade for more AI-generated assessments"
  };

  return {
    triggered: true,
    triggerAction: action,
    currentLimit: limits[action] || 0,
    currentUsage: (limits[action] || 0) + 1,
    upgradePlan: "Educator Pro",
    message: messages[action] || "Upgrade your plan",
    ctaText: "Upgrade Now",
    ctaUrl: "/pricing"
  };
}

export async function checkEntitlement(workspaceId: string, feature: string) {
  if (feature === "export_downloaded") {
    return { allowed: false, reason: "Upgrade to Pro to export your results as CSV" };
  }
  return { allowed: true, reason: null };
}
