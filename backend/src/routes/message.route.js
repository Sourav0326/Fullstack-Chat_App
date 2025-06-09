import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getMessages,
  getUsersForSidebar,
  sendMessage,
  deleteMessage,
  deleteMessageForMe,
  scheduleMessage, // ✅ import new controller
} from "../controllers/message.controller.js";

const router = express.Router();

// Users for sidebar
router.get("/users", protectRoute, getUsersForSidebar);

// Messages for one-to-one or group (use query param ?group=true for groups)
router.get("/:id", protectRoute, getMessages);

// Sending message (one-to-one or group — groupId passed in body)
router.post("/send/:id", protectRoute, sendMessage);

// 📅 Schedule a message
router.post("/schedule", protectRoute, scheduleMessage); // ✅ new route here

// Delete messages
router.delete("/delete/:messageId", protectRoute, deleteMessage);
router.delete("/deleteForMe/:messageId", protectRoute, deleteMessageForMe);

export default router;
