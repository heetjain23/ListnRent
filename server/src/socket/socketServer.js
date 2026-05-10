import { Server } from "socket.io";
import admin from "../config/firebase-admin.js";
import * as messageService from "../services/messageService.js";

/**
 * socketServer.js
 *
 * Architecture decisions:
 * - ALL DB writes still go through REST controllers (single source of truth)
 * - Socket server ONLY broadcasts events — never writes to DB itself
 * - Each user joins a personal room (uid) on connect for targeted delivery
 * - Conversation rooms are joined/left explicitly by the client
 * - Typing events use debounced in-memory state — zero DB hits
 * - Online presence is tracked in-memory with a Map — zero DB hits
 * - No polling anywhere on the server side
 */

// In-memory presence map: uid → Set of socketIds
const onlineUsers = new Map();

// In-memory typing state: `${conversationId}:${userId}` → timeoutId
const typingTimeouts = new Map();
const TYPING_TIMEOUT_MS = 3500;

// ── Helpers ───────────────────────────────────────────────────────────────────

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
    return true; // last socket — user is now offline
  }
  return false;
};

const isUserOnline = (uid) => onlineUsers.has(uid) && onlineUsers.get(uid).size > 0;

// ── Auth middleware ───────────────────────────────────────────────────────────

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
    next();
  } catch (err) {
    console.error("[Socket] Auth failed:", err.message);
    next(new Error("Invalid authentication token"));
  }
};

// ── Main setup ────────────────────────────────────────────────────────────────

export const initSocketServer = (httpServer, allowedOrigins) => {
  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
    // Tuning: prefer WebSocket, fall back to polling only if needed
    transports: ["websocket", "polling"],
    // Ping tuning — keeps connections alive without hammering
    pingTimeout: 60000,
    pingInterval: 25000,
    // Limit payload size
    maxHttpBufferSize: 1e6, // 1 MB
  });

  // ── Apply auth middleware ──────────────────────────────────────────────────
  io.use(authenticateSocket);

  // ── Connection handler ────────────────────────────────────────────────────
  io.on("connection", (socket) => {
    const uid = socket.uid;
    console.log(`[Socket] Connected: ${uid} (${socket.id})`);

    // Join personal room for targeted delivery
    socket.join(`user:${uid}`);
    addOnlineUser(uid, socket.id);

    // Broadcast online status to others in shared conversations
    socket.broadcast.emit("user:online", { uid });

    // ── join:conversation ────────────────────────────────────────────────────
    // Client calls this when opening a conversation thread.
    // Server verifies participation before granting room access.
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
        console.log(`[Socket] ${uid} joined conversation:${conversationId}`);
      } catch (err) {
        console.error("[Socket] join:conversation error:", err.message);
      }
    });

    // ── leave:conversation ───────────────────────────────────────────────────
    socket.on("leave:conversation", ({ conversationId } = {}) => {
      if (!conversationId) return;
      socket.leave(`conversation:${conversationId}`);
      // Clear any pending typing timeout for this user/conversation
      clearTypingTimeout(io, conversationId, uid);
    });

    // ── message:read ─────────────────────────────────────────────────────────
    // Client emits this after REST marks messages as read.
    // Server broadcasts the read receipt to the other participant(s).
    socket.on("message:read", ({ conversationId, readerId } = {}) => {
      if (!conversationId) return;
      // Only broadcast to the conversation room (not back to sender)
      socket.to(`conversation:${conversationId}`).emit("message:read", {
        conversationId,
        readerId: uid,
        readAt: new Date().toISOString(),
      });
    });

    // ── user:typing ──────────────────────────────────────────────────────────
    // Zero DB hits — pure in-memory debounce
    socket.on("user:typing", ({ conversationId } = {}) => {
      if (!conversationId) return;
      const key = `${conversationId}:${uid}`;

      // Clear existing timeout — debounce the stop event
      const existing = typingTimeouts.get(key);
      if (existing) clearTimeout(existing);

      // Broadcast typing start (only if not already typing)
      socket.to(`conversation:${conversationId}`).emit("user:typing", {
        conversationId,
        uid,
        displayName: socket.displayName || "",
      });

      // Auto-stop after timeout (handles tab close / no stop event)
      const timeout = setTimeout(() => {
        clearTypingTimeout(io, conversationId, uid, socket);
      }, TYPING_TIMEOUT_MS);

      typingTimeouts.set(key, timeout);
    });

    // ── user:stop_typing ─────────────────────────────────────────────────────
    socket.on("user:stop_typing", ({ conversationId } = {}) => {
      if (!conversationId) return;
      clearTypingTimeout(io, conversationId, uid, socket);
    });

    // ── user:online_check ────────────────────────────────────────────────────
    // Client can ask if specific users are online (e.g. for conversation header)
    socket.on("user:online_check", ({ uids } = {}) => {
      if (!Array.isArray(uids)) return;
      const result = {};
      uids.forEach((u) => { result[u] = isUserOnline(u); });
      socket.emit("user:online_status", result);
    });

    // ── disconnect ───────────────────────────────────────────────────────────
    socket.on("disconnect", (reason) => {
      console.log(`[Socket] Disconnected: ${uid} (${socket.id}) — ${reason}`);
      const wentOffline = removeOnlineUser(uid, socket.id);
      if (wentOffline) {
        socket.broadcast.emit("user:offline", {
          uid,
          lastSeen: new Date().toISOString(),
        });
      }
      // Clean up typing timeouts for this socket
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

// ── Helper: clear typing state ────────────────────────────────────────────────

const clearTypingTimeout = (io, conversationId, uid, socket) => {
  const key = `${conversationId}:${uid}`;
  const timeout = typingTimeouts.get(key);
  if (timeout) {
    clearTimeout(timeout);
    typingTimeouts.delete(key);
  }
  // Broadcast stop typing to others in the room
  const target = socket
    ? socket.to(`conversation:${conversationId}`)
    : io.to(`conversation:${conversationId}`);
  target.emit("user:stop_typing", { conversationId, uid });
};

// ── Exported broadcaster ──────────────────────────────────────────────────────
// Called by REST controllers AFTER successful DB writes.
// Keeps socket broadcasting decoupled from business logic.

let _io = null;

export const attachIO = (io) => { _io = io; };

export const getIO = () => _io;

/**
 * Broadcast a new message to a conversation room + update both participants'
 * conversation lists. Called from messageController after sendMessage().
 */
export const broadcastNewMessage = (conversationId, message, participantIds, conversationUpdate) => {
  if (!_io) return;

  // 1. Deliver message to everyone in the conversation room
  _io.to(`conversation:${conversationId}`).emit("message:new", {
    conversationId,
    message,
  });

  // 2. Update each participant's conversation list sidebar
  //    (includes lastMessage, lastMessageAt, unreadCount bump for non-senders)
  participantIds.forEach((uid) => {
    _io.to(`user:${uid}`).emit("conversation:update", {
      conversationId,
      ...conversationUpdate,
      // The sender's own unread count stays 0; others get bumped
      unreadCount: uid === message.senderId ? 0 : (conversationUpdate.unreadCount || 1),
    });
  });
};

/**
 * Broadcast read receipt — called after markMessagesAsRead().
 */
export const broadcastReadReceipt = (conversationId, readerId, participantIds) => {
  if (!_io) return;
  _io.to(`conversation:${conversationId}`).emit("message:read", {
    conversationId,
    readerId,
    readAt: new Date().toISOString(),
  });
  // Reset unread count for the reader in their sidebar
  _io.to(`user:${readerId}`).emit("conversation:update", {
    conversationId,
    unreadCount: 0,
  });
};