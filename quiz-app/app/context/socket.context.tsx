"use client";

import { useAuth } from "@clerk/nextjs";
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { io, Socket } from "socket.io-client";

interface FollowUpMessage {
    userId: string;
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
    startQuiz: () => { },
    endQuiz: () => { },
    timeLeft: {},
});

export const SocketProvider = ({ children }: { children: ReactNode }) => {
    const { userId } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [followUps, setFollowUps] = useState<FollowUpMessage[]>([]);
    const [timeLeft, setTimeLeft] = useState<Record<string, number>>({});

    const startQuiz = useCallback((quizId: string, duration: number) => {
        if (!socket) return;
        socket.emit("startQuiz", { userId, quizId, duration });
        setTimeLeft(prev => ({ ...prev, [quizId]: duration }));
    }, [socket, userId]);

    const endQuiz = useCallback((quizId: string) => {
        if (!socket) return;
        socket.emit("endQuiz", { userId, quizId });
        setTimeLeft(prev => ({ ...prev, [quizId]: 0 }));
    }, [socket, userId]);

    useEffect(() => {
        if (!userId || socket) return;

        const socketIo = io(process.env.NEXT_PUBLIC_BACK_URL || "http://localhost:5000", {
            query: { userId },
            transports: ["websocket"],
        });


        setSocket(socketIo);

        socketIo.on("connect", () => console.log("Connected to socket.io server", socketIo.id));
        socketIo.on("followUp", (data: FollowUpMessage) => setFollowUps(prev => [...prev, data]));
        socketIo.on("timerUpdate", ({ quizId, timeLeft }: { quizId: string; timeLeft: number }) =>
            setTimeLeft(prev => ({ ...prev, [quizId]: timeLeft }))
        );
        socketIo.on("timeUp", ({ quizId }: { quizId: string }) =>
            setTimeLeft(prev => ({ ...prev, [quizId]: 0 }))
        );

        return () => {
            socketIo.disconnect();
        };
    }, [userId, socket]);

    return (
        <SocketContext.Provider value={{ socket, followUps, startQuiz, endQuiz, timeLeft }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
