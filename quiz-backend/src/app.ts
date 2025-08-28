import { configDotenv } from "dotenv";
configDotenv();
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { clerkMiddleware } from "@clerk/express";
import { clerkClient } from "./config/clerk/clerk";
import notionRouter from "./routes/notion.route";
import authRouter from "./routes/auth.routes";
import quizRouter from "./routes/quiz.routes";
import aiRouter from "./routes/ai.routes";
import conversationRoute from "./routes/conversation.route";
import goalRouter from "./routes/goals.route";
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
app.use(helmet());

app.use(clerkMiddleware({ clerkClient }));
app.use(cookieParser("superSecret"));
app.use(express.json({ limit: "1mb" }));
app.use(compression());

app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));

app.use("/api/auth", authRouter);
app.use("/api/quizzes", quizRouter);
// app.use("/api/results", resultRouter);
app.use("/api/conversation", conversationRoute);
app.use("/api/goals", goalRouter);
app.use("/api/notion", notionRouter);

app.use("/api/ai", aiRouter);

app.get("health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "OK" });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

export default app;
