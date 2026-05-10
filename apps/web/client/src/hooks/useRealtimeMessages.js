import { useEffect, useRef, useCallback, useState } from "react";
import { useSocketContext } from "../context/SocketContext";

/**
 * useRealtimeMessages
 *
 * Manages socket room membership and real-time message delivery for a
 * single conversation. Replaces the 3-second polling interval in ChatWindow.
 *
 * @param {string|null}  conversationId
 * @param {Function}     onNewMessage   - (message) => void
 * @param {Function}     onReadReceipt  - ({ conversationId, readerId, readAt }) => void
 * @param {Function}     onTypingStart  - ({ uid, displayName }) => void
 * @param {Function}     onTypingStop   - ({ uid }) => void
 */
export const useRealtimeMessages = ({
  conversationId,
  onNewMessage,
  onReadReceipt,
  onTypingStart,
  onTypingStop,
}) => {
  const { getSocket } = useSocketContext();
  const currentConvRef = useRef(null);

  // Stable refs so socket handlers never capture stale callbacks
  const onNewMessageRef   = useRef(onNewMessage);
  const onReadReceiptRef  = useRef(onReadReceipt);
  const onTypingStartRef  = useRef(onTypingStart);
  const onTypingStopRef   = useRef(onTypingStop);
  useEffect(() => { onNewMessageRef.current  = onNewMessage;  }, [onNewMessage]);
  useEffect(() => { onReadReceiptRef.current = onReadReceipt; }, [onReadReceipt]);
  useEffect(() => { onTypingStartRef.current = onTypingStart; }, [onTypingStart]);
  useEffect(() => { onTypingStopRef.current  = onTypingStop;  }, [onTypingStop]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Leave previous room cleanly
    if (currentConvRef.current && currentConvRef.current !== conversationId) {
      socket.emit("leave:conversation", { conversationId: currentConvRef.current });
    }

    if (!conversationId) {
      currentConvRef.current = null;
      return;
    }

    socket.emit("join:conversation", { conversationId });
    currentConvRef.current = conversationId;

    const handleNewMessage = (data) => {
      if (data.conversationId !== conversationId) return;
      onNewMessageRef.current?.(data.message);
    };
    const handleReadReceipt = (data) => {
      if (data.conversationId !== conversationId) return;
      onReadReceiptRef.current?.(data);
    };
    const handleTypingStart = (data) => {
      if (data.conversationId !== conversationId) return;
      onTypingStartRef.current?.(data);
    };
    const handleTypingStop = (data) => {
      if (data.conversationId !== conversationId) return;
      onTypingStopRef.current?.(data);
    };

    socket.on("message:new",      handleNewMessage);
    socket.on("message:read",     handleReadReceipt);
    socket.on("user:typing",      handleTypingStart);
    socket.on("user:stop_typing", handleTypingStop);

    return () => {
      socket.off("message:new",      handleNewMessage);
      socket.off("message:read",     handleReadReceipt);
      socket.off("user:typing",      handleTypingStart);
      socket.off("user:stop_typing", handleTypingStop);
    };
  }, [conversationId, getSocket]);

  // Leave room on unmount
  useEffect(() => {
    return () => {
      const socket = getSocket();
      if (socket && currentConvRef.current) {
        socket.emit("leave:conversation", { conversationId: currentConvRef.current });
      }
    };
  }, [getSocket]);
};

/**
 * useRealtimeConversations
 *
 * Listens for `conversation:update` events on the user's personal room.
 * Updates the conversation list sidebar without any polling.
 */
export const useRealtimeConversations = ({ onConversationUpdate }) => {
  const { getSocket } = useSocketContext();
  const handlerRef = useRef(onConversationUpdate);
  useEffect(() => { handlerRef.current = onConversationUpdate; }, [onConversationUpdate]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = (data) => handlerRef.current?.(data);
    socket.on("conversation:update", handler);
    return () => socket.off("conversation:update", handler);
  }, [getSocket]);
};

/**
 * useTypingSender
 *
 * Returns stable sendTyping / sendStopTyping functions.
 * Debounces automatically — call sendTyping() on every keystroke.
 */
export const useTypingSender = (conversationId) => {
  const { getSocket }  = useSocketContext();
  const typingTimerRef = useRef(null);
  const isTypingRef    = useRef(false);

  const sendStopTyping = useCallback(() => {
    const socket = getSocket();
    if (!socket || !conversationId) return;
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    if (isTypingRef.current) {
      socket.emit("user:stop_typing", { conversationId });
      isTypingRef.current = false;
    }
  }, [conversationId, getSocket]);

  const sendTyping = useCallback(() => {
    const socket = getSocket();
    if (!socket || !conversationId) return;

    if (!isTypingRef.current) {
      socket.emit("user:typing", { conversationId });
      isTypingRef.current = true;
    }

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socket.emit("user:stop_typing", { conversationId });
      isTypingRef.current = false;
    }, 2000);
  }, [conversationId, getSocket]);

  useEffect(() => () => sendStopTyping(), [sendStopTyping]);

  return { sendTyping, sendStopTyping };
};

/**
 * useOnlinePresence — tracks live online/offline status of a given uid
 */
export const useOnlinePresence = (uid) => {
  const { getSocket } = useSocketContext();
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !uid) return;

    socket.emit("user:online_check", { uids: [uid] });

    const handleStatus  = (map) => { if (uid in map) setIsOnline(map[uid]); };
    const handleOnline  = (d)   => { if (d.uid === uid) setIsOnline(true);  };
    const handleOffline = (d)   => { if (d.uid === uid) setIsOnline(false); };

    socket.on("user:online_status", handleStatus);
    socket.on("user:online",        handleOnline);
    socket.on("user:offline",       handleOffline);

    return () => {
      socket.off("user:online_status", handleStatus);
      socket.off("user:online",        handleOnline);
      socket.off("user:offline",       handleOffline);
    };
  }, [uid, getSocket]);

  return { isOnline };
};