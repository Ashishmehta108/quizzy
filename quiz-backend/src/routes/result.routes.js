import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { PostResult, GetResultById, GetResults } from "../controllers/result.controller.js";
const resultRouter = Router()



resultRouter.post("/", protect, PostResult);
resultRouter.get("/", protect, GetResults);
resultRouter.get("/:id", protect, GetResultById);





export { resultRouter }