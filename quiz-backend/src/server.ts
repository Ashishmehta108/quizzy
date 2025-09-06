import dotenv from "dotenv";
dotenv.config();
import app from "./app";
import { createServer } from "http";
import { Server } from "socket.io";
import { quizAI, ensureSession } from "./services/aiservice";

const PORT = process.env.PORT || 5000;
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
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
    io.to(room).emit("user_message", { userId, content: query });

    try {
      const { reply } = await quizAI("chat", {
        quizId,
        sessionId,
        userId,
        userQuery: query,
      });
      io.to(room).emit("ai_response", { content: reply });
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

server.listen(PORT, () => {
  console.log(`✅ Server started on http://localhost:${PORT}`);
});

export { io, userSocketMap };
