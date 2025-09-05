import express from "express";
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

    // socket.on(
    //   "startQuiz",
    //   ({ quizId, duration }: { quizId: string; duration: number }) => {
    //     const key = `${userId}_${quizId}`;

    //     // Clear existing timer if exists
    //     if (activeTimers[key]?.interval)
    //       clearInterval(activeTimers[key].interval);

    //     activeTimers[key] = { quizId, timeLeft: duration };

    //     activeTimers[key].interval = setInterval(() => {
    //       const timer = activeTimers[key];
    //       if (!timer) return;

    //       timer.timeLeft -= 1;

    //       // Broadcast timer update to all sockets of this user
    //       userSockets
    //         .get(userId)
    //         ?.forEach((sId) =>
    //           io
    //             .to(sId)
    //             .emit("timerUpdate", { quizId, timeLeft: timer.timeLeft })
    //         );

    //       if (timer.timeLeft <= 0) {
    //         // Broadcast timeUp
    //         userSockets
    //           .get(userId)
    //           ?.forEach((sId) => io.to(sId).emit("timeUp", { quizId }));
    //         clearInterval(timer.interval!);
    //         delete activeTimers[key];
    //       }
    //     }, 1000);
    //   }
    // );

    // // Get current timer state
    // socket.on("getTimerState", ({ quizId }: { quizId: string }) => {
    //   const key = `${userId}_${quizId}`;
    //   const remaining = activeTimers[key]?.timeLeft;
    //   socket.emit("timerState", { timeLeft: remaining });
    // });

    // // End quiz manually
    // socket.on("endQuiz", ({ quizId }: { quizId: string }) => {
    //   const key = `${userId}_${quizId}`;
    //   if (activeTimers[key]?.interval)
    //     clearInterval(activeTimers[key].interval);
    //   delete activeTimers[key];
    //   // Notify user sockets
    //   userSockets
    //     .get(userId)
    //     ?.forEach((sId) => io.to(sId).emit("quizEnded", { quizId }));
    // });

    // Cleanup on disconnect
    // socket.on("disconnect", () => {
    //   const sockets = userSockets.get(userId);
    //   if (sockets) {
    //     sockets.delete(socket.id);
    //     if (sockets.size === 0) {
    //       // Clear all active timers for this user if needed
    //       Object.keys(activeTimers).forEach((key) => {
    //         if (key.startsWith(userId + "_")) {
    //           clearInterval(activeTimers[key].interval!);
    //           delete activeTimers[key];
    //         }
    //       });
    //       userSockets.delete(userId);
    //     }
    //   }
    //   console.log(`User ${userId} disconnected: ${socket.id}`);
    // });
  });

  const sendFollowUp = (data: FollowUpMessage): void => {
    const sockets = userSockets.get(data.userId);
    if (sockets) {
      sockets.forEach((socketId) => io.to(socketId).emit("followUp", data));
    }
  };

  return { io, sendFollowUp };
};
