import React, { createContext, useCallback, useMemo, useState } from "react";

export const MessagingContext = createContext(null);

export const MessagingProvider = ({ children }) => {
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadConversations, setUnreadConversations] = useState([]);

  const notificationCallbackRef = React.useRef(null);

  const applyUnreadUpdate = useCallback((update = {}) => {
    const {
      conversationId,
      unreadCount: conversationUnreadCount,
      unreadConversations: snapshotConversations,
      unreadDelta,
      isSnapshot,
    } = update;

    if (isSnapshot) {
      const nextConversations = Array.isArray(snapshotConversations)
        ? snapshotConversations.filter((item) => (item.unreadCount || 0) > 0)
        : [];
      setUnreadConversations(nextConversations);
      setUnreadCount(
        typeof update.unreadCount === "number"
          ? Math.max(0, update.unreadCount)
          : nextConversations.reduce((sum, item) => sum + (item.unreadCount || 0), 0)
      );
      return;
    }

    if (!conversationId) return;

    setUnreadConversations((prev) => {
      const idx = prev.findIndex((item) => item.conversationId === conversationId);
      const next = [...prev];

      if ((conversationUnreadCount || 0) <= 0) {
        if (idx >= 0) next.splice(idx, 1);
      } else if (idx >= 0) {
        next[idx] = { ...next[idx], unreadCount: conversationUnreadCount };
      } else {
        next.push({ conversationId, unreadCount: conversationUnreadCount });
      }

      return next;
    });

    setUnreadCount((prev) => {
      if (typeof unreadDelta === "number") {
        return Math.max(0, prev + unreadDelta);
      }
      return prev;
    });
  }, []);

  const markConversationAsRead = useCallback((conversationId) => {
    if (!conversationId) return;
    setUnreadConversations((prev) => {
      const removed = prev.find((item) => item.conversationId === conversationId);
      setUnreadCount((prevCount) =>
        Math.max(0, prevCount - (removed?.unreadCount || 0))
      );
      return prev.filter((item) => item.conversationId !== conversationId);
    });
  }, []);

  const registerNotificationCallback = useCallback((callback) => {
    notificationCallbackRef.current = callback;
  }, []);

  const triggerNotification = useCallback((conversationId, message, otherUser) => {
    notificationCallbackRef.current?.({ conversationId, message, otherUser });
  }, []);

  const value = useMemo(
    () => ({
      activeConversationId,
      setActiveConversationId,
      unreadCount,
      setUnreadCount,
      unreadConversations,
      setUnreadConversations,
      applyUnreadUpdate,
      markConversationAsRead,
      registerNotificationCallback,
      triggerNotification,
    }),
    [
      activeConversationId,
      unreadCount,
      unreadConversations,
      applyUnreadUpdate,
      markConversationAsRead,
      registerNotificationCallback,
      triggerNotification,
    ]
  );

  return (
    <MessagingContext.Provider value={value}>{children}</MessagingContext.Provider>
  );
};

export const useMessagingContext = () => {
  const context = React.useContext(MessagingContext);
  if (!context) {
    throw new Error("useMessagingContext must be used within MessagingProvider");
  }
  return context;
};

export const useMessaging = useMessagingContext;
