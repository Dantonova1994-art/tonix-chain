/**
 * Socket.IO сервер для TON Battle (singleton)
 */

import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";

let io: SocketIOServer | null = null;

export function initSocket(server: HTTPServer): SocketIOServer {
  if (io) {
    return io;
  }

  io = new SocketIOServer(server, {
    path: "/api/socketio",
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

  io.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("🔌 Socket disconnected:", socket.id);
    });

    // Battle events
    socket.on("battle:queue:join", (data: { wallet: string; entryValue: number }) => {
      console.log("🎮 Battle queue join:", data);
      // Обработка будет в API route
    });

    socket.on("battle:queue:status", (data: { matchId: string }) => {
      console.log("🎮 Battle queue status:", data);
    });

    socket.on("battle:action:hit", (data: { matchId: string; player: string }) => {
      console.log("⚔️ Battle hit:", data);
      // Бродкастим другим игрокам
      socket.broadcast.emit("battle:action:hit", data);
    });
  });

  return io;
}

export function getSocketIO(): SocketIOServer | null {
  return io;
}

