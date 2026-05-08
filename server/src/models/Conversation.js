import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    // Participants: sorted array for consistent conversation lookup
    participantIds: {
      type: [String],
      required: true,
      validate: {
        validator: (v) => v.length === 2 && v[0] !== v[1],
        message: "Conversation must have exactly 2 unique participants",
      },
    },

    // Listing associated with this conversation
    listingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },

    // Last message timestamp for sorting
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },

    // Last message preview for conversation list
    lastMessage: {
      type: String,
      default: "",
    },

    // Track read status per user
    readBy: {
      type: Map,
      of: Date,
      default: new Map(),
    },
  },
  { timestamps: true }
);

// Indexes for efficient queries
conversationSchema.index({ participantIds: 1, listingId: 1 }, { unique: true });
conversationSchema.index({ participantIds: 1, lastMessageAt: -1 });
conversationSchema.index({ "participantIds.0": 1, lastMessageAt: -1 });
conversationSchema.index({ "participantIds.1": 1, lastMessageAt: -1 });

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
