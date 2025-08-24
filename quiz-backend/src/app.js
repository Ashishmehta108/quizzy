import { configDotenv } from "dotenv";
configDotenv();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan"
const app = express();
import authRoutes from "./routes/auth.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
import { resultRouter } from "./routes/result.routes.js";

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"))

app.use("/api/auth", authRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/results", resultRouter);

app.get("/", (_req, res) => {
    res.cookie("test", "test", {
        httpOnly: true, secure: true, sameSite: "none",
        maxAge: 60 * 60 * 24 * 1000
    });
    res.send("hello")
});



app.get("/api/me", async (req, res) => {
    const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
    });
    return res.json(session);
});

app.get("/cookie", (_req, res) => {
    res.cookie("test1", "test", { httpOnly: true, secure: true, sameSite: "none", expires: new Date(Date.now() + 60 * 60 * 24 * 1000) });
    res.send("hello")
});

export default app;
