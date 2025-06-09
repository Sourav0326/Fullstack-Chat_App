import mongoose from "mongoose";

const statusSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  mediaUrl: { type: String, required: true },
  mediaType: { type: String, enum: ["image", "video"], required: true },
  caption: { type: String },
  createdAt: { type: Date, default: Date.now },
  viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  visibleTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

export default mongoose.model("Status", statusSchema);
