import { Router } from "express";
import {
  notionLogin,
  notionCallback,
  getDatabases,
  getIntegrationInfo,
} from "../controllers/notionController";

const router = Router();

router.get("/login", notionLogin);
router.get("/callback", notionCallback);
router.get("/databases", getDatabases);
router.get("/integration", getIntegrationInfo);

export default router;
