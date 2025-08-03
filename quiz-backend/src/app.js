import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
import cookieParser from "cookie-parser";
import { readFile } from "node:fs";
import { resultRouter } from "./routes/result.routes.js"
const app = express();
app.use(cors({ origin: "http://localhost:3000", credentials: true, allowedHeaders: ["Content-Type", "Authorization"], }))
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/results", resultRouter)

app.get("/", async (req, res) => {

    res.send("hello")
})

export default app;
