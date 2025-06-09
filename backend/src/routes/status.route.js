import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createStatus,
  getStatuses,
  markStatusViewed,
  deleteStatus,
} from "../controllers/status.controller.js";

const router = express.Router();

router.post("/", protectRoute, createStatus);
router.get("/", protectRoute, getStatuses);
router.put("/:id/view", protectRoute, markStatusViewed);
router.delete("/:id", protectRoute, deleteStatus);

export default router;
