import { Server } from "socket.io";
import admin from "../config/firebase-admin.js";
import * as messageService from "../features/messages/messageService.js";
import { sendMessagePushNotifications } from "../features/messages/pushNotificationService.js";
import { registerDisputeSocketHandlers } from "../features/disputes/disputeSocketHooks.js";

/**
 * Socket.IO messaging hub.
 *
 * Realtime event names:
 * - new_message
 * - unread_count_update
 * - typing_start
 * - typing_stop
 * - message_seen
 * - user_online
 * - user_offline
 *
 * Legacy aliases are still emitted/listened to during migration so older
 * clients do not break while the web app moves to the new event contract.
 */

const onlineUsers = new Map();
const typingTimeouts = new Map();
const TYPING_TIMEOUT_MS = 3500;

const addOnlineUser = (uid, socketId) => {
  if (!onlineUsers.has(uid)) onlineUsers.set(uid, new Set());
  onlineUsers.get(uid).add(socketId);
};

const removeOnlineUser = (uid, socketId) => {
  const sockets = onlineUsers.get(uid);
  if (!sockets) return false;
  sockets.delete(socketId);
  if (sockets.size === 0) {
    onlineUsers.delete(uid);
    return true;
  }
  return false;
};

const isUserOnline = (uid) => onlineUsers.has(uid) && onlineUsers.get(uid).size > 0;

const emitUnreadSnapshot = async (io, uid) => {
  try {
    const unreadConversations = await messageService.getUnreadConversations(uid);
    const unreadCount = unreadConversations.reduce(
      (sum, item) => sum + (item.unreadCount || 0),
      0
    );

    io.to(`user:${uid}`).emit("unread_count_update", {
      unreadCount,
      unreadConversations,
      isSnapshot: true,
    });
  } catch (err) {
    console.error("[Socket] unread snapshot error:", err.message);
  }
};

const authenticateSocket = async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace("Bearer ", "");

    if (!token) {
      return next(new Error("Authentication token required"));
    }

    const decoded = await admin.auth().verifyIdToken(token);
    socket.uid = decoded.uid;
    socket.userEmail = decoded.email;
    socket.displayName = decoded.name || "";
    next();
  } catch (err) {
    console.error("[Socket] Auth failed:", err.message);
    next(new Error("Invalid authentication token"));
  }
};

export const initSocketServer = (httpServer, allowedOrigins) => {
  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
    pingTimeout: 60000,
    pingInterval: 25000,
    maxHttpBufferSize: 1e6,
  });

  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    const uid = socket.uid;
    console.log(`[Socket] Connected: ${uid} (${socket.id})`);

    socket.join(`user:${uid}`);
    addOnlineUser(uid, socket.id);

    socket.broadcast.emit("user_online", { uid });
    socket.broadcast.emit("user:online", { uid });
    emitUnreadSnapshot(io, uid);

    // Register dispute-specific socket handlers (join/leave dispute rooms)
    registerDisputeSocketHandlers(socket, uid);

    socket.on("join:conversation", async ({ conversationId } = {}) => {
      if (!conversationId) return;
      try {
        const isParticipant = await messageService.isUserInConversation(
          conversationId,
          uid
        );
        if (!isParticipant) {
          socket.emit("error:unauthorized", {
            message: "Not a participant in this conversation",
          });
          return;
        }
        socket.join(`conversation:${conversationId}`);
      } catch (err) {
        console.error("[Socket] join:conversation error:", err.message);
      }
    });

    socket.on("leave:conversation", ({ conversationId } = {}) => {
      if (!conversationId) return;
      socket.leave(`conversation:${conversationId}`);
      clearTypingTimeout(io, conversationId, uid, socket);
    });

    const handleNewMessage = async ({ conversationId, text, clientRequestId } = {}, ack) => {
      try {
        if (!conversationId || !text?.trim()) {
          throw new Error("conversationId and text are required");
        }

        const { message, conversation } = await messageService.sendMessage(
          conversationId,
          uid,
          text,
          clientRequestId
        );

        const messageObj = message.toObject();
        const senderName = await messageService.getUserDisplayName(uid);
        const participantIds = conversation?.participantIds || [];

        ack?.({
          success: true,
          conversationId,
          message: messageObj,
        });

        broadcastNewMessage(conversationId, messageObj, participantIds, {
          conversationId,
          lastMessage: text.trim().substring(0, 100),
          lastMessageAt: messageObj.createdAt,
          senderId: uid,
          senderName,
          unreadCounts: conversation?.unreadCounts,
        });
      } catch (err) {
        console.error("[Socket] new_message error:", err.message);
        ack?.({ success: false, message: err.message || "Failed to send message" });
      }
    };

    socket.on("new_message", handleNewMessage);

    const handleSeen = async ({ conversationId } = {}, ack) => {
      if (!conversationId) return;
      try {
        const result = await messageService.markMessagesAsRead(conversationId, uid);
        broadcastReadReceipt(
          conversationId,
          uid,
          result.conversation?.participantIds || [],
          result.previousUnreadCount
        );
        ack?.({ success: true });
      } catch (err) {
        console.error("[Socket] message_seen error:", err.message);
        ack?.({ success: false, message: err.message || "Failed to mark seen" });
      }
    };

    socket.on("message_seen", handleSeen);
    socket.on("message:read", handleSeen);

    const handleTypingStart = ({ conversationId } = {}) => {
      if (!conversationId) return;
      const key = `${conversationId}:${uid}`;
      const existing = typingTimeouts.get(key);
      if (existing) clearTimeout(existing);

      const payload = {
        conversationId,
        uid,
        displayName: socket.displayName || "",
      };

      socket.to(`conversation:${conversationId}`).emit("typing_start", payload);
      socket.to(`conversation:${conversationId}`).emit("user:typing", payload);

      const timeout = setTimeout(() => {
        clearTypingTimeout(io, conversationId, uid, socket);
      }, TYPING_TIMEOUT_MS);

      typingTimeouts.set(key, timeout);
    };

    socket.on("typing_start", handleTypingStart);
    socket.on("user:typing", handleTypingStart);

    const handleTypingStop = ({ conversationId } = {}) => {
      if (!conversationId) return;
      clearTypingTimeout(io, conversationId, uid, socket);
    };

    socket.on("typing_stop", handleTypingStop);
    socket.on("user:stop_typing", handleTypingStop);

    socket.on("user:online_check", ({ uids } = {}) => {
      if (!Array.isArray(uids)) return;
      const result = {};
      uids.forEach((candidateUid) => {
        result[candidateUid] = isUserOnline(candidateUid);
      });
      socket.emit("user:online_status", result);
    });

    socket.on("disconnect", (reason) => {
      console.log(`[Socket] Disconnected: ${uid} (${socket.id}) - ${reason}`);
      const wentOffline = removeOnlineUser(uid, socket.id);
      if (wentOffline) {
        const payload = { uid, lastSeen: new Date().toISOString() };
        socket.broadcast.emit("user_offline", payload);
        socket.broadcast.emit("user:offline", payload);
      }

      for (const [key, timeout] of typingTimeouts.entries()) {
        if (key.endsWith(`:${uid}`)) {
          clearTimeout(timeout);
          typingTimeouts.delete(key);
        }
      }
    });
  });

  console.log("[Socket] Socket.io server initialized");
  return io;
};

const clearTypingTimeout = (io, conversationId, uid, socket) => {
  const key = `${conversationId}:${uid}`;
  const timeout = typingTimeouts.get(key);
  if (timeout) {
    clearTimeout(timeout);
    typingTimeouts.delete(key);
  }

  const payload = { conversationId, uid };
  const target = socket
    ? socket.to(`conversation:${conversationId}`)
    : io.to(`conversation:${conversationId}`);
  target.emit("typing_stop", payload);
  target.emit("user:stop_typing", payload);
};

let _io = null;

export const attachIO = (io) => {
  _io = io;
};

export const getIO = () => _io;

export const broadcastNewMessage = (
  conversationId,
  message,
  participantIds,
  conversationUpdate
) => {
  if (!_io) return;

  const targetRooms = [
    `conversation:${conversationId}`,
    ...participantIds.map((uid) => `user:${uid}`),
  ];

  const payload = {
    conversationId,
    message,
    conversation: conversationUpdate,
  };

  _io.to(targetRooms).emit("new_message", payload);
  _io.to(targetRooms).emit("message:new", payload);

  participantIds.forEach((uid) => {
    const unreadCount = messageService.getUnreadCountForUser(conversationUpdate, uid);
    const conversationPayload = {
      conversationId,
      ...conversationUpdate,
      unreadCount,
    };

    _io.to(`user:${uid}`).emit("conversation:update", conversationPayload);
    _io.to(`user:${uid}`).emit("unread_count_update", {
      conversationId,
      unreadCount,
      unreadDelta: uid === message.senderId ? 0 : 1,
      isSnapshot: false,
    });
  });

  sendMessagePushNotifications({
    recipientIds: participantIds.filter((uid) => uid !== message.senderId),
    senderName: conversationUpdate.senderName,
    messageText: message.text,
    conversationId,
  }).catch((err) => {
    console.warn("[Push] Message notification failed:", err.message);
  });
};

export const broadcastReadReceipt = (
  conversationId,
  readerId,
  participantIds,
  previousUnreadCount = 0
) => {
  if (!_io) return;

  const payload = {
    conversationId,
    readerId,
    readAt: new Date().toISOString(),
  };

  _io.to(`conversation:${conversationId}`).emit("message_seen", payload);
  _io.to(`conversation:${conversationId}`).emit("message:read", payload);

  _io.to(`user:${readerId}`).emit("conversation:update", {
    conversationId,
    unreadCount: 0,
  });
  _io.to(`user:${readerId}`).emit("unread_count_update", {
    conversationId,
    unreadCount: 0,
    unreadDelta: -Math.max(0, previousUnreadCount || 0),
    isSnapshot: false,
  });
};
