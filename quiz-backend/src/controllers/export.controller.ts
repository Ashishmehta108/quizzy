/**
 * @layer controller
 * @owner agent-4
 */
import { Request, Response } from "express";
import { ExportService } from "../services/export.service";

export const exportAssignmentResults = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const workspaceId = req.headers["x-workspace-id"] as string || "default_workspace";

    const csvData = await ExportService.getAssignmentResultsCSV(id, workspaceId);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="assignment_${id}_results.csv"`);
    return res.status(200).send(csvData);
  } catch (error: any) {
    if (error.message.includes("Entitlement failure")) {
      return res.status(403).json({ success: false, error: error.message });
    }
    return res.status(500).json({ success: false, error: error.message || "Internal server error" });
  }
};
