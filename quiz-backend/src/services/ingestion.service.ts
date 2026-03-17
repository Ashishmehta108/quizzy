/**
 * @layer service
 * @owner agent-2
 * @tables documents, document_chunks
 */
import { DocumentRepository } from "../repositories/document.repository";
import { processPdf } from "../ai/parsedoc/doc"; // Refactor target later
import { chunkText } from "../utils/chunk";
import { upsertChunks } from "../ai/pinecone";
import { io } from "../server";

const docRepo = new DocumentRepository();

export class IngestionService {
  async processIngestion(documentId: string, filePath: string, userId: string, socketId?: string) {
    const emitStatus = (msg: string) => {
      if (socketId) io.to(socketId).emit("ingestion_status", { documentId, status: msg });
    };

    try {
      emitStatus("Processing PDF...");
      await docRepo.updateDocument(documentId, { indexingStatus: "processing" });
      
      // Extraction (placeholder for refactored logic)
      // For now, reuse processPdf which does extraction + pinecone upsert (Agent 2 refactors this)
      const content = await processPdf(filePath, userId, documentId, { path: filePath } as any);
      
      const chunks = chunkText(content, 1000, 100);
      
      emitStatus("Upserting to vector DB...");
      await upsertChunks(userId, documentId, chunks);
      
      // Save chunks to SQL for citations
      const chunkData = chunks.map((c, i) => ({
        documentId,
        content: c.text,
        chunkIndex: i,
        metadata: null,
      }));
      await docRepo.createChunks(chunkData);

      await docRepo.updateDocument(documentId, { 
        indexingStatus: "completed",
        content: content 
      });
      
      emitStatus("Done");
    } catch (error) {
      console.error("Ingestion failed:", error);
      await docRepo.updateDocument(documentId, { indexingStatus: "failed" });
      emitStatus("Failed");
      throw error;
    }
  }
}
