import mongoose from "mongoose";

const scheduledMessageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: { type: String },
  image: { type: String },
  scheduledFor: { type: Date, required: true },
  isSent: { type: Boolean, default: false },
});

export default mongoose.model("ScheduledMessage", scheduledMessageSchema);
