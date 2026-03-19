/**
 * @layer route
 * @owner agent-2
 */
import { Router } from "express";
import { LibraryController } from "../controllers/library.controller";
import { IngestionController } from "../controllers/ingestion.controller";
import { resolveWorkspace } from "../middlewares/workspace.middleware";
import { requireRole } from "../middlewares/role.middleware";
import multer from "multer";

import { resolveUser } from "../middlewares/auth.middleware";

const router = Router();
const libraryController = new LibraryController();
const ingestionController = new IngestionController();
const upload = multer({ dest: "uploads/" });

router.use(resolveUser);
router.use(resolveWorkspace);

router.get("/", libraryController.listDocuments);
router.get("/courses", libraryController.listCourses);
router.post("/upload", upload.single("file"), ingestionController.uploadAndProcess);
router.get("/:id", libraryController.getDocument);
router.delete("/:id", requireRole("owner", "admin"), libraryController.deleteDocument);

export default router;
