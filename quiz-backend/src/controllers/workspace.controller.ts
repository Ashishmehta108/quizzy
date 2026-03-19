/**
 * @layer controller
 * @owner agent-1
 * @tables workspaces, workspace_members, plans, billings, usage, usage_ledger
 */
import { Response, Request } from "express";
import { WorkspaceService } from "../services/workspace.service";
import { BillingService } from "../services/billing.service";
import { WORKSPACE_ROLES, WorkspaceRole } from "../middlewares/role.middleware";
import { ApiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";

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

  /**
   * Add a member to the workspace
   * Only owners and admins can add members
   */
  addMember = asyncHandler(async (req: any, res: Response) => {
    const { email, role } = req.body;

    if (!email) {
      throw new ApiError(400, "Email is required");
    }

    // Validate role
    const validRoles = Object.values(WORKSPACE_ROLES);
    if (role && !validRoles.includes(role as WorkspaceRole)) {
      throw new ApiError(400, `Invalid role. Must be one of: ${validRoles.join(", ")}`);
    }

    // Default to learner role if not specified
    const memberRole = (role as WorkspaceRole) || WORKSPACE_ROLES.LEARNER;

    // Prevent adding owners except through special process
    if (memberRole === WORKSPACE_ROLES.OWNER) {
      throw new ApiError(403, "Cannot add owner role through API. Use workspace transfer process.");
    }

    const member = await workspaceService.addMemberByEmail(
      req.workspace.id,
      email,
      memberRole
    );

    res.status(200).json({ success: true, data: member });
  });

  /**
   * Update a member's role
   * Only owners can promote to admin/instructor
   * Admins can promote/demote learners
   */
  updateMemberRole = asyncHandler(async (req: any, res: Response) => {
    const { memberId } = req.params;
    const { role } = req.body;
    const currentRole = req.workspace.role as WorkspaceRole;

    if (!role) {
      throw new ApiError(400, "Role is required");
    }

    const validRoles = Object.values(WORKSPACE_ROLES);
    if (!validRoles.includes(role as WorkspaceRole)) {
      throw new ApiError(400, `Invalid role. Must be one of: ${validRoles.join(", ")}`);
    }

    const newRole = role as WorkspaceRole;

    // Role hierarchy validation
    // Owners can do anything (except transfer ownership)
    // Admins can't modify owners or other admins
    // Instructors can't modify roles
    if (currentRole === WORKSPACE_ROLES.ADMIN) {
      if (newRole === WORKSPACE_ROLES.OWNER || newRole === WORKSPACE_ROLES.ADMIN) {
        throw new ApiError(403, "Admins cannot promote members to owner or admin roles");
      }
    }

    if (currentRole === WORKSPACE_ROLES.INSTRUCTOR) {
      throw new ApiError(403, "Instructors cannot modify member roles");
    }

    if (currentRole === WORKSPACE_ROLES.LEARNER) {
      throw new ApiError(403, "Learners cannot modify member roles");
    }

    const member = await workspaceService.updateMemberRole(memberId, newRole);

    res.status(200).json({ success: true, data: member });
  });

  /**
   * Remove a member from the workspace
   * Only owners and admins can remove members
   * Cannot remove the last owner
   */
  removeMember = asyncHandler(async (req: any, res: Response) => {
    const { memberId } = req.params;
    const currentRole = req.workspace.role as WorkspaceRole;

    // Get the member to be removed
    const memberToDelete = await workspaceService.getMemberById(memberId);
    if (!memberToDelete) {
      throw new ApiError(404, "Member not found");
    }

    // Prevent removing owners unless you're an owner
    if (memberToDelete.role === WORKSPACE_ROLES.OWNER && currentRole !== WORKSPACE_ROLES.OWNER) {
      throw new ApiError(403, "Only owners can remove other owners");
    }

    // Check if this is the last owner
    if (memberToDelete.role === WORKSPACE_ROLES.OWNER) {
      const allMembers = await workspaceService.listMembers(req.workspace.id);
      const owners = allMembers.filter(m => m.role === WORKSPACE_ROLES.OWNER);
      if (owners.length <= 1) {
        throw new ApiError(400, "Cannot remove the last owner of the workspace");
      }
    }

    await workspaceService.removeMember(memberId);

    res.status(200).json({ success: true, message: "Member removed successfully" });
  });

  /**
   * Get current user's role in the workspace
   */
  getMyRole = asyncHandler(async (req: any, res: Response) => {
    res.status(200).json({ 
      success: true, 
      data: { 
        role: req.workspace.role,
        workspaceId: req.workspace.id,
        workspaceName: req.workspace.name
      } 
    });
  });
}
