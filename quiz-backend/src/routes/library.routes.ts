import { Router } from "express";
import {
  uploadMaterial,
  listMaterials,
  getMaterial,
  deleteMaterial,
  linkMaterialToCourse,
  reorderMaterials,
} from "../controllers/library.controller";
import { checkAuth } from "../utils/checkAuth";
import { upload } from "../middlewares/upload.middleware";

const libraryRouter = Router();

// All routes require authentication
libraryRouter.use(checkAuth);

// Upload material (with file)
libraryRouter.post(
  "/",
  upload.array("files", 5),
  uploadMaterial
);

// List all materials
libraryRouter.get("/", listMaterials);

// Get material by ID
libraryRouter.get("/:id", getMaterial);

// Delete material
libraryRouter.delete("/:id", deleteMaterial);

// Link material to course
libraryRouter.post("/:id/link", linkMaterialToCourse);

// Reorder course materials
libraryRouter.put("/reorder", reorderMaterials);

export default libraryRouter;
