import http, { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";

export interface FollowUpMessage {
  userId: string;
  message: string;
}

interface ActiveTimer {
  quizId: string;
  timeLeft: number;
  interval?: NodeJS.Timeout;
}

export const initSockets = (server: HTTPServer) => {
  console.log("started");
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
  console.log("io");

  const userSockets: Map<string, Set<string>> = new Map();
  const activeTimers: Record<string, ActiveTimer> = {};

  io.on("connection", (socket: Socket) => {
    console.log(` connected: ${socket.id}`);
  });

  const sendFollowUp = (data: FollowUpMessage): void => {
    const sockets = userSockets.get(data.userId);
    if (sockets) {
      sockets.forEach((socketId) => io.to(socketId).emit("followUp", data));
    }
  };

  return { io, sendFollowUp };
};
