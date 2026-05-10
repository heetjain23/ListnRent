import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    // Reference to conversation
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },

    // Sender user ID (Firebase UID)
    senderId: {
      type: String,
      required: true,
    },

    // Message content
    text: {
      type: String,
      required: true,
      trim: true,
    },

    // Track who has read this message
    readBy: [
      {
        userId: String,
        readAt: Date,
      },
    ],

    // Support for future media types
    type: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text",
    },
  },
  { timestamps: true }
);

// Indexes for efficient queries
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ conversationId: 1, senderId: 1 });
messageSchema.index({ senderId: 1, createdAt: -1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;
