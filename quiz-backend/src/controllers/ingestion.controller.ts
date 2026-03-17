/**
 * @layer controller
 * @owner agent-2
 */
import { Response } from "express";
import { IngestionService } from "../services/ingestion.service";
import { LibraryService } from "../services/library.service";
import { randomUUID } from "node:crypto";

const ingestionService = new IngestionService();
const libraryService = new LibraryService();

export class IngestionController {
  async uploadAndProcess(req: any, res: Response) {
    try {
      const file = req.file;
      if (!file) return res.status(400).json({ success: false, error: "No file uploaded" });

      const docId = randomUUID();
      const document = await libraryService.uploadDocument(req.workspace.id, req.auth.userId, {
        id: docId,
        title: req.body.title || file.originalname,
        content: "",
        uploadUrl: file.path, 
      });

      // Background process ingestion
      ingestionService.processIngestion(docId, file.path, req.auth.userId, req.body.socketId)
        .catch(err => console.error("Background ingestion failed", err));

      res.status(202).json({ 
        success: true, 
        data: { documentId: docId }, 
        message: "Ingestion started" 
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
