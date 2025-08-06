import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { configDotenv } from "dotenv";
configDotenv();

const app = express();

// ---- CORS SETUP (must be first!) ----
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import authRoutes from "./routes/auth.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
import { resultRouter } from "./routes/result.routes.js";

app.use("/api/auth", authRoutes);
// app.use("/api/auth", authRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/results", resultRouter);

app.get("/", (_req, res) => res.send("hello"));

export default app;
