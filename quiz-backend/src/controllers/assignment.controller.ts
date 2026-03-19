/**
 * @layer controller
 * @owner agent-3
 */
import { Response } from "express";
import { AssignmentService } from "../services/assignment.service";

const assignmentService = new AssignmentService();

export class AssignmentController {
  async createAssignment(req: any, res: Response) {
    try {
      const assignment = await assignmentService.createAssignment(req.workspace.id, req.body);
      res.status(201).json({ success: true, data: assignment });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async listAssignments(req: any, res: Response) {
    try {
      const assignments = await assignmentService.listWorkspaceAssignments(req.workspace.id);
      res.status(200).json({ success: true, data: assignments });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async joinAssignment(req: any, res: Response) {
    try {
      const { shareToken } = req.body;
      const member = await assignmentService.joinAssignment(shareToken, req.user?.id);
      res.status(200).json({ success: true, data: member });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getAssignmentDetail(req: any, res: Response) {
    try {
      const detail = await assignmentService.getAssignmentDetails(req.params.id, req.user?.id);
      res.status(200).json({ success: true, data: detail });
    } catch (error: any) {
      res.status(404).json({ success: false, error: error.message });
    }
  }
}
