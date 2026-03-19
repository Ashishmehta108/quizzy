import dotenv from "dotenv";
dotenv.config();
import app from "./app";
import { createServer } from "http";
import { Server } from "socket.io";
import { quizAI, ensureSession } from "./services/aiservice";
import "./loadPath";
import { quizWorker } from "./workers/quiz.worker";
import { redis } from "./config/redis";
import { createAdapter } from "@socket.io/redis-adapter";

const PORT = process.env.PORT || 5000;
const server = createServer(app);

export const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Set up Redis adapter for Socket.IO (enables horizontal scaling)
const pubClient = redis.duplicate();
const subClient = redis.duplicate();

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  console.log("✅ Redis Socket.IO adapter connected");
  io.adapter(createAdapter(pubClient, subClient));
}).catch(err => {
  console.error("❌ Failed to connect Redis Socket.IO adapter:", err);
  // Fallback to in-memory adapter if Redis fails
});

app.get("/", (req, res) => {
  res.send("Quizzy Backend is running");
});

const userSocketMap = new Map<string, string>();

io.on("connection", (socket) => {
  console.log("✅ socket connected:", socket.id);

  socket.on("register", (userId: string) => {
    userSocketMap.set(userId, socket.id);
    console.log(`👤 User ${userId} registered with socket ${socket.id}`);
  });

  socket.on("join_session", async ({ quizId, userId }) => {
    const sessionId = await ensureSession(quizId, userId);
    const room = `quiz_${quizId}_${sessionId}`;
    socket.join(room);
    console.log(`📚 Socket ${socket.id} joined room ${room}`);
    socket.emit("session_ready", { sessionId });
  });

  socket.on("quiz_chat", async ({ quizId, sessionId, userId, query }) => {
    const room = `quiz_${quizId}_${sessionId}`;
    console.log("chats sent", query);
    try {
      const { reply } = await quizAI("chat", {
        quizId,
        sessionId,
        userId,
        userQuery: query,
      });
      io.to(room).emit("ai_response", { content: reply });

      io.to(room).emit("chat_update", { quizId, sessionId });
    } catch (err) {
      socket.emit("error", { message: "Failed to process message." });
    }
  });

  socket.on("typing", ({ quizId, sessionId, userId }) => {
    const room = `quiz_${quizId}_${sessionId}`;
    socket.to(room).emit("typing", { userId });
  });

  socket.on("stop_typing", ({ quizId, sessionId, userId }) => {
    const room = `quiz_${quizId}_${sessionId}`;
    socket.to(room).emit("stop_typing", { userId });
  });

  socket.on("disconnect", () => {
    console.log("❌ socket disconnected:", socket.id);
    for (const [userId, id] of userSocketMap.entries()) {
      if (id === socket.id) {
        userSocketMap.delete(userId);
        console.log(`🗑️ Removed mapping for user ${userId}`);
        break;
      }
    }
  });
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("🛑 SIGTERM received, shutting down gracefully...");
  await quizWorker.close();
  await redis.quit();
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", async () => {
  console.log("🛑 SIGINT received, shutting down gracefully...");
  await quizWorker.close();
  await redis.quit();
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});

server.listen(PORT, () => {
  console.log(`✅ Server started on http://localhost:${PORT}`);
});

export { userSocketMap };
