import { Router } from "express";
import {
  getExplanation,
  askFollowUp,
} from "@/controllers/conversation.controller";

const conversationRoute = Router();

conversationRoute.get("/:questionId/explanation", getExplanation);

conversationRoute.post("/ask", askFollowUp);

export default conversationRoute;
