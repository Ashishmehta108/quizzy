import { Router } from "express";
import { syncUser } from "../controllers/auth.controller.js";
import { checkAuth } from "../utils/checkAuth.js";
const authRouter = Router();

authRouter.get("/sync", checkAuth, syncUser)
export default authRouter;
