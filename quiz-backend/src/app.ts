import { configDotenv } from "dotenv";
configDotenv();
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { clerkMiddleware, requireAuth } from "@clerk/express";
import { clerkClient } from "./config/clerk/clerk";
import notionRouter from "./routes/notion.route";
import authRouter from "./routes/auth.routes";
import quizRouter from "./routes/quiz.routes";
import updateUsageRouter from "./routes/usage.reset.route";
import { errorHandler } from "./middlewares/errorHanlder";
import resultRouter from "./routes/result.routes";
import dummyRouter from "./routes/dummy.routes";
import { utilityRouter } from "./routes/utility.routes";
import chatRouter from "./routes/chat.routes";
import {
  rateLimitByIP,
  rateLimitByKey,
} from "./middlewares/ratelimit.middleware";
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

app.use(rateLimitByIP({ windowSec: 60, max: 300, burst: 150 }));

app.post(
  "/api/create",
  rateLimitByKey({ windowSec: 60, max: 60, burst: 30 }),
  (req, res) => {
    res.json({ ok: true });
  }
);

app.use("/api/auth", authRouter);
app.use("/api/quizzes", quizRouter);
app.use("/api/results", resultRouter);
app.use("/api/resetusage", updateUsageRouter);
app.use("/api/notion", notionRouter);
app.use("/api", dummyRouter);
app.use("/api/utility", utilityRouter);
app.use("/api", chatRouter);

app.get("/health", requireAuth(), (req: Request, res: Response) => {
  console.log(req.auth?.userId);
  res.status(200).json({ status: "OK" });
});
app.use(errorHandler);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

export default app;
