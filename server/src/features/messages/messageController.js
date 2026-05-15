import * as messageService from "./messageService.js";
import { errorResponse } from "../../utils/helper.js";
import { broadcastReadReceipt } from "../../socket/socketServer.js";
import { savePushSubscription } from "./pushNotificationService.js";
import { sanitizeString } from "../../utils/sanitizer.js";

export const handleGetConversations = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { limit = 20, skip = 0 } = req.query;

    // Validate and limit pagination
    const validLimit = Math.min(parseInt(limit) || 20, 50);
    const validSkip = Math.min(parseInt(skip) || 0, 1000);

    const conversations = await messageService.getUserConversations(
      userId,
      validLimit,
      validSkip
    );

    res.status(200).json({ success: true, conversations });
  } catch (error) {
    console.error("[GetConversations Error]", error);
    errorResponse(res, error.message || "Failed to fetch conversations", 500);
  }
};

export const handleGetMessages = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { conversationId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    // Validate and limit pagination
    const validLimit = Math.min(parseInt(limit) || 50, 100);
    const validSkip = Math.min(parseInt(skip) || 0, 5000);

    const isParticipant = await messageService.isUserInConversation(
      conversationId,
      userId
    );
    if (!isParticipant) {
      return errorResponse(res, "Not authorized to view this conversation", 403);
    }

    const messages = await messageService.getConversationMessages(
      conversationId,
      validLimit,
      validSkip
    );

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error("[GetMessages Error]", error);
    errorResponse(res, error.message || "Failed to fetch messages", 500);
  }
};

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

    const result = await messageService.markMessagesAsRead(conversationId, userId);

    res.status(200).json({ success: true, message: "Messages marked as read" });

    broadcastReadReceipt(
      conversationId,
      userId,
      result.conversation?.participantIds || [],
      result.previousUnreadCount
    );
  } catch (error) {
    console.error("[MarkAsRead Error]", error);
    errorResponse(res, error.message || "Failed to mark as read", 500);
  }
};

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
      conversation: conversation.toObject ? conversation.toObject({ flattenMaps: true }) : conversation,
    });
  } catch (error) {
    console.error("[GetOrCreateConversation Error]", error);
    errorResponse(res, error.message || "Failed to get/create conversation", 500);
  }
};

export const handleSavePushSubscription = async (req, res) => {
  try {
    await savePushSubscription(req.user.uid, req.body);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("[SavePushSubscription Error]", error);
    errorResponse(res, error.message || "Failed to save push subscription", 400);
  }
};

export const handleGetUnread = async (req, res) => {
  try {
    const userId = req.user.uid;
    const unreadConversations = await messageService.getUnreadConversations(userId);
    const count = unreadConversations.reduce((acc, item) => acc + (item.unreadCount || 0), 0);

    res.status(200).json({ success: true, count, conversations: unreadConversations });
  } catch (error) {
    console.error("[GetUnread Error]", error);
    errorResponse(res, error.message || "Failed to fetch unread messages", 500);
  }
};
