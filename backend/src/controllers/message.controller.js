import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import Group from "../models/group.model.js";
import ScheduledMessage from "../models/scheduledMessage.model.js"; // ✅ new import
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// ✅ Get users excluding self
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Get messages for private or group chat
export const getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const myId = req.user._id;
    const isGroup = req.query.group === "true";

    let messages;
    if (isGroup) {
      messages = await Message.find({ groupId: id });
    } else {
      messages = await Message.find({
        $or: [
          { senderId: myId, receiverId: id },
          { senderId: id, receiverId: myId },
        ],
        deletedForUsers: { $ne: myId },
      });
    }

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Send message (private or group based on params)
export const sendMessage = async (req, res) => {
  try {
    const { text, image, groupId } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    let newMessage;

    if (groupId) {
      const group = await Group.findById(groupId);
      if (!group) return res.status(404).json({ message: "Group not found" });

      newMessage = new Message({
        senderId,
        groupId,
        text,
        image: imageUrl,
      });

      await newMessage.save();

      group.members.forEach((memberId) => {
        if (memberId.toString() !== senderId.toString()) {
          const socketId = getReceiverSocketId(memberId);
          if (socketId) io.to(socketId).emit("newMessage", newMessage);
        }
      });
    } else {
      newMessage = new Message({
        senderId,
        receiverId,
        text,
        image: imageUrl,
      });

      await newMessage.save();

      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
      }
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Schedule message controller
export const scheduleMessage = async (req, res) => {
  try {
    const { receiverId, text, image, scheduledFor } = req.body;

    const scheduledMessage = await ScheduledMessage.create({
      senderId: req.user._id,
      receiverId,
      text,
      image,
      scheduledFor,
    });

    res.status(201).json(scheduledMessage);
  } catch (err) {
    console.error("Error in scheduleMessage controller:", err.message);
    res.status(500).json({ message: "Failed to schedule message" });
  }
};

// ✅ Delete message for everyone (only sender allowed)
export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });

    if (message.senderId.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await message.deleteOne();

    if (message.receiverId) {
      const receiverSocketId = getReceiverSocketId(message.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("messageDeleted", messageId);
      }
    } else if (message.groupId) {
      const group = await Group.findById(message.groupId);
      group.members.forEach((memberId) => {
        const socketId = getReceiverSocketId(memberId);
        if (socketId) io.to(socketId).emit("messageDeleted", messageId);
      });
    }

    io.to(getReceiverSocketId(userId)).emit("messageDeleted", messageId);

    res
      .status(200)
      .json({ message: "Message deleted for everyone", messageId });
  } catch (error) {
    console.error("Error in deleteMessage controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Delete message only for the current user (soft delete)
export const deleteMessageForMe = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });

    if (!message.deletedForUsers.includes(userId)) {
      message.deletedForUsers.push(userId);
      await message.save();
    }

    const userSocketId = getReceiverSocketId(userId);
    if (userSocketId) {
      io.to(userSocketId).emit("messageDeletedForMe", messageId);
    }

    res.status(200).json({ message: "Message deleted for you" });
  } catch (error) {
    console.error("Error in deleteMessageForMe controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
