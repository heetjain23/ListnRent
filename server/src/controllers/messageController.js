import * as messageService from "../services/messageService.js";
import { errorResponse } from "../utils/helper.js";
import {
  broadcastNewMessage,
  broadcastReadReceipt,
} from "../socket/socketServer.js";

/**
 * Send a message
 * Flow: validate → write to DB → respond to HTTP client → broadcast via socket
 * Socket broadcast is fire-and-forget after the DB write succeeds.
 */
export const handleSendMessage = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { conversationId, otherUserId, listingId, text } = req.body;

    if (!text?.trim()) {
      return errorResponse(res, "Message text cannot be empty", 400);
    }

    if (!conversationId && (!otherUserId || !listingId)) {
      return errorResponse(
        res,
        "Either conversationId or (otherUserId + listingId) required",
        400
      );
    }

    if (userId === otherUserId) {
      return errorResponse(res, "Cannot message yourself", 400);
    }

    // Get or create conversation
    let finalConversationId = conversationId;
    let conversation;
    if (!conversationId) {
      conversation = await messageService.getOrCreateConversation(
        userId,
        otherUserId,
        listingId
      );
      finalConversationId = conversation._id.toString();
    } else {
      conversation = await messageService.getConversationById(finalConversationId);
    }

    // Verify participant
    const isParticipant = await messageService.isUserInConversation(
      finalConversationId,
      userId
    );
    if (!isParticipant) {
      return errorResponse(res, "Not authorized to message in this conversation", 403);
    }

    // Write message to DB
    const message = await messageService.sendMessage(
      finalConversationId,
      userId,
      text
    );

    const messageObj = message.toObject();

    // HTTP response — client gets immediate confirmation
    res.status(201).json({
      success: true,
      conversationId: finalConversationId,
      message: messageObj,
    });

    // Broadcast via socket (after responding so HTTP latency doesn't block)
    const participantIds = conversation?.participantIds ||
      (await messageService.getConversationParticipants(finalConversationId));

    broadcastNewMessage(
      finalConversationId,
      messageObj,
      participantIds,
      {
        conversationId: finalConversationId,
        lastMessage: text.trim().substring(0, 100),
        lastMessageAt: messageObj.createdAt,
        senderId: userId,
      }
    );
  } catch (error) {
    console.error("[SendMessage Error]", error);
    errorResponse(res, error.message || "Failed to send message", 500);
  }
};

/**
 * Get user's conversations
 */
export const handleGetConversations = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { limit = 20, skip = 0 } = req.query;

    const conversations = await messageService.getUserConversations(
      userId,
      Math.min(parseInt(limit) || 20, 50),
      Math.min(parseInt(skip) || 0, 1000)
    );

    res.status(200).json({ success: true, conversations });
  } catch (error) {
    console.error("[GetConversations Error]", error);
    errorResponse(res, error.message || "Failed to fetch conversations", 500);
  }
};

/**
 * Get messages in a conversation
 * Also marks messages as read and broadcasts the receipt.
 */
export const handleGetMessages = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { conversationId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    const isParticipant = await messageService.isUserInConversation(
      conversationId,
      userId
    );
    if (!isParticipant) {
      return errorResponse(res, "Not authorized to view this conversation", 403);
    }

    // Mark as read
    await messageService.markMessagesAsRead(conversationId, userId);

    const messages = await messageService.getConversationMessages(
      conversationId,
      Math.min(parseInt(limit) || 50, 100),
      Math.min(parseInt(skip) || 0, 5000)
    );

    res.status(200).json({ success: true, messages });

    // Broadcast read receipt after responding
    const participants = await messageService.getConversationParticipants(conversationId);
    broadcastReadReceipt(conversationId, userId, participants);
  } catch (error) {
    console.error("[GetMessages Error]", error);
    errorResponse(res, error.message || "Failed to fetch messages", 500);
  }
};

/**
 * Explicit mark-as-read (called when user focuses conversation)
 */
export const handleMarkAsRead = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { conversationId } = req.params;

    const isParticipant = await messageService.isUserInConversation(
      conversationId,
      userId
    );
    if (!isParticipant) {
      return errorResponse(res, "Not authorized", 403);
    }

    await messageService.markMessagesAsRead(conversationId, userId);

    res.status(200).json({ success: true, message: "Messages marked as read" });

    // Broadcast read receipt
    const participants = await messageService.getConversationParticipants(conversationId);
    broadcastReadReceipt(conversationId, userId, participants);
  } catch (error) {
    console.error("[MarkAsRead Error]", error);
    errorResponse(res, error.message || "Failed to mark as read", 500);
  }
};

/**
 * Get unread message count
 */
export const handleGetUnreadCount = async (req, res) => {
  try {
    const userId = req.user.uid;
    const unreadCount = await messageService.getUnreadMessageCount(userId);
    const unreadConversations = await messageService.getUnreadConversations(userId);

    res.status(200).json({ success: true, unreadCount, unreadConversations });
  } catch (error) {
    console.error("[GetUnreadCount Error]", error);
    errorResponse(res, error.message || "Failed to fetch unread count", 500);
  }
};

/**
 * Get or create conversation
 */
export const handleGetOrCreateConversation = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { listingId, otherUserId } = req.params;

    if (!otherUserId) return errorResponse(res, "otherUserId required", 400);
    if (userId === otherUserId) {
      return errorResponse(res, "Cannot create conversation with yourself", 400);
    }

    const conversation = await messageService.getOrCreateConversation(
      userId,
      otherUserId,
      listingId
    );

    res.status(200).json({
      success: true,
      conversationId: conversation._id.toString(),
      conversation: conversation.toObject(),
    });
  } catch (error) {
    console.error("[GetOrCreateConversation Error]", error);
    errorResponse(res, error.message || "Failed to get/create conversation", 500);
  }
};