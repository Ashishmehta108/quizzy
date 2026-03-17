/**
 * @layer repository
 * @owner agent-2
 * @tables documents, document_chunks, courses
 */
import { db } from "../config/db";
import { documents, documentChunks } from "../config/db/schema";
import { eq, and } from "drizzle-orm";

export class DocumentRepository {
  async createDocument(data: any) {
    const result = await db.insert(documents).values(data).returning();
    return result[0];
  }

  async getDocumentById(id: string) {
    const result = await db.select().from(documents).where(eq(documents.id, id));
    return result[0];
  }

  async listDocumentsByWorkspace(workspaceId: string) {
    return await db.select().from(documents).where(eq(documents.workspaceId, workspaceId));
  }

  async updateDocument(id: string, data: any) {
    const result = await db
      .update(documents)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();
    return result[0];
  }

  async deleteDocument(id: string) {
    await db.delete(documents).where(eq(documents.id, id));
  }

  // Chunks
  async createChunks(data: any[]) {
    return await db.insert(documentChunks).values(data).returning();
  }

  async getChunksByDocument(documentId: string) {
    return await db
      .select()
      .from(documentChunks)
      .where(eq(documentChunks.documentId, documentId))
      .orderBy(documentChunks.chunkIndex);
  }

  async deleteChunksByDocument(documentId: string) {
    await db.delete(documentChunks).where(eq(documentChunks.documentId, documentId));
  }
}
