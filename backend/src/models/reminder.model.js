import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  scheduledFor: { type: Date, required: true },
  isSent: { type: Boolean, default: false },
});

export default mongoose.model("Reminder", reminderSchema);
