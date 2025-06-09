import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getNotifications,
  deleteNotification,
  clearNotifications,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/", protectRoute, getNotifications);
router.delete("/:id", protectRoute, deleteNotification);
router.delete("/", protectRoute, clearNotifications);

export default router;
