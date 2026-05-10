import Conversation from "./Conversation.js";
import Message from "./Message.js";
import User from "../users/User.js";

/**
 * Get or create a conversation between two users
 */
export const getOrCreateConversation = async (userId1, userId2, listingId) => {
  if (userId1 === userId2) throw new Error("Cannot create conversation with yourself");

  const [participantA, participantB] = [userId1, userId2].sort();

  let conversation = await Conversation.findOne({
    participantIds: [participantA, participantB],
    listingId,
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participantIds: [participantA, participantB],
      listingId,
      readBy: new Map(),
    });
  }

  return conversation;
};

/**
 * Get a conversation by ID (lean for speed)
 */
export const getConversationById = async (conversationId) => {
  return Conversation.findById(conversationId).lean();
};

/**
 * Get participant IDs for a conversation — used by controller for socket targeting
 */
export const getConversationParticipants = async (conversationId) => {
  const conv = await Conversation.findById(conversationId).select("participantIds").lean();
  return conv?.participantIds || [];
};

/**
 * Send a message in a conversation
 */
export const sendMessage = async (conversationId, senderId, text) => {
  if (!text?.trim()) throw new Error("Message text cannot be empty");

  const message = await Message.create({
    conversationId,
    senderId,
    text: text.trim(),
    readBy: [{ userId: senderId, readAt: new Date() }],
  });

  // Update conversation metadata in a single atomic write
  await Conversation.findByIdAndUpdate(
    conversationId,
    {
      lastMessageAt: new Date(),
      lastMessage: text.trim().substring(0, 100),
      $set: { [`readBy.${senderId}`]: new Date() },
    }
  );

  return message;
};

/**
 * Get all conversations for a user (paginated, sorted by latest)
 */
export const getUserConversations = async (userId, limit = 20, skip = 0) => {
  const conversations = await Conversation.find({ participantIds: userId })
    .sort({ lastMessageAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const enrichedConversations = await Promise.all(
    conversations.map(async (conv) => {
      const otherUserId = conv.participantIds.find((id) => id !== userId);
      const otherUser = await User.findOne({ uid: otherUserId })
        .select("displayName photoURL email")
        .lean();

      const unreadCount = await Message.countDocuments({
        conversationId: conv._id,
        "readBy.userId": { $ne: userId },
      });

      return {
        ...conv,
        otherUser: {
          uid: otherUserId,
          displayName: otherUser?.displayName || "User",
          photoURL: otherUser?.photoURL || null,
          email: otherUser?.email,
        },
        unreadCount,
      };
    })
  );

  return enrichedConversations;
};

/**
 * Get messages for a conversation (paginated, oldest first)
 */
export const getConversationMessages = async (conversationId, limit = 50, skip = 0) => {
  return Message.find({ conversationId })
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

/**
 * Mark messages as read for a user
 */
export const markMessagesAsRead = async (conversationId, userId) => {
  const now = new Date();

  await Message.updateMany(
    {
      conversationId,
      "readBy.userId": { $ne: userId },
    },
    {
      $push: { readBy: { userId, readAt: now } },
    }
  );

  await Conversation.findByIdAndUpdate(
    conversationId,
    { $set: { [`readBy.${userId}`]: now } }
  );
};

/**
 * Get total unread message count for a user
 */
export const getUnreadMessageCount = async (userId) => {
  const userConversations = await Conversation.find({ participantIds: userId })
    .select("_id")
    .lean();

  const ids = userConversations.map((c) => c._id);

  return Message.countDocuments({
    conversationId: { $in: ids },
    "readBy.userId": { $ne: userId },
  });
};

/**
 * Get per-conversation unread counts for a user
 */
export const getUnreadConversations = async (userId) => {
  const conversations = await Conversation.find({ participantIds: userId })
    .select("_id")
    .lean();

  const unreadCounts = await Promise.all(
    conversations.map(async (conv) => {
      const count = await Message.countDocuments({
        conversationId: conv._id,
        "readBy.userId": { $ne: userId },
      });
      return { conversationId: conv._id.toString(), unreadCount: count };
    })
  );

  return unreadCounts;
};

/**
 * Check if user is participant in conversation
 */
export const isUserInConversation = async (conversationId, userId) => {
  const conversation = await Conversation.findById(conversationId)
    .select("participantIds")
    .lean();
  return conversation?.participantIds?.includes(userId) ?? false;
};