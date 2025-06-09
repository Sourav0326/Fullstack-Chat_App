import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import fileUpload from "express-fileupload"; // ✅ add this

// Database & Sockets
import { connectDB } from "./lib/db.js";
import { app, server } from "./lib/socket.js";

// Cron Jobs (scheduled messages + reminders)
import "./lib/cron.js";

// Routes
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import groupRoutes from "./routes/group.route.js";
import reminderRoutes from "./routes/reminder.route.js";
import statusRoutes from "./routes/status.route.js";

dotenv.config();
const PORT = process.env.PORT;
const __dirname = path.resolve();

app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ✅ Add file upload middleware before routes
app.use(
  fileUpload({
    useTempFiles: true,
  })
);

// Register Routes
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/statuses", statusRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// Start Server
server.listen(PORT, () => {
  console.log("server is running on PORT " + PORT);
  connectDB();
});
