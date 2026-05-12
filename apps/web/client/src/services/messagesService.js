import { api } from "./api";

const BASE = "/api/messages";

/**
 * Get user's conversations (paginated)
 */
export const getConversations = async (limit = 20, skip = 0) => {
  return api(`${BASE}/conversations?limit=${limit}&skip=${skip}`, { auth: true });
};

/**
 * Get messages in a conversation (paginated history only)
 */
export const getMessages = async (conversationId, limit = 50, skip = 0) => {
  return api(`${BASE}/${conversationId}?limit=${limit}&skip=${skip}`, { auth: true });
};

/**
 * Get or create a conversation (used before opening a chat from a listing page)
 */
export const getOrCreateConversation = async (listingId, otherUserId) => {
  return api(`${BASE}/get-or-create/${listingId}/${otherUserId}`, { auth: true });
};
