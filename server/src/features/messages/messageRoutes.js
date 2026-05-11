import express from "express";
import * as messageController from "./messageController.js";
import { verifyFirebaseToken } from "../../middleware/authMiddleware.js";

const router = express.Router();

// All routes require auth
router.use(verifyFirebaseToken);

/**
 * GET /api/messages/conversations
 * Get user's conversations (paginated)
 * Query: { limit?, skip? }
 */
router.get("/conversations", messageController.handleGetConversations);

/**
 * POST /api/messages/push-subscriptions
 * Save browser Web Push subscription for closed-tab notifications
 */
router.post(
  "/push-subscriptions",
  messageController.handleSavePushSubscription
);

/**
 * GET /api/messages/get-or-create/:listingId/:otherUserId
 * Get or create a conversation with another user for a listing
 */
router.get(
  "/get-or-create/:listingId/:otherUserId",
  messageController.handleGetOrCreateConversation
);

/**
 * GET /api/messages/:conversationId
 * Get messages in a conversation
 * Query: { limit?, skip? }
 */
router.get("/:conversationId", messageController.handleGetMessages);

export default router;
