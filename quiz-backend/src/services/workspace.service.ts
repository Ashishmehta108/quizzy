/**
 * @layer service
 * @owner agent-1
 * @tables workspaces, workspace_members, plans, billings, usage, usage_ledger
 */
import { WorkspaceRepository } from "../repositories/workspace.repository";
import { UserRepository } from "../repositories/user.repository";
import { WorkspaceRole } from "../middlewares/role.middleware";

const workspaceRepo = new WorkspaceRepository();
const userRepo = new UserRepository();

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

  /**
   * Add a member to the workspace by email
   * Looks up user by email and adds them with the specified role
   */
  async addMemberByEmail(workspaceId: string, email: string, role: WorkspaceRole) {
    // Look up user by email
    const user = await userRepo.getByEmail(email);
    if (!user) {
      throw new Error(`User with email ${email} not found. Please invite them to join the platform first.`);
    }

    // Check if user is already a member
    const existingMember = await workspaceRepo.getMember(workspaceId, user.id);
    if (existingMember) {
      throw new Error(`User ${email} is already a member of this workspace`);
    }

    // Add member
    const member = await workspaceRepo.addMember({
      workspaceId,
      userId: user.id,
      role,
    });

    return {
      ...member,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async listMembers(workspaceId: string) {
    const members = await workspaceRepo.listMembers(workspaceId);
    
    // Enrich with user details
    const enrichedMembers = await Promise.all(
      members.map(async (member) => {
        const user = await userRepo.getById(member.userId);
        return {
          ...member,
          user: user ? {
            id: user.id,
            email: user.email,
            name: user.name,
          } : null,
        };
      })
    );

    return enrichedMembers;
  }

  async updateMemberRole(memberId: string, role: WorkspaceRole) {
    return await workspaceRepo.updateMemberRole(memberId, role);
  }

  async removeMember(memberId: string) {
    await workspaceRepo.removeMember(memberId);
  }

  async checkMembership(workspaceId: string, userId: string) {
    return await workspaceRepo.getMember(workspaceId, userId);
  }

  async getMemberById(memberId: string) {
    return await workspaceRepo.getMemberById(memberId);
  }
}
