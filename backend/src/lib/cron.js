import cron from "node-cron";
import ScheduledMessage from "../models/scheduledMessage.model.js";
import Message from "../models/message.model.js";
import Reminder from "../models/reminder.model.js";
import { io, getReceiverSocketId } from "./socket.js";

cron.schedule("* * * * *", async () => {
  console.log("🔍 Checking for scheduled messages and reminders...");

  const now = new Date();

  // Scheduled Messages
  const pendingMessages = await ScheduledMessage.find({
    scheduledFor: { $lte: now },
    isSent: false,
  });

  for (let msg of pendingMessages) {
    const newMessage = await Message.create({
      senderId: msg.senderId,
      receiverId: msg.receiverId,
      text: msg.text,
      image: msg.image || null,
    });

    const receiverSocketId = getReceiverSocketId(msg.receiverId.toString());
    const senderSocketId = getReceiverSocketId(msg.senderId.toString());

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
      io.to(receiverSocketId).emit("newNotification", {
        text: `📨 Scheduled message from ${msg.senderId} delivered.`,
        timestamp: now,
      });
    }

    if (senderSocketId) {
      io.to(senderSocketId).emit("newMessage", newMessage);
      io.to(senderSocketId).emit("newNotification", {
        text: `✅ Your scheduled message to ${msg.receiverId} was sent.`,
        timestamp: now,
      });
    }

    msg.isSent = true;
    await msg.save();
  }

  // Reminders
  const dueReminders = await Reminder.find({
    scheduledFor: { $lte: now },
    isSent: false,
  });

  for (let rem of dueReminders) {
    const userSocketId = getReceiverSocketId(rem.userId.toString());
    if (userSocketId) {
      io.to(userSocketId).emit("newNotification", {
        text: `⏰ Reminder: ${rem.text}`,
        timestamp: now,
      });
    }

    rem.isSent = true;
    await rem.save();
  }

  if (pendingMessages.length || dueReminders.length) {
    console.log(
      `✅ Dispatched ${pendingMessages.length} scheduled messages and ${dueReminders.length} reminders`
    );
  }
});
