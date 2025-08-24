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
import { createClerkClient, clerkMiddleware } from "@clerk/express"
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));


const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY
})
app.use(clerkMiddleware({ clerkClient }))
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"))

app.use("/api/auth", authRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/results", resultRouter);



// const checkAuth = (req, res, next) => {
//     console.log(req.auth());
//     console.log("checking if session exists");
//     if (!req.auth().sessionId) {
//         return next(new Error("Unauthenticated"));
//     }
//     next();
// };

app.get("/", (_req, res) => {
    res.cookie("test", "test", {
        httpOnly: true, secure: true, sameSite: "none",
        maxAge: 60 * 60 * 24 * 1000
    });
    res.send("hello")
});




app.get('/user', async (req, res) => {

    console.log(req.auth())
    const userId = req.auth.userId
    console.log(userId)
    if (!userId) {
        res.status(401).json({ error: 'User not authenticated' })
    }

    // const user = await clerkClient.users.getUser(userId)

    res.json(user)
})
app.get("/cookie", (_req, res) => {
    res.cookie("test1", "test", { httpOnly: true, secure: true, sameSite: "none", expires: new Date(Date.now() + 60 * 60 * 24 * 1000) });
    res.send("hello")
});

export default app;
