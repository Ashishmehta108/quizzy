import { db } from "../config/db";
import { cohorts, cohortMembers, courses, users } from "../config/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { Response, Request } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";

interface CohortRequest extends Request {
  body: {
    name?: string;
    description?: string;
    courseId?: string;
    startDate?: string;
    endDate?: string;
    userIds?: string[];
  };
}

/**
 * Create a new cohort
 * POST /api/cohorts
 */
export const createCohort = asyncHandler(async (req: CohortRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const { name, description, courseId, startDate, endDate } = req.body;

  if (!name || !courseId) {
    throw new ApiError(400, "Name and courseId are required");
  }

  // Verify course exists and user has access
  const course = await db
    .select()
    .from(courses)
    .where(eq(courses.id, courseId))
    .limit(1);

  if (!course.length) {
    throw new ApiError(404, "Course not found");
  }

  const cohortId = randomUUID();
  const newCohort = {
    id: cohortId,
    courseId,
    name,
    description: description || "",
    startDate: startDate ? new Date(startDate) : null,
    endDate: endDate ? new Date(endDate) : null,
    createdAt: new Date(),
  };

  await db.insert(cohorts).values(newCohort);

  res.status(201).json({
    success: true,
    cohort: newCohort,
    message: "Cohort created successfully",
  });
});

/**
 * List cohorts for a course
 * GET /api/cohorts?courseId=xxx
 */
export const listCohorts = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const { courseId } = req.query;

  let query = db.select().from(cohorts);

  if (courseId) {
    query = query.where(eq(cohorts.courseId, courseId as string));
  }

  const cohortList = await query;

  res.json({
    success: true,
    cohorts: cohortList,
    total: cohortList.length,
  });
});

/**
 * Get cohort details with members
 * GET /api/cohorts/:id
 */
export const getCohort = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const { id } = req.params;

  const cohortList = await db
    .select()
    .from(cohorts)
    .where(eq(cohorts.id, id))
    .limit(1);

  if (!cohortList.length) {
    throw new ApiError(404, "Cohort not found");
  }

  // Get members
  const members = await db
    .select({
      id: cohortMembers.id,
      userId: cohortMembers.userId,
      role: cohortMembers.role,
      joinedAt: cohortMembers.joinedAt,
      name: users.name,
      email: users.email,
    })
    .from(cohortMembers)
    .where(eq(cohortMembers.cohortId, id))
    .leftJoin(users, eq(cohortMembers.userId, users.id));

  res.json({
    success: true,
    cohort: cohortList[0],
    members,
  });
});

/**
 * Update cohort
 * PUT /api/cohorts/:id
 */
export const updateCohort = asyncHandler(async (req: CohortRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const { id } = req.params;
  const { name, description, startDate, endDate } = req.body;

  const updateData: any = {
    updatedAt: new Date(),
  };

  if (name) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (startDate) updateData.startDate = new Date(startDate);
  if (endDate) updateData.endDate = new Date(endDate);

  await db
    .update(cohorts)
    .set(updateData)
    .where(eq(cohorts.id, id));

  res.json({
    success: true,
    message: "Cohort updated successfully",
  });
});

/**
 * Delete cohort
 * DELETE /api/cohorts/:id
 */
export const deleteCohort = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const { id } = req.params;

  // Delete members first
  await db.delete(cohortMembers).where(eq(cohortMembers.cohortId, id));

  // Delete cohort
  await db.delete(cohorts).where(eq(cohorts.id, id));

  res.json({
    success: true,
    message: "Cohort deleted successfully",
  });
});

/**
 * Add members to cohort
 * POST /api/cohorts/:id/members
 */
export const addCohortMembers = asyncHandler(async (req: CohortRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const { id } = req.params;
  const { userIds = [] } = req.body;

  if (!userIds.length) {
    throw new ApiError(400, "User IDs array is required");
  }

  // Verify cohort exists
  const cohortList = await db
    .select()
    .from(cohorts)
    .where(eq(cohorts.id, id))
    .limit(1);

  if (!cohortList.length) {
    throw new ApiError(404, "Cohort not found");
  }

  // Add members (skip if already exists)
  const newMembers = userIds.map((uid) => ({
    id: randomUUID(),
    cohortId: id,
    userId: uid,
    role: "learner" as const,
    joinedAt: new Date(),
  }));

  for (const member of newMembers) {
    const exists = await db
      .select()
      .from(cohortMembers)
      .where(and(eq(cohortMembers.cohortId, id), eq(cohortMembers.userId, member.userId)))
      .limit(1);

    if (!exists.length) {
      await db.insert(cohortMembers).values(member);
    }
  }

  res.json({
    success: true,
    message: `Added ${userIds.length} members to cohort`,
  });
});

/**
 * Remove member from cohort
 * DELETE /api/cohorts/:id/members/:userId
 */
export const removeCohortMember = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const { id, memberId } = req.params;

  await db
    .delete(cohortMembers)
    .where(and(eq(cohortMembers.cohortId, id), eq(cohortMembers.userId, memberId)));

  res.json({
    success: true,
    message: "Member removed from cohort",
  });
});

/**
 * Get student's cohorts
 * GET /api/cohorts/student/my
 */
export const getMyCohorts = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(401, "Unauthorized");

  const memberships = await db
    .select({
      cohort: cohorts,
      course: courses,
    })
    .from(cohortMembers)
    .where(eq(cohortMembers.userId, userId))
    .leftJoin(cohorts, eq(cohortMembers.cohortId, cohorts.id))
    .leftJoin(courses, eq(cohorts.courseId, courses.id));

  res.json({
    success: true,
    cohorts: memberships.map((m) => ({
      ...m.cohort,
      course: m.course,
    })),
  });
});
