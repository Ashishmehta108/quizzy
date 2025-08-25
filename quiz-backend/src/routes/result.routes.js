import { Router } from "express";
import { PostResult, GetResultById, GetResults } from "../controllers/result.controller.js";
import { checkAuth } from "../utils/checkAuth.js";
const resultRouter = Router()



resultRouter.post("/", checkAuth, PostResult);
resultRouter.get("/", checkAuth, GetResults);
resultRouter.get("/:id", checkAuth, GetResultById);




export default resultRouter;