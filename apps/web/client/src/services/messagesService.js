import { api } from "./api";

const BASE = "/api/messages";

/**
 * Send a message
 */
export const sendMessage = async (data) => {
  const response = await api(`${BASE}/send`, {
    method: "POST",
    body: JSON.stringify(data),
    auth: true,
  });
  return response;
};

/**
 * Get user's conversations (paginated)
 */
export const getConversations = async (limit = 20, skip = 0) => {
  const response = await api(
    `${BASE}/conversations?limit=${limit}&skip=${skip}`,
    {
      auth: true,
    }
  );
  return response;
};

/**
 * Get messages in a conversation
 * Auto-marks messages as read
 */
export const getMessages = async (conversationId, limit = 50, skip = 0) => {
  const response = await api(
    `${BASE}/${conversationId}?limit=${limit}&skip=${skip}`,
    {
      auth: true,
    }
  );
  return response;
};

/**
 * Mark messages as read (explicit)
 */
export const markAsRead = async (conversationId) => {
  const response = await api(`${BASE}/${conversationId}/read`, {
    method: "POST",
    auth: true,
  });
  return response;
};

/**
 * Get unread counts
 */
export const getUnreadCounts = async () => {
  const response = await api(`${BASE}/unread/count`, {
    auth: true,
  });
  return response;
};

/**
 * Get or create conversation with another user for a listing
 */
export const getOrCreateConversation = async (listingId, otherUserId) => {
  const response = await api(
    `${BASE}/get-or-create/${listingId}/${otherUserId}`,
    {
      auth: true,
    }
  );
  return response;
};
