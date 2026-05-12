import Conversation from "./Conversation.js";
import Message from "./Message.js";
import User from "../users/User.js";

const getMapValue = (value, key) => {
  if (!value) return 0;
  if (value instanceof Map) return Number(value.get(key) || 0);
  return Number(value[key] || 0);
};

const mapToObject = (value = {}) => {
  if (value instanceof Map) return Object.fromEntries(value);
  return value || {};
};

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
      unreadCounts: new Map([
        [participantA, 0],
        [participantB, 0],
      ]),
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
 * Resolve a user's display name for notification enrichment.
 * Falls back gracefully so a missing user never blocks a broadcast.
 */
export const getUserDisplayName = async (uid) => {
  try {
    const user = await User.findOne({ uid }).select("displayName email").lean();
    if (user?.displayName) return user.displayName;
    if (user?.email) {
      // Derive a friendly name from the email prefix
      return user.email.split("@")[0].replace(/[._-]/g, " ");
    }
  } catch {
    // Non-fatal — caller handles the fallback
  }
  return "Someone";
};

/**
 * Send a message in a conversation and increment unread counters atomically.
 */
export const sendMessage = async (conversationId, senderId, text, clientRequestId = null) => {
  if (!text?.trim()) throw new Error("Message text cannot be empty");

  const conversation = await Conversation.findById(conversationId)
    .select("participantIds unreadCounts")
    .lean();

  if (!conversation?.participantIds?.includes(senderId)) {
    throw new Error("Not authorized to message in this conversation");
  }

  const message = await Message.create({
    conversationId,
    senderId,
    text: text.trim(),
    readBy: [{ userId: senderId, readAt: new Date() }],
    clientRequestId,
  });

  const now = new Date();
  const inc = {};
  const set = {
    lastMessageAt: now,
    lastMessage: text.trim().substring(0, 100),
    [`readBy.${senderId}`]: now,
    [`unreadCounts.${senderId}`]: 0,
  };

  conversation.participantIds
    .filter((uid) => uid !== senderId)
    .forEach((uid) => {
      inc[`unreadCounts.${uid}`] = 1;
    });

  const updatedConversation = await Conversation.findByIdAndUpdate(
    conversationId,
    {
      $set: set,
      ...(Object.keys(inc).length ? { $inc: inc } : {}),
    },
    { new: true }
  ).lean();

  return { message, conversation: updatedConversation };
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

  const otherUserIds = conversations
    .map((conv) => conv.participantIds.find((id) => id !== userId))
    .filter(Boolean);

  const users = await User.find({ uid: { $in: otherUserIds } })
    .select("uid displayName photoURL email")
    .lean();
  const usersByUid = new Map(users.map((user) => [user.uid, user]));

  const enrichedConversations = conversations.map((conv) => {
      const otherUserId = conv.participantIds.find((id) => id !== userId);
      const otherUser = usersByUid.get(otherUserId);
      return {
        ...conv,
        unreadCounts: mapToObject(conv.unreadCounts),
        otherUser: {
          uid: otherUserId,
          displayName: otherUser?.displayName || "User",
          photoURL: otherUser?.photoURL || null,
          email: otherUser?.email,
        },
        unreadCount: getMapValue(conv.unreadCounts, userId),
      };
    });

  return enrichedConversations;
};

/**
 * Get messages for a conversation (latest page, returned oldest first)
 */
export const getConversationMessages = async (conversationId, limit = 50, skip = 0) => {
  const messages = await Message.find({ conversationId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return messages.reverse();
};

/**
 * Mark messages as read for a user
 */
export const markMessagesAsRead = async (conversationId, userId) => {
  const now = new Date();

  const conversation = await Conversation.findById(conversationId)
    .select("participantIds unreadCounts")
    .lean();

  if (!conversation?.participantIds?.includes(userId)) {
    throw new Error("Not authorized");
  }

  const previousUnreadCount = getMapValue(conversation.unreadCounts, userId);

  const updatedConversation = await Conversation.findByIdAndUpdate(
    conversationId,
    {
      $set: {
        [`readBy.${userId}`]: now,
        [`unreadCounts.${userId}`]: 0,
      },
    },
    { new: true }
  ).lean();

  return { previousUnreadCount, conversation: updatedConversation };
};

/**
 * Get total unread message count for a user from incremental counters.
 */
export const getUnreadMessageCount = async (userId) => {
  const conversations = await Conversation.find({ participantIds: userId })
    .select("unreadCounts")
    .lean();

  return conversations.reduce(
    (sum, conv) => sum + getMapValue(conv.unreadCounts, userId),
    0
  );
};

/**
 * Get per-conversation unread counts for a user from incremental counters.
 */
export const getUnreadConversations = async (userId) => {
  const conversations = await Conversation.find({ participantIds: userId })
    .select("_id unreadCounts")
    .lean();

  return conversations
    .map((conv) => ({
      conversationId: conv._id.toString(),
      unreadCount: getMapValue(conv.unreadCounts, userId),
    }))
    .filter((item) => item.unreadCount > 0);
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

export const getUnreadCountForUser = (conversation, userId) => {
  return getMapValue(conversation?.unreadCounts, userId);
};
