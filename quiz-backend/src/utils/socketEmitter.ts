import { io } from "@/server";

export const emitSocketEvent = (
  event: string,
  message: string,
  socketId: string
) => {
  const payload = { message };

  io.to(socketId).emit(event, payload);
  console.log(`[SocketEmitter] Sent ${event} to ${socketId}:`);
};
