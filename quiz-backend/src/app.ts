import { configDotenv } from "dotenv";
configDotenv();
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import { errorHandler } from "./middlewares/errorHanlder";
import * as routes from "./routes";
import {
  rateLimitByIP,
  rateLimitByKey,
} from "./middlewares/ratelimit.middleware";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import { auth } from "./auth";

const app = express();

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
  }),
);

app.use(helmet());
app.all("/api/auth/*path", toNodeHandler(auth));

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
  },
);

app.get("/api/me", async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  return res.json(session);
});


app.get("/api/user", async (req, res) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    res.status(200).json({
      status: "OK",
      userId: session.user.id,
      sessionId: session.session.id,
    });
  } catch (err) {
    console.error("Session verification failed:", err);
    res.status(401).json({ error: "Unauthorized" });
  }
});

app.use("/api/auth", routes.authRouter);
app.use("/api/quizzes", routes.quizRouter);
app.use("/api/results", routes.resultRouter);
app.use("/api/resetusage", routes.updateUsageRouter);
app.use("/api/notion", routes.notionRouter);
app.use("/api", routes.dummyRouter);
app.use("/api/utility", routes.utilityRouter);
app.use("/api/workspaces", routes.workspaceRouter);
app.use("/api/library", routes.libraryRouter);
app.use("/api/assignments", routes.assignmentRouter);
app.use("/api/courses", routes.courseRouter);
app.use("/api", routes.chatRouter);
app.use("/api", routes.analyticsRoutes);
app.use("/api", routes.exportRoutes);
app.use("/api", routes.gradingRoutes);
app.use("/api", routes.pricingRoutes);

app.use(errorHandler);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

export default app;
