import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://your-frontend.onrender.com", // ✅ Replace with your actual frontend URL
    ],
    credentials: true,
  },
});

const userSocketMap = {};

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  const userId = socket.handshake.query.userId;

  if (userId) {
    userSocketMap[userId] = socket.id;
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  }

  // Watch Together Features
  socket.on("watch-request", ({ to, from, fromId, videoUrl }) => {
    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("watch-request-received", {
        videoUrl,
        from,
        fromId,
      });
    }
  });

  socket.on("watch-response", ({ to, accepted }) => {
    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("watch-response-received", { accepted });
    }
  });

  socket.on("start-video-session", ({ to, from, videoUrl }) => {
    const receiverSocketId = getReceiverSocketId(to);
    const senderSocketId = getReceiverSocketId(from);

    if (receiverSocketId)
      io.to(receiverSocketId).emit("start-video-session-received", {
        videoUrl,
      });
    if (senderSocketId)
      io.to(senderSocketId).emit("start-video-session-received", { videoUrl });
  });

  socket.on("video-control", ({ to, action, currentTime }) => {
    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("video-control-received", {
        action,
        currentTime,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);

    for (const id in userSocketMap) {
      if (userSocketMap[id] === socket.id) {
        delete userSocketMap[id];
        break;
      }
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
