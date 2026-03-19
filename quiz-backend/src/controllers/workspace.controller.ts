/**
 * @layer controller
 * @owner agent-1
 * @tables workspaces, workspace_members, plans, billings, usage, usage_ledger
 */
import { Response } from "express";
import { WorkspaceService } from "../services/workspace.service";
import { BillingService } from "../services/billing.service";

const workspaceService = new WorkspaceService();
const billingService = new BillingService();

export class WorkspaceController {
  async createWorkspace(req: any, res: Response) {
    try {
      const { name } = req.body;
      const dbUserId = req.user.id;

      const workspace = await workspaceService.createWorkspace(dbUserId, name);
      // Create initial billing
      await billingService.createInitialBilling(workspace.id, dbUserId);

      res.status(200).json({ success: true, data: workspace });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async listUserWorkspaces(req: any, res: Response) {
    try {
      const dbUserId = req.user.id;
      const workspaces = await workspaceService.getUserWorkspaces(dbUserId);
      res.status(200).json({ success: true, data: workspaces });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getWorkspaceDetail(req: any, res: Response) {
    // req.workspace is already attached by middleware
    res.status(200).json({ success: true, data: req.workspace });
  }

  async updateWorkspace(req: any, res: Response) {
    try {
      const { name, logoUrl } = req.body;
      const workspace = await workspaceService.updateWorkspace(req.workspace.id, { name, logoUrl });
      res.status(200).json({ success: true, data: workspace });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async listMembers(req: any, res: Response) {
    try {
      const members = await workspaceService.listMembers(req.workspace.id);
      res.status(200).json({ success: true, data: members });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getEntitlements(req: any, res: Response) {
    try {
      const plan = await billingService.getCurrentPlan(req.workspace.id);
      const usage = await billingService.getUsageSummary(req.workspace.id);
      res.status(200).json({ success: true, data: { plan, usage } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
