"use client";

import { useSocket } from "@/app/context/socket.context";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import StatusUpdates  from "@/components/agent/animateUpdate";
//  { AnimateUpdate }
 

interface AppState {
  socketId: string | null;
  message: string;
  targetSocketId: string;
  latestFollowUp: { userId?: string; message: string } | null;
  latestStatus: string | null;
  isThinking: boolean;
}

export default function SocketTestPage() {
  const { socket, followUps } = useSocket();

  const [state, setState] = useState<AppState>({
    socketId: null,
    message: "",
    targetSocketId: "",
    latestFollowUp: null,
    latestStatus: null,
    isThinking: false,
  });

  // track socket id
  // useEffect(() => {
  //   if (!socket) return;
  //   const handler = () => {
  //     setState((prev) => ({ ...prev, socketId: socket.id || null }));
  //   };
  //   socket.on("connect", handler);
  //   return () => socket.off("connect", handler);
  // }, [socket]);
  useEffect(() => {
    if (!socket) return;
    const handler = () => {
      setState((prev) => ({ ...prev, socketId: socket.id || null }));
    };

    socket.on("connect", handler);
    return () => {
      socket.off("connect", handler);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const handler = (data: { message: string; step: number }) => {
      setState((prev) => ({
        ...prev,
        latestStatus: `${data.step}. ${data.message}`,
        isThinking: false,
      }));
    };

    socket.on("status", handler);
    return () => {
      socket.off("status", handler);
    };
  }, [socket]);

  // keep latest followUp in sync
  useEffect(() => {
    if (followUps.length > 0) {
      setState((prev) => ({
        ...prev,
        latestFollowUp: followUps[followUps.length - 1],
      }));
    }
  }, [followUps]);

  const sendFollowUp = () => {
    if (!socket) return;
    socket.emit("send-to-specific", {
      socketId: state.targetSocketId || socket.id,
      data: { userId: "me", message: state.message },
    });
    setState((prev) => ({ ...prev, message: "" }));
  };

  const triggerDummy = async () => {
    try {
      setState((prev) => ({
        ...prev,
        latestStatus: null,
        isThinking: true,
      }));
      const res = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACK_URL || "http://localhost:5000"
        }/api/dummy`,
        { method: "POST" }
      );
      const data = await res.json();
      console.log("Dummy API triggered:", data);
    } catch (err) {
      console.error("Failed to trigger dummy API:", err);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h2 className="text-lg font-bold">Socket Test Page</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            <strong>My Socket ID:</strong>{" "}
            <span className="font-mono">
              {state.socketId || "Connecting..."}
            </span>
          </p>

          {/* Send follow up */}
          <div className="flex flex-col gap-2">
            <Input
              placeholder="Target Socket ID (leave empty to send to self)"
              value={state.targetSocketId}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  targetSocketId: e.target.value,
                }))
              }
            />
            <Input
              placeholder="Message"
              value={state.message}
              onChange={(e) =>
                setState((prev) => ({ ...prev, message: e.target.value }))
              }
            />
            <Button onClick={sendFollowUp}>Send FollowUp</Button>
          </div>

          {/* Trigger dummy */}
          <div className="flex flex-col gap-2">
            <Button variant="outline" onClick={triggerDummy}>
              Trigger Dummy Events
            </Button>
          </div>

          {/* Latest followUp */}
          <div>
            <h3 className="font-semibold">Latest FollowUp:</h3>
            <AnimatePresence mode="wait">
              {state.latestFollowUp && (
                <motion.div
                  key={state.latestFollowUp.message}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="mt-2 text-sm border-b pb-1"
                >
                  <span className="font-mono text-xs">
                    {state.latestFollowUp.userId}
                  </span>
                  : {state.latestFollowUp.message}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Latest status */}
          <div>
            <h3 className="font-semibold">Status Updates:</h3>

            {state.latestStatus && (
              <div className="mt-2 text-sm border-b pb-1">
                <StatusUpdates
                 text={state.latestStatus}
                  />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
