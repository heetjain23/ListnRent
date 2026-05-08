import express from "express";
import * as messageController from "../controllers/messageController.js";
import { verifyFirebaseToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require auth
router.use(verifyFirebaseToken);

/**
 * POST /api/messages/send
 * Send a message
 * Body: { conversationId?, otherUserId?, listingId?, text }
 */
router.post("/send", messageController.handleSendMessage);

/**
 * GET /api/messages/conversations
 * Get user's conversations (paginated)
 * Query: { limit?, skip? }
 */
router.get("/conversations", messageController.handleGetConversations);

/**
 * GET /api/messages/:conversationId
 * Get messages in a conversation (auto-marks as read)
 * Query: { limit?, skip? }
 */
router.get("/:conversationId", messageController.handleGetMessages);

/**
 * POST /api/messages/:conversationId/read
 * Explicitly mark messages as read
 */
router.post("/:conversationId/read", messageController.handleMarkAsRead);

/**
 * GET /api/messages/unread/count
 * Get unread message counts
 */
router.get("/unread/count", messageController.handleGetUnreadCount);

/**
 * GET /api/messages/get-or-create/:listingId/:otherUserId
 * Get or create a conversation with another user for a listing
 */
router.get(
  "/get-or-create/:listingId/:otherUserId",
  messageController.handleGetOrCreateConversation
);

export default router;
