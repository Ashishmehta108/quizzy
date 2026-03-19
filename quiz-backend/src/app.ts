import { configDotenv } from "dotenv";
configDotenv();
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth";
import notionRouter from "./routes/notion.route";
import authRouter from "./routes/auth.routes";
import quizRouter from "./routes/quiz.routes";
import updateUsageRouter from "./routes/usage.reset.route";
import { errorHandler } from "./middlewares/errorHanlder";
import resultRouter from "./routes/result.routes";
import dummyRouter from "./routes/dummy.routes";
import { utilityRouter } from "./routes/utility.routes";
import chatRouter from "./routes/chat.routes";
import workspaceRouter from "./routes/workspace.routes";
import libraryRouter from "./routes/library.routes";
import assignmentRouter from "./routes/assignment.routes";
import courseRouter from "./routes/course.routes";
import cohortRouter from "./routes/cohort.routes";
import analyticsRoutes from "./routes/analytics.routes";
import exportRoutes from "./routes/export.routes";
import gradingRoutes from "./routes/grading.routes";
import pricingRoutes from "./routes/pricing.routes";
import contestRoutes from "./routes/contest.routes";
import {
  rateLimitByIP,
  rateLimitByKey,
} from "./middlewares/ratelimit.middleware";

const app = express();

// Mount Better Auth handler BEFORE body parsers
app.all("/api/auth/*abc", toNodeHandler(auth));

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-User-Id",
      "X-Workspace-Id",
      "x-workspace-id",
      "X-Requested-With",
    ],
  })
);
app.use(helmet());

app.use(cookieParser("superSecret"));
app.use(express.json({ limit: "1mb" }));
app.use(compression());

app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));

// Add caching headers for GET requests
app.use((req, res, next) => {
  if (req.method === "GET" && req.path.startsWith("/api/")) {
    // Cache for 1 minute for authenticated requests
    if (req.headers.authorization) {
      res.set("Cache-Control", "public, max-age=60");
      res.set("ETag", `"${Date.now()}"`);
    } else {
      res.set("Cache-Control", "public, max-age=300"); // 5 minutes for public endpoints
    }
  }
  next();
});

app.use(rateLimitByIP({ windowSec: 60, max: 300, burst: 150 }));

app.post(
  "/api/create",
  rateLimitByKey({ windowSec: 60, max: 60, burst: 30 }),
  (req, res) => {
    res.json({ ok: true });
  }
);


app.get("/api/user", async (req, res) => {
  try {
    const session = await auth.api.getSession({
      //@ts-ignore
      headers: req.headers,
    });

    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    console.log("Verified session:", session);

    res.status(200).json({
      status: "OK",
      userId: session.user.id,
      sessionId: session.session.id,
    });
  } catch (err) {
    console.error("Token verification failed:", err);
    res.status(401).json({ error: "Unauthorized" });
  }
});

app.use("/api/auth", authRouter);
app.use("/api/quizzes", quizRouter);
app.use("/api/results", resultRouter);
app.use("/api/resetusage", updateUsageRouter);
app.use("/api/notion", notionRouter);
app.use("/api", dummyRouter);
app.use("/api/utility", utilityRouter);
app.use("/api/workspaces", workspaceRouter);
app.use("/api/library", libraryRouter);
app.use("/api/assignments", assignmentRouter);
app.use("/api/courses", courseRouter);
app.use("/api/cohorts", cohortRouter);
app.use("/api", chatRouter);
app.use("/api", analyticsRoutes);
app.use("/api", exportRoutes);
app.use("/api", gradingRoutes);
app.use("/api", pricingRoutes);
app.use("/api/contests", contestRoutes);





app.use(errorHandler);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

export default app;
