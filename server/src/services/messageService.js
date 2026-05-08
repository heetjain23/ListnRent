import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

/**
 * Get or create a conversation between two users
 * Idempotent - returns existing conversation or creates new one
 */
export const getOrCreateConversation = async (userId1, userId2, listingId) => {
  if (userId1 === userId2) {
    throw new Error("Cannot create conversation with yourself");
  }

  // Sort IDs for consistent conversation lookup
  const [participantA, participantB] = [userId1, userId2].sort();

  try {
    let conversation = await Conversation.findOne({
      participantIds: [participantA, participantB],
      listingId,
    });

    if (conversation) {
      return conversation;
    }

    // Create new conversation
    conversation = await Conversation.create({
      participantIds: [participantA, participantB],
      listingId,
      readBy: new Map(),
    });

    return conversation;
  } catch (error) {
    throw new Error(`Failed to get/create conversation: ${error.message}`);
  }
};

/**
 * Send a message in a conversation
 * Creates conversation if needed, adds message
 */
export const sendMessage = async (conversationId, senderId, text) => {
  if (!text?.trim()) {
    throw new Error("Message text cannot be empty");
  }

  try {
    // Create message
    const message = await Message.create({
      conversationId,
      senderId,
      text: text.trim(),
      readBy: [{ userId: senderId, readAt: new Date() }],
    });

    // Update conversation's lastMessage and lastMessageAt
    await Conversation.findByIdAndUpdate(
      conversationId,
      {
        lastMessageAt: new Date(),
        lastMessage: text.trim().substring(0, 100),
        $set: { [`readBy.${senderId}`]: new Date() },
      },
      { new: true }
    );

    return message;
  } catch (error) {
    throw new Error(`Failed to send message: ${error.message}`);
  }
};

/**
 * Get all conversations for a user (paginated, sorted by latest)
 */
export const getUserConversations = async (
  userId,
  limit = 20,
  skip = 0
) => {
  try {
    const conversations = await Conversation.find({
      participantIds: userId,
    })
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Enrich with user data and unread status
    const enrichedConversations = await Promise.all(
      conversations.map(async (conv) => {
        const otherUserId = conv.participantIds.find((id) => id !== userId);
        const otherUser = await User.findOne({ uid: otherUserId }).select(
          "displayName photoURL email"
        );

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
  } catch (error) {
    throw new Error(`Failed to fetch conversations: ${error.message}`);
  }
};

/**
 * Get messages for a conversation (paginated)
 */
export const getConversationMessages = async (
  conversationId,
  limit = 50,
  skip = 0
) => {
  try {
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return messages;
  } catch (error) {
    throw new Error(`Failed to fetch messages: ${error.message}`);
  }
};

/**
 * Mark messages as read for a user
 */
export const markMessagesAsRead = async (conversationId, userId) => {
  try {
    const now = new Date();

    // Update messages - add userId to readBy if not already read
    await Message.updateMany(
      {
        conversationId,
        "readBy.userId": { $ne: userId },
      },
      {
        $push: {
          readBy: { userId, readAt: now },
        },
      }
    );

    // Update conversation readBy timestamp
    await Conversation.findByIdAndUpdate(
      conversationId,
      { $set: { [`readBy.${userId}`]: now } },
      { new: true }
    );
  } catch (error) {
    throw new Error(`Failed to mark messages as read: ${error.message}`);
  }
};

/**
 * Get total unread message count for a user
 */
export const getUnreadMessageCount = async (userId) => {
  try {
    const count = await Message.countDocuments({
      conversationId: {
        $in: await Conversation.find({
          participantIds: userId,
        }).select("_id"),
      },
      "readBy.userId": { $ne: userId },
    });

    return count;
  } catch (error) {
    throw new Error(`Failed to get unread count: ${error.message}`);
  }
};

/**
 * Get unread message count per conversation
 */
export const getUnreadConversations = async (userId) => {
  try {
    const conversations = await Conversation.find({
      participantIds: userId,
    }).select("_id");

    const unreadCounts = await Promise.all(
      conversations.map(async (conv) => {
        const count = await Message.countDocuments({
          conversationId: conv._id,
          "readBy.userId": { $ne: userId },
        });
        return {
          conversationId: conv._id.toString(),
          unreadCount: count,
        };
      })
    );

    return unreadCounts;
  } catch (error) {
    throw new Error(`Failed to fetch unread conversations: ${error.message}`);
  }
};

/**
 * Check if user is participant in conversation
 */
export const isUserInConversation = async (conversationId, userId) => {
  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return false;
    return conversation.participantIds.includes(userId);
  } catch (error) {
    return false;
  }
};
