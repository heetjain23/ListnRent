import React, { createContext, useState, useCallback, useRef, useEffect } from "react";
import * as messagesService from "../services/messagesService";

export const MessagingContext = createContext(null);

export const MessagingProvider = ({ children }) => {
  // Active conversation tracking
  const [activeConversationId, setActiveConversationId] = useState(null);

  // Unread state
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadConversations, setUnreadConversations] = useState([]);

  // Polling state
  const [pollingEnabled, setPollingEnabled] = useState(true);
  const pollingIntervalRef = useRef(null);

  // Notification callbacks
  const notificationCallbackRef = useRef(null);

  /**
   * Refresh unread counts
   */
  const refreshUnreadCounts = useCallback(async () => {
    try {
      const response = await messagesService.getUnreadCounts();
      setUnreadCount(response.unreadCount || 0);
      setUnreadConversations(response.unreadConversations || []);
      return response;
    } catch (err) {
      console.error("Failed to refresh unread counts:", err);
    }
  }, []);

  /**
   * Register notification callback
   */
  const registerNotificationCallback = useCallback((callback) => {
    notificationCallbackRef.current = callback;
  }, []);

  /**
   * Trigger notification callback
   */
  const triggerNotification = useCallback(
    (conversationId, message, otherUser) => {
      if (notificationCallbackRef.current) {
        notificationCallbackRef.current({ conversationId, message, otherUser });
      }
    },
    []
  );

  /**
   * Mark conversation as read
   */
  const markConversationAsRead = useCallback((conversationId) => {
    setUnreadConversations((prev) => {
      const removed = prev.find((uc) => uc.conversationId === conversationId);
      
      // Update total unread count
      setUnreadCount((prevCount) =>
        Math.max(0, prevCount - (removed?.unreadCount || 0))
      );
      
      return prev.filter((uc) => uc.conversationId !== conversationId);
    });
  }, []);

  /**
   * Start polling for new messages
   * Polls every 5 seconds by default, 3 seconds when viewing active conversation
   */
  useEffect(() => {
    if (!pollingEnabled) return;

    const pollInterval = activeConversationId ? 3000 : 5000;

    const poll = async () => {
      await refreshUnreadCounts();
    };

    // Initial poll
    poll();

    // Set up interval
    pollingIntervalRef.current = setInterval(poll, pollInterval);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [pollingEnabled, activeConversationId, refreshUnreadCounts]);

  return (
    <MessagingContext.Provider
      value={{
        activeConversationId,
        setActiveConversationId,
        unreadCount,
        setUnreadCount,
        unreadConversations,
        setUnreadConversations,
        pollingEnabled,
        setPollingEnabled,
        refreshUnreadCounts,
        markConversationAsRead,
        registerNotificationCallback,
        triggerNotification,
      }}
    >
      {children}
    </MessagingContext.Provider>
  );
};

export const useMessagingContext = () => {
  const context = React.useContext(MessagingContext);
  if (!context) {
    throw new Error("useMessagingContext must be used within MessagingProvider");
  }
  return context;
};

// Alias for convenience
export const useMessaging = useMessagingContext;
