import Group from "../models/group.model.js";
import cloudinary from "../lib/cloudinary.js";

// ✅ Create Group
export const createGroup = async (req, res) => {
  const { groupName, memberIds } = req.body;
  const adminId = req.user._id;

  if (!groupName || !memberIds || memberIds.length === 0) {
    return res.status(400).json({ message: "Group name and members required" });
  }

  try {
    const group = new Group({
      groupName,
      admin: adminId,
      members: [adminId, ...memberIds],
    });

    await group.save();

    res.status(201).json(group);
  } catch (error) {
    console.error("Create group error:", error.message);
    res.status(500).json({ message: "Failed to create group" });
  }
};

// ✅ Get All Groups for Logged-in User
export const getUserGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id })
      .populate("members", "fullName profilePic")
      .select("-__v");

    res.status(200).json(groups);
  } catch (error) {
    console.error("Fetch groups error:", error.message);
    res.status(500).json({ message: "Failed to fetch groups" });
  }
};

// ✅ Delete Group
export const deleteGroup = async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user._id;

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.admin.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Only admin can delete the group" });
    }

    await group.deleteOne();
    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Delete group error:", error.message);
    res.status(500).json({ message: "Failed to delete group" });
  }
};

// ✅ Update Group Info (Name + Image)
export const updateGroupInfo = async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user._id;
  const { groupName, image } = req.body;

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.admin.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Only admin can update the group" });
    }

    if (groupName) group.groupName = groupName;

    if (image) {
      const uploadRes = await cloudinary.uploader.upload(image);
      group.groupImage = uploadRes.secure_url;
    }

    await group.save();
    res.status(200).json({ message: "Group updated", group });
  } catch (error) {
    console.error("Update group info error:", error.message);
    res.status(500).json({ message: "Failed to update group info" });
  }
};

// ✅ Optional: Only update group photo
export const updateGroupPhoto = async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user._id;
  const { image } = req.body;

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.admin.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Only admin can update group photo" });
    }

    const uploadRes = await cloudinary.uploader.upload(image);
    group.groupImage = uploadRes.secure_url;
    await group.save();

    res.status(200).json({ message: "Group photo updated", group });
  } catch (error) {
    console.error("Update group photo error:", error.message);
    res.status(500).json({ message: "Failed to update group photo" });
  }
};

// ✅ Optional: Rename Group
export const renameGroup = async (req, res) => {
  const { groupId } = req.params;
  const { groupName } = req.body;
  const userId = req.user._id;

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.admin.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Only admin can rename the group" });
    }

    group.groupName = groupName;
    await group.save();

    res.status(200).json({ message: "Group name updated", group });
  } catch (error) {
    console.error("Rename group error:", error.message);
    res.status(500).json({ message: "Failed to rename group" });
  }
};

// ✅ Add Members
export const addMembers = async (req, res) => {
  const { groupId } = req.params;
  const { memberIds } = req.body;
  const userId = req.user._id;

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.admin.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only admin can add members" });
    }

    memberIds.forEach((id) => {
      if (!group.members.includes(id)) {
        group.members.push(id);
      }
    });

    await group.save();
    res.status(200).json({ message: "Members added", group });
  } catch (error) {
    console.error("Add members error:", error.message);
    res.status(500).json({ message: "Failed to add members" });
  }
};

// ✅ Remove Member
export const removeMember = async (req, res) => {
  const { groupId, memberId } = req.params;
  const userId = req.user._id;

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.admin.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only admin can remove members" });
    }

    group.members = group.members.filter((id) => id.toString() !== memberId);
    await group.save();

    res.status(200).json({ message: "Member removed", group });
  } catch (error) {
    console.error("Remove member error:", error.message);
    res.status(500).json({ message: "Failed to remove member" });
  }
};

// ✅ Change Admin
export const changeAdmin = async (req, res) => {
  const { groupId } = req.params;
  const { newAdminId } = req.body;
  const userId = req.user._id;

  try {
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.admin.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Only current admin can transfer admin role" });
    }

    if (!group.members.includes(newAdminId)) {
      return res
        .status(400)
        .json({ message: "New admin must be a group member" });
    }

    group.admin = newAdminId;
    await group.save();

    res.status(200).json({ message: "Admin changed", group });
  } catch (error) {
    console.error("Change admin error:", error.message);
    res.status(500).json({ message: "Failed to change admin" });
  }
};
