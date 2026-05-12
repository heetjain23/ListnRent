import { useEffect, useRef, useCallback, useState } from "react";
import { useSocketContext } from "../context/SocketContext";

export const useRealtimeMessages = ({
  conversationId,
  onNewMessage,
  onReadReceipt,
  onTypingStart,
  onTypingStop,
  onUnreadUpdate,
}) => {
  const { socketRef, connectCount } = useSocketContext();
  const cbRef = useRef({
    onNewMessage,
    onReadReceipt,
    onTypingStart,
    onTypingStop,
    onUnreadUpdate,
  });
  const joinedRoomRef = useRef(null);

  useEffect(() => {
    cbRef.current = {
      onNewMessage,
      onReadReceipt,
      onTypingStart,
      onTypingStop,
      onUnreadUpdate,
    };
  });

  useEffect(() => {
    const socket = socketRef.current;

    if (joinedRoomRef.current && joinedRoomRef.current !== conversationId) {
      socket?.emit("leave:conversation", { conversationId: joinedRoomRef.current });
      joinedRoomRef.current = null;
    }

    if (!socket || !conversationId) return;

    socket.emit("join:conversation", { conversationId });
    joinedRoomRef.current = conversationId;

    const onMsg = ({ conversationId: cid, message }) => {
      if (cid !== conversationId) return;
      cbRef.current.onNewMessage?.(message);
    };
    const onRead = (data) => {
      if (data.conversationId !== conversationId) return;
      cbRef.current.onReadReceipt?.(data);
    };
    const onTypStart = (data) => {
      if (data.conversationId !== conversationId) return;
      cbRef.current.onTypingStart?.(data);
    };
    const onTypStop = (data) => {
      if (data.conversationId !== conversationId) return;
      cbRef.current.onTypingStop?.(data);
    };
    const onUnread = (data) => {
      if (data.conversationId !== conversationId) return;
      cbRef.current.onUnreadUpdate?.(data);
    };

    socket.on("new_message", onMsg);
    socket.on("message:new", onMsg);
    socket.on("message_seen", onRead);
    socket.on("message:read", onRead);
    socket.on("typing_start", onTypStart);
    socket.on("user:typing", onTypStart);
    socket.on("typing_stop", onTypStop);
    socket.on("user:stop_typing", onTypStop);
    socket.on("unread_count_update", onUnread);

    return () => {
      socket.off("new_message", onMsg);
      socket.off("message:new", onMsg);
      socket.off("message_seen", onRead);
      socket.off("message:read", onRead);
      socket.off("typing_start", onTypStart);
      socket.off("user:typing", onTypStart);
      socket.off("typing_stop", onTypStop);
      socket.off("user:stop_typing", onTypStop);
      socket.off("unread_count_update", onUnread);
    };
  }, [conversationId, connectCount, socketRef]);

  useEffect(() => {
    return () => {
      const socket = socketRef.current;
      if (socket && joinedRoomRef.current) {
        socket.emit("leave:conversation", { conversationId: joinedRoomRef.current });
        joinedRoomRef.current = null;
      }
    };
  }, [socketRef]);
};

export const useRealtimeConversations = ({ onConversationUpdate }) => {
  const { socketRef, connectCount } = useSocketContext();
  const cbRef = useRef(onConversationUpdate);

  useEffect(() => {
    cbRef.current = onConversationUpdate;
  });

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const messageHandler = ({ conversationId, conversation }) => {
      if (!conversation) return;
      cbRef.current?.({
        ...conversation,
        _id: conversationId,
        conversationId,
      });
    };
    const unreadHandler = (data) => {
      if (!data.conversationId || data.isSnapshot) return;
      cbRef.current?.({
        _id: data.conversationId,
        conversationId: data.conversationId,
        unreadCount: data.unreadCount,
      });
    };

    socket.on("new_message", messageHandler);
    socket.on("unread_count_update", unreadHandler);

    return () => {
      socket.off("new_message", messageHandler);
      socket.off("unread_count_update", unreadHandler);
    };
  }, [connectCount, socketRef]);
};

export const useTypingSender = (conversationId) => {
  const { socketRef } = useSocketContext();
  const timerRef = useRef(null);
  const isTypingRef = useRef(false);

  const sendStopTyping = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const socket = socketRef.current;
    if (socket?.connected && isTypingRef.current && conversationId) {
      socket.emit("typing_stop", { conversationId });
      isTypingRef.current = false;
    }
  }, [conversationId, socketRef]);

  const sendTyping = useCallback(() => {
    const socket = socketRef.current;
    if (!socket?.connected || !conversationId) return;

    if (!isTypingRef.current) {
      socket.emit("typing_start", { conversationId });
      isTypingRef.current = true;
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      socket.emit("typing_stop", { conversationId });
      isTypingRef.current = false;
    }, 2000);
  }, [conversationId, socketRef]);

  useEffect(() => () => sendStopTyping(), [sendStopTyping]);

  return { sendTyping, sendStopTyping };
};

export const useMessageSeenSender = (conversationId) => {
  const { socketRef } = useSocketContext();

  const sendMessageSeen = useCallback(() => {
    const socket = socketRef.current;
    if (!socket?.connected || !conversationId) return;
    socket.emit("message_seen", { conversationId });
  }, [conversationId, socketRef]);

  return { sendMessageSeen };
};

export const useOnlinePresence = (uid) => {
  const { socketRef, connectCount } = useSocketContext();
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !uid) return;

    if (connectCount > 0) {
      socket.emit("user:online_check", { uids: [uid] });
    }

    const onStatus = (map) => {
      if (uid in map) setIsOnline(map[uid]);
    };
    const onOnline = (data) => {
      if (data.uid === uid) setIsOnline(true);
    };
    const onOffline = (data) => {
      if (data.uid === uid) setIsOnline(false);
    };

    socket.on("user:online_status", onStatus);
    socket.on("user_online", onOnline);
    socket.on("user:online", onOnline);
    socket.on("user_offline", onOffline);
    socket.on("user:offline", onOffline);

    return () => {
      socket.off("user:online_status", onStatus);
      socket.off("user_online", onOnline);
      socket.off("user:online", onOnline);
      socket.off("user_offline", onOffline);
      socket.off("user:offline", onOffline);
    };
  }, [uid, connectCount, socketRef]);

  return { isOnline };
};
