import { configDotenv } from "dotenv";
configDotenv();
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { clerkMiddleware } from "@clerk/express";
import { clerkClient } from "./config/clerk/clerk";
import notionRouter from "./routes/notion.route";
import authRouter from "./routes/auth.routes";
import quizRouter from "./routes/quiz.routes";
import aiRouter from "./routes/ai.routes";
// import resultRouter from "./routes/result.routes";

const app = express();
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(clerkMiddleware({ clerkClient }));
app.use(cookieParser("superSecret"));
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/quizzes", quizRouter);
// app.use("/api/results", resultRouter);

app.use("/api/notion", notionRouter);

app.use("/api/ai", aiRouter);

app.get("/", (_req: Request, res: Response) => {
  res.cookie("test", "test", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 60 * 60 * 24 * 1000,
  });
  res.send("hello");
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

export default app;
