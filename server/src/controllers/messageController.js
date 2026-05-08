import * as messageService from "../services/messageService.js";
import { errorResponse } from "../utils/helper.js";

/**
 * Send a message
 */
export const handleSendMessage = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { conversationId, otherUserId, listingId, text } = req.body;

    // Validate input
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

    let finalConversationId = conversationId;

    // Get or create conversation if needed
    if (!conversationId) {
      const conversation = await messageService.getOrCreateConversation(
        userId,
        otherUserId,
        listingId
      );
      finalConversationId = conversation._id.toString();
    }

    // Verify user is in conversation
    const isParticipant = await messageService.isUserInConversation(
      finalConversationId,
      userId
    );
    if (!isParticipant) {
      return errorResponse(
        res,
        "Not authorized to message in this conversation",
        403
      );
    }

    // Send message
    const message = await messageService.sendMessage(
      finalConversationId,
      userId,
      text
    );

    res.status(201).json({
      success: true,
      conversationId: finalConversationId,
      message: message.toObject(),
    });
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
 */
export const handleGetMessages = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { conversationId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    // Verify user is in conversation
    const isParticipant = await messageService.isUserInConversation(
      conversationId,
      userId
    );
    if (!isParticipant) {
      return errorResponse(res, "Not authorized to view this conversation", 403);
    }

    // Mark messages as read
    await messageService.markMessagesAsRead(conversationId, userId);

    // Get messages
    const messages = await messageService.getConversationMessages(
      conversationId,
      Math.min(parseInt(limit) || 50, 100),
      Math.min(parseInt(skip) || 0, 5000)
    );

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("[GetMessages Error]", error);
    errorResponse(res, error.message || "Failed to fetch messages", 500);
  }
};

/**
 * Mark messages as read (explicit)
 */
export const handleMarkAsRead = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { conversationId } = req.params;

    // Verify user is in conversation
    const isParticipant = await messageService.isUserInConversation(
      conversationId,
      userId
    );
    if (!isParticipant) {
      return errorResponse(res, "Not authorized", 403);
    }

    await messageService.markMessagesAsRead(conversationId, userId);

    res.status(200).json({ success: true, message: "Messages marked as read" });
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
    const unreadConversations =
      await messageService.getUnreadConversations(userId);

    res.status(200).json({
      success: true,
      unreadCount,
      unreadConversations,
    });
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

    if (!otherUserId) {
      return errorResponse(res, "otherUserId required", 400);
    }

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
    errorResponse(
      res,
      error.message || "Failed to get/create conversation",
      500
    );
  }
};
