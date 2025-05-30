import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getMessages,
  getUsersForSidebar,
  sendMessage,
  deleteMessage,
  deleteMessageForMe, // import the new controller
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);

// Delete for everyone (only sender can delete)
router.delete("/delete/:messageId", protectRoute, deleteMessage);

// Delete only for the current user (soft delete)
router.delete("/deleteForMe/:messageId", protectRoute, deleteMessageForMe);

export default router;
