import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createReminder,
  getReminders,
  deleteReminder,
  updateReminder,
} from "../controllers/reminder.controller.js";

const router = express.Router();

router.post("/", protectRoute, createReminder);
router.get("/", protectRoute, getReminders);
router.delete("/:id", protectRoute, deleteReminder);
router.put("/:id", protectRoute, updateReminder);

export default router;
