/**
 * @layer service
 * @owner agent-3
 * @tables assignments, assignment_members, quizzes
 */
import { AssignmentRepository } from "../repositories/assignment.repository";
import { QuizRepository } from "../repositories/quiz.repository";
import { checkEntitlement } from "./entitlements.service";
import { randomBytes } from "crypto";

const assignRepo = new AssignmentRepository();
const quizRepo = new QuizRepository();

export class AssignmentService {
  async createAssignment(workspaceId: string, data: any) {
    const entitlement = await checkEntitlement(workspaceId, "assignment_created");
    if (!entitlement.allowed) {
      throw new Error(`Limit reached: ${entitlement.limit} assignments allowed.`);
    }

    const shareToken = randomBytes(16).toString("hex");
    return await assignRepo.createAssignment({
      ...data,
      workspaceId,
      shareToken,
    });
  }

  async publishAssignment(id: string) {
    return await assignRepo.updateAssignment(id, { publishedAt: new Date() });
  }

  async joinAssignment(shareToken: string, userId: string) {
    const assignment = await assignRepo.getAssignmentByShareToken(shareToken);
    if (!assignment) throw new Error("Assignment not found");
    
    const existing = await assignRepo.getMember(assignment.id, userId);
    if (existing) return existing;

    return await assignRepo.addMember({
      assignmentId: assignment.id,
      userId,
      status: "assigned",
    });
  }

  async getAssignmentDetails(id: string, userId: string) {
    const assignment = await assignRepo.getAssignmentById(id);
    const quiz = await quizRepo.getQuizById(assignment.quizId);
    const member = await assignRepo.getMember(id, userId);

    return {
      assignment,
      quiz,
      member,
    };
  }

  async listWorkspaceAssignments(workspaceId: string) {
    return await assignRepo.listAssignmentsByWorkspace(workspaceId);
  }
}
