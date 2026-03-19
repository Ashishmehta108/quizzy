import { Router } from "express";
import {
  createCohort,
  listCohorts,
  getCohort,
  updateCohort,
  deleteCohort,
  addCohortMembers,
  removeCohortMember,
  getMyCohorts,
} from "../controllers/cohort.controller";
import { checkAuth } from "../utils/checkAuth";

const cohortRouter = Router();

// All routes require authentication
cohortRouter.use(checkAuth);

// Get my cohorts (student view)
cohortRouter.get("/student/my", getMyCohorts);

// Create cohort
cohortRouter.post("/", createCohort);

// List cohorts
cohortRouter.get("/", listCohorts);

// Get cohort by ID
cohortRouter.get("/:id", getCohort);

// Update cohort
cohortRouter.put("/:id", updateCohort);

// Delete cohort
cohortRouter.delete("/:id", deleteCohort);

// Add members to cohort
cohortRouter.post("/:id/members", addCohortMembers);

// Remove member from cohort
cohortRouter.delete("/:id/members/:memberId", removeCohortMember);

export default cohortRouter;
