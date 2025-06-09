import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // For 1-to-1 chats
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // ✅ Make optional
    },

    // For group chats
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: false, // ✅ New field
    },

    text: {
      type: String,
    },

    image: {
      type: String,
    },

    deletedForUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    isDeletedForEveryone: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Enforce either receiverId or groupId exists
messageSchema.pre("save", function (next) {
  if (!this.receiverId && !this.groupId) {
    return next(new Error("Either receiverId or groupId must be provided."));
  }
  next();
});

const Message = mongoose.model("Message", messageSchema);

export default Message;
