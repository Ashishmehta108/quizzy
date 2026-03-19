import { Server as SocketIOServer } from "socket.io";
import { redis } from "../config/redis";
import { createAdapter } from "@socket.io/redis-adapter";

// Socket.IO instance for emitting events from workers
// This is separate from the main server instance but uses the same Redis adapter
let socketEmitter: SocketIOServer | null = null;

export function getSocketEmitter(): SocketIOServer {
  if (!socketEmitter) {
    // Create a dummy server that can emit events through Redis
    socketEmitter = new SocketIOServer();
    
    // Connect to Redis adapter
    const pubClient = redis.duplicate();
    const subClient = redis.duplicate();
    
    Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
      socketEmitter!.adapter(createAdapter(pubClient, subClient));
    }).catch(err => {
      console.error("Failed to connect socket emitter to Redis:", err);
    });
  }
  
  return socketEmitter;
}

export function emitToSocket(socketId: string, event: string, data: any): void {
  const emitter = getSocketEmitter();
  emitter.to(socketId).emit(event, data);
}
