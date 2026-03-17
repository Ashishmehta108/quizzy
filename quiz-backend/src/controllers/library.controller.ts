/**
 * @layer controller
 * @owner agent-2
 */
import { Response } from "express";
import { LibraryService } from "../services/library.service";
import { randomUUID } from "node:crypto";

const libraryService = new LibraryService();

export class LibraryController {
  async listDocuments(req: any, res: Response) {
    try {
      const docs = await libraryService.listLibrary(req.workspace.id);
      res.status(200).json({ success: true, data: docs });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getDocument(req: any, res: Response) {
    try {
      const doc = await libraryService.getDocument(req.params.id);
      res.status(200).json({ success: true, data: doc });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async deleteDocument(req: any, res: Response) {
    try {
      await libraryService.deleteDocument(req.params.id);
      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async listCourses(req: any, res: Response) {
    try {
      const courses = await libraryService.listCourses(req.workspace.id);
      res.status(200).json({ success: true, data: courses });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
