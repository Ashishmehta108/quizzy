/**
 * @layer controller
 * @owner agent-3
 */
import { Response } from "express";
import { CourseManagementService } from "../services/course-management.service";

const courseService = new CourseManagementService();

export class CourseController {
  async listCourses(req: any, res: Response) {
    try {
      const courses = await courseService.listCourses(req.workspace.id);
      res.status(200).json({ success: true, data: courses });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async createCourse(req: any, res: Response) {
    try {
      const { title, description } = req.body;
      const course = await courseService.createCourse(req.workspace.id, title, description);
      res.status(201).json({ success: true, data: course });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async getCourse(req: any, res: Response) {
    try {
      const course = await courseService.getCourse(req.params.id);
      res.status(200).json({ success: true, data: course });
    } catch (error: any) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  async createCohort(req: any, res: Response) {
    try {
      const { name, description } = req.body;
      const group = await courseService.createGroup(req.workspace.id, name, description);
      res.status(201).json({ success: true, data: group });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  async listCohorts(req: any, res: Response) {
    try {
      const groups = await courseService.listGroups(req.workspace.id);
      res.status(200).json({ success: true, data: groups });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
