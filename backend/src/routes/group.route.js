import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createGroup,
  getUserGroups,
  deleteGroup,
  updateGroupPhoto,
  renameGroup,
  addMembers,
  removeMember,
  changeAdmin,
  updateGroupInfo, // ✅ Unified name + photo update
} from "../controllers/group.controller.js";

const router = express.Router();

// ✅ Create a new group
router.post("/", protectRoute, createGroup);

// ✅ Get groups the user is part of
router.get("/", protectRoute, getUserGroups);

// ✅ Unified route to update group name and photo together
router.put("/:groupId/update", protectRoute, updateGroupInfo);

// ✅ Optional: Separate update routes (still usable if needed)
router.put("/:groupId/photo", protectRoute, updateGroupPhoto);
router.put("/:groupId/name", protectRoute, renameGroup);

// ✅ Manage group members and admin
router.put("/:groupId/add", protectRoute, addMembers);
router.put("/:groupId/remove/:memberId", protectRoute, removeMember);
router.put("/:groupId/admin", protectRoute, changeAdmin);

// ✅ Delete a group (admin only)
router.delete("/:groupId", protectRoute, deleteGroup);

export default router;
