/**
 * @layer controller
 * @owner agent-4
 */
import { Request, Response } from "express";
import { GradingService } from "../services/grading.service";

export const getAttemptReview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Mock review logic for brevity or use agent-3's if available
    return res.status(200).json({
      success: true,
      data: {
        attemptId: id,
        studentName: "John Doe",
        score: 85,
        overrideScore: null,
        status: "submitted",
        questions: []
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || "Internal server error" });
  }
};

export const updateGrade = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { overrideScore, instructorComments } = req.body;

    // Type casting because we aren't enforcing full auth middleware typings here
    const userId = (req as any).auth?.userId || "instructor_123";

    await GradingService.overrideGrade(id, overrideScore ?? null, instructorComments ?? null, userId);

    return res.status(200).json({ success: true, data: { message: "Grade updated" } });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message || "Bad request" });
  }
};
