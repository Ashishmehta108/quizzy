import { Router } from "express";
import { syncUser } from "../controllers/auth.controller";
import { checkAuth } from "../utils/checkAuth";

export const authRouter = Router();

authRouter.get("/sync", checkAuth, syncUser);


