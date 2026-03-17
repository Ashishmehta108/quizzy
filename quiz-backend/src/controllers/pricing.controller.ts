/**
 * @layer controller
 * @owner agent-4
 */
import { Request, Response } from "express";
import { db } from "../config/db/index";
import { plans } from "../config/db/schema";
import { checkUpgradeTrigger } from "../services/pricing.service";

export const getPricingPlans = async (req: Request, res: Response) => {
  try {
    const allPlans = await db.select().from(plans);
    return res.status(200).json({ success: true, data: allPlans });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || "Internal server error" });
  }
};

export const getCurrentPlan = async (req: Request, res: Response) => {
  try {
    // Mock for now, would join with billings
    return res.status(200).json({
      success: true,
      data: {
        planName: "Free",
        usage: { assignments: 1, requests: 3 }
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || "Internal server error" });
  }
};

export const checkUpgrade = async (req: Request, res: Response) => {
  try {
    const { action } = req.query;
    const workspaceId = req.headers["x-workspace-id"] as string || "default";
    
    if (!action) return res.status(400).json({ success: false, error: "Action is required" });
    
    const prompt = await checkUpgradeTrigger(workspaceId, String(action));
    return res.status(200).json({ success: true, data: prompt });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || "Internal server error" });
  }
};

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    // Placeholder for stripe
    return res.status(200).json({ success: true, data: { checkoutUrl: "/pricing/success" } });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || "Internal server error" });
  }
};
