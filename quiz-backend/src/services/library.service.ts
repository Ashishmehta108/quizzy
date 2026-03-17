/**
 * @layer service
 * @owner agent-2
 * @tables documents, document_chunks, courses
 */
import { DocumentRepository } from "../repositories/document.repository";
import { CourseRepository } from "../repositories/course.repository";
import { checkEntitlement } from "./entitlements.service";

const docRepo = new DocumentRepository();
const courseRepo = new CourseRepository();

export class LibraryService {
  async uploadDocument(workspaceId: string, userId: string, data: any) {
    const entitlement = await checkEntitlement(workspaceId, "material_ingested");
    if (!entitlement.allowed) {
      throw new Error(`Limit reached: ${entitlement.limit} pages allowed.`);
    }

    return await docRepo.createDocument({
      ...data,
      workspaceId,
      userId,
      indexingStatus: "pending",
    });
  }

  async listLibrary(workspaceId: string) {
    const docs = await docRepo.listDocumentsByWorkspace(workspaceId);
    return docs;
  }

  async getDocument(id: string) {
    return await docRepo.getDocumentById(id);
  }

  async deleteDocument(id: string) {
    await docRepo.deleteChunksByDocument(id);
    await docRepo.deleteDocument(id);
  }

  // Courses (Library-first)
  async createCourse(workspaceId: string, title: string, description?: string) {
    return await courseRepo.createCourse({ workspaceId, title, description });
  }

  async listCourses(workspaceId: string) {
    return await courseRepo.listCoursesByWorkspace(workspaceId);
  }
}
