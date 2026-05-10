import { api } from "./api";

const BASE = "/api/messages";

/**
 * Send a message into an existing conversation.
 * Body: { conversationId, text }
 *
 * The old signature sent { listingId, recipientId, text } which caused a 400
 * because the field was named otherUserId in the controller, and we should
 * always have a conversationId by the time the user is typing a reply anyway.
 */
export const sendMessage = async ({ conversationId, text }) => {
  return api(`${BASE}/send`, {
    method: "POST",
    body: JSON.stringify({ conversationId, text }),
    auth: true,
  });
};

/**
 * Get user's conversations (paginated)
 */
export const getConversations = async (limit = 20, skip = 0) => {
  return api(`${BASE}/conversations?limit=${limit}&skip=${skip}`, { auth: true });
};

/**
 * Get messages in a conversation (auto-marks as read on server)
 */
export const getMessages = async (conversationId, limit = 50, skip = 0) => {
  return api(`${BASE}/${conversationId}?limit=${limit}&skip=${skip}`, { auth: true });
};

/**
 * Explicitly mark messages as read
 */
export const markAsRead = async (conversationId) => {
  return api(`${BASE}/${conversationId}/read`, { method: "POST", auth: true });
};

/**
 * Get unread counts
 */
export const getUnreadCounts = async () => {
  return api(`${BASE}/unread/count`, { auth: true });
};

/**
 * Get or create a conversation (used before opening a chat from a listing page)
 */
export const getOrCreateConversation = async (listingId, otherUserId) => {
  return api(`${BASE}/get-or-create/${listingId}/${otherUserId}`, { auth: true });
};