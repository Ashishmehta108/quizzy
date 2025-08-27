import { Router } from "express";
import { syncUser } from "../controllers/auth.controller";
import { checkAuth } from "../utils/checkAuth";

const authRouter = Router();

authRouter.get("/sync", checkAuth, syncUser);

export default authRouter;
