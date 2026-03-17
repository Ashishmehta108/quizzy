/**
 * @layer service
 * @owner agent-1
 * @tables workspaces, workspace_members, plans, billings, usage, usage_ledger
 */
import { WorkspaceRepository } from "../repositories/workspace.repository";

const workspaceRepo = new WorkspaceRepository();

export class WorkspaceService {
  async createWorkspace(userId: string, name: string) {
    // Basic validation
    if (!name || name.length < 3 || name.length > 200) {
      throw new Error("Workspace name must be between 3 and 200 characters");
    }

    const slug = name.toLowerCase().replace(/[^a-z0-0]/g, "-") + "-" + Math.random().toString(36).substring(2, 7);
    
    const workspace = await workspaceRepo.createWorkspace({ name, slug });
    
    // Add creator as owner
    await workspaceRepo.addMember({
      workspaceId: workspace.id,
      userId,
      role: "owner",
    });

    return workspace;
  }

  async getUserWorkspaces(userId: string) {
    return await workspaceRepo.listUserWorkspaces(userId);
  }

  async getWorkspaceDetail(workspaceId: string) {
    return await workspaceRepo.getWorkspaceById(workspaceId);
  }

  async updateWorkspace(workspaceId: string, data: { name?: string; logoUrl?: string }) {
    return await workspaceRepo.updateWorkspace(workspaceId, data);
  }

  async addMemberByEmail(workspaceId: string, email: string, role: any) {
    // In a real app, you'd look up user by email or send an invite.
    // For now, we'll assume we have the userId somehow or logic to handle it.
    // This is a placeholder for the logic.
    throw new Error("Invite by email not implemented yet - needs user lookup");
  }

  async listMembers(workspaceId: string) {
    return await workspaceRepo.listMembers(workspaceId);
  }

  async updateMemberRole(memberId: string, role: any) {
    return await workspaceRepo.updateMemberRole(memberId, role);
  }

  async removeMember(memberId: string) {
    await workspaceRepo.removeMember(memberId);
  }

  async checkMembership(workspaceId: string, userId: string) {
    return await workspaceRepo.getMember(workspaceId, userId);
  }
}
