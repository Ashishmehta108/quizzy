import { db } from "../config/db";
import {
  documents,
  courseMaterials,
  courses,
  documentChunks,
} from "../config/db/schema";
import { eq, and, asc, desc } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import fs from "fs/promises";
import { Response, Request } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { processPdf } from "../ai/parsedoc/doc";
import { upsertChunks } from "../ai/pinecone";
import { chunkText } from "../utils/chunk";
import extractTextFromImage from "../utils/ocr";
import { checkEntitlement } from "../services/entitlements.service";

interface LibraryFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

interface LibraryRequest extends Request {
  files?: LibraryFile[];
  body: {
    title?: string;
    courseId?: string;
    materialType?: string;
    externalUrl?: string;
  };
}

/**
 * Upload material to library
 * POST /api/library
 */
export const uploadMaterial = asyncHandler(async (req: LibraryRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const workspaceId = req.headers["x-workspace-id"] as string;
  if (!workspaceId) throw new ApiError(400, "Workspace ID is required");

  const { title, courseId, materialType = "document", externalUrl } = req.body;

  // Check entitlements for material ingestion
  const entitlement = await checkEntitlement(workspaceId, "material_ingested");
  if (!entitlement.allowed) {
    throw new ApiError(403, `Material limit reached for this plan`);
  }

  let documentId: string | null = null;
  let uploadUrl = "";

  // Handle file uploads
  if (req.files && req.files.length > 0) {
    const file = req.files[0];
    documentId = randomUUID();

    // Process based on file type
    if (file.mimetype === "application/pdf") {
      const text = await processPdf(file.path, userId, documentId, file as any);
      uploadUrl = `/uploads/${file.filename}`;
    } else if (file.mimetype === "text/plain") {
      const buffer = await fs.readFile(file.path);
      const chunks = chunkText(buffer.toString(), 1000, 100);
      await upsertChunks(userId, documentId, chunks);
      uploadUrl = `/uploads/${file.filename}`;
    } else if (["image/png", "image/jpg", "image/jpeg"].includes(file.mimetype)) {
      const data = await extractTextFromImage(file.path);
      const chunks = chunkText(data, 1000, 100);
      await upsertChunks(userId, documentId, chunks);
      uploadUrl = `/uploads/${file.filename}`;
    } else {
      throw new ApiError(400, `Unsupported file type: ${file.mimetype}`);
    }

    // Clean up temp file
    try {
      await fs.unlink(file.path);
    } catch (err) {
      console.error("Failed to delete temp file:", file.path);
    }
  }

  // Create document record
  const documentData = {
    id: documentId || randomUUID(),
    workspaceId,
    courseId: courseId || null,
    userId,
    title: title || "Untitled Material",
    content: "",
    uploadUrl,
    indexingStatus: "completed" as const,
    metadata: {
      originalName: req.files?.[0]?.originalname,
      mimetype: req.files?.[0]?.mimetype,
      size: req.files?.[0]?.size,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.insert(documents).values(documentData);

  // If courseId provided, link to course materials
  if (courseId) {
    await db.insert(courseMaterials).values({
      courseId,
      documentId: documentData.id,
      title: documentData.title,
      materialType,
      externalUrl,
      orderIndex: 0,
      indexingStatus: "completed",
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  res.status(201).json({
    success: true,
    document: documentData,
    message: "Material uploaded successfully",
  });
});

/**
 * List library materials
 * GET /api/library
 */
export const listMaterials = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const workspaceId = req.headers["x-workspace-id"] as string;
  const { courseId, limit = 50, offset = 0 } = req.query;

  let query = db
    .select()
    .from(documents)
    .where(eq(documents.workspaceId, workspaceId as string))
    .orderBy(desc(documents.createdAt));

  if (courseId) {
    const materials = await db
      .select()
      .from(courseMaterials)
      .where(eq(courseMaterials.courseId, courseId as string));

    const documentIds = materials.map((m) => m.documentId);
    query = query.and(eq(documents.id, documentIds[0] || ""));
  }

  const materials = await query.limit(Number(limit)).offset(Number(offset));

  res.json({
    success: true,
    materials,
    total: materials.length,
  });
});

/**
 * Get material by ID
 * GET /api/library/:id
 */
export const getMaterial = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const { id } = req.params;

  const material = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.userId, userId)))
    .limit(1);

  if (!material.length) {
    throw new ApiError(404, "Material not found");
  }

  res.json({
    success: true,
    material: material[0],
  });
});

/**
 * Delete material
 * DELETE /api/library/:id
 */
export const deleteMaterial = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const { id } = req.params;

  // Delete chunks first
  await db.delete(documentChunks).where(eq(documentChunks.documentId, id));

  // Delete course materials links
  await db.delete(courseMaterials).where(eq(courseMaterials.documentId, id));

  // Delete document
  await db.delete(documents).where(and(eq(documents.id, id), eq(documents.userId, userId)));

  res.json({
    success: true,
    message: "Material deleted successfully",
  });
});

/**
 * Link material to course
 * POST /api/library/:id/link
 */
export const linkMaterialToCourse = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const { id } = req.params;
  const { courseId, title, materialType = "document" } = req.body;

  if (!courseId) {
    throw new ApiError(400, "Course ID is required");
  }

  // Verify document exists and belongs to user
  const material = await db
    .select()
    .from(documents)
    .where(and(eq(documents.id, id), eq(documents.userId, userId)))
    .limit(1);

  if (!material.length) {
    throw new ApiError(404, "Material not found");
  }

  // Create course material link
  const [maxOrder] = await db
    .select()
    .from(courseMaterials)
    .where(eq(courseMaterials.courseId, courseId))
    .orderBy(desc(courseMaterials.orderIndex))
    .limit(1);

  const nextOrder = (maxOrder?.orderIndex || 0) + 1;

  await db.insert(courseMaterials).values({
    courseId,
    documentId: id,
    title: title || material[0].title,
    materialType,
    orderIndex: nextOrder,
    indexingStatus: "completed",
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Update document's courseId
  await db
    .update(documents)
    .set({ courseId, updatedAt: new Date() })
    .where(eq(documents.id, id));

  res.json({
    success: true,
    message: "Material linked to course successfully",
  });
});

/**
 * Reorder course materials
 * PUT /api/library/reorder
 */
export const reorderMaterials = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const { courseId, materialIds } = req.body;

  if (!courseId || !Array.isArray(materialIds)) {
    throw new ApiError(400, "Course ID and material IDs array are required");
  }

  // Update order for each material
  for (let i = 0; i < materialIds.length; i++) {
    await db
      .update(courseMaterials)
      .set({ orderIndex: i, updatedAt: new Date() })
      .where(
        and(
          eq(courseMaterials.courseId, courseId),
          eq(courseMaterials.documentId, materialIds[i])
        )
      );
  }

  res.json({
    success: true,
    message: "Materials reordered successfully",
  });
});
