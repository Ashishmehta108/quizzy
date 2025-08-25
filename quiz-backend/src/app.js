import { configDotenv } from "dotenv";
configDotenv();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan"
const app = express();
import { clerkMiddleware } from "@clerk/express"
import { clerkClient } from "./config/clerk/clerk.js";
import authRouter from "./routes/auth.routes.js";
import quizRouter from "./routes/quiz.routes.js";
import resultRouter from "./routes/result.routes.js";
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));



app.use(clerkMiddleware({ clerkClient: clerkClient }))
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"))

app.use("/api/auth", authRouter);
app.use("/api/quizzes", quizRouter);
app.use("/api/results", resultRouter);




app.get("/", (_req, res) => {
    res.cookie("test", "test", {
        httpOnly: true, secure: true, sameSite: "none",
        maxAge: 60 * 60 * 24 * 1000
    });
    res.send("hello")
});


// app.get('/user', checkAuth, async (req, res) => {
//     console.log(req.auth)
//     const userId = req.auth.userId
//     console.log(userId)
//     if (!userId) {
//         res.status(401).json({ error: 'User not authenticated' })
//     }
//     const user = await clerkClient.users.getUser(userId)
//     res.json(user)
// })


export default app;
