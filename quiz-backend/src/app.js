import { configDotenv } from "dotenv"
configDotenv()
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
import cookieParser from "cookie-parser";
import { readFile } from "node:fs";
import { resultRouter } from "./routes/result.routes.js"
import { test } from "./config/db/schema.js";
import { db } from "./config/db/index.js";
import { eq } from "drizzle-orm";
const app = express();
app.use(cors({ origin: "*", credentials: true, allowedHeaders: ["Content-Type", "Authorization"], }))
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
