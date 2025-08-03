// routes/quiz.routes.js
import { Router } from "express";
import { createQuiz, getQuizzes } from "../controllers/quiz.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import fs from "fs";

const router = Router();

router.post(
    "/",
    protect,
    upload.array("files", 5),
    async (req, res, next) => {
        try {
            await createQuiz(req, res);
        } finally {
            if (req.files && req.files.length > 0) {
                for (const file of req.files) {
                    fs.unlink(file.path, (err) => {
                        if (err) console.error(`Error deleting ${file.filename}:`, err);
                    });
                }
            }
        }
    }
);

router.get("/", protect, getQuizzes);

export default router;
