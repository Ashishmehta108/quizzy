"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { io, Socket } from "socket.io-client";

interface FollowUpMessage {
  message: string;
}

interface SocketContextType {
  socket: Socket | null;
  followUps: FollowUpMessage[];
  startQuiz: (quizId: string, duration: number) => void;
  endQuiz: (quizId: string) => void;
  timeLeft: Record<string, number>;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  followUps: [],
  startQuiz: () => {},
  endQuiz: () => {},
  timeLeft: {},
});

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [followUps, setFollowUps] = useState<FollowUpMessage[]>([]);
  const [timeLeft, setTimeLeft] = useState<Record<string, number>>({});

  // --- Quiz actions ---
  const startQuiz = useCallback(
    (quizId: string, duration: number) => {
      if (!socket) return;
      socket.emit("startQuiz", { quizId, duration });
      setTimeLeft((prev) => ({ ...prev, [quizId]: duration }));
    },
    [socket]
  );

  const endQuiz = useCallback(
    (quizId: string) => {
      if (!socket) return;
      socket.emit("endQuiz", { quizId });
      setTimeLeft((prev) => ({ ...prev, [quizId]: 0 }));
    },
    [socket]
  );

  // --- Socket setup ---
  useEffect(() => {
    const socketIo = io("http://localhost:5000", {
      transports: ["websocket"], // force pure WS, avoid handshake issues
    });

    setSocket(socketIo);

    socketIo.on("connect", () => {
      console.log("✅ Connected to server:", socketIo.id);
    });

    socketIo.on("disconnect", () => {
      console.log("❌ Disconnected from server");
    });

    socketIo.on("followUp", (data: FollowUpMessage) => {
      setFollowUps((prev) => [...prev, data]);
    });

    socketIo.on(
      "timerUpdate",
      ({ quizId, timeLeft }: { quizId: string; timeLeft: number }) => {
        setTimeLeft((prev) => ({ ...prev, [quizId]: timeLeft }));
      }
    );

    socketIo.on("timeUp", ({ quizId }: { quizId: string }) => {
      setTimeLeft((prev) => ({ ...prev, [quizId]: 0 }));
    });

    return () => {
      socketIo.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{ socket, followUps, startQuiz, endQuiz, timeLeft }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
