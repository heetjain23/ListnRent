import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useAuth";
import { useMessagingContext } from "../../context/MessagingContext";
import { useSocketContext } from "../../context/SocketContext";
import { playNotificationSound } from "../../utils/notificationSound";
import { registerMessagePushSubscription } from "../../utils/pushNotifications";

const requestPermission = () => {
  if (!("Notification" in window)) return;
  if (Notification.permission === "default") {
    Notification.requestPermission();
  }
};

const showDeviceNotification = (title, body, tag) => {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  if (document.visibilityState === "visible") return;

  try {
    const notification = new Notification(title, {
      body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag,
      renotify: true,
    });
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
    setTimeout(() => notification.close(), 8000);
  } catch (err) {
    console.warn("[Notification]", err);
  }
};

const MessageNotificationListener = () => {
  const { user } = useAuth();
  const { socketRef, connectCount, socketState } = useSocketContext();
  const { activeConversationId, applyUnreadUpdate, markConversationAsRead } =
    useMessagingContext();

  const activeConvRef = useRef(activeConversationId);
  const userUidRef = useRef(user?.uid);
  const notifiedRef = useRef(new Set());

  useEffect(() => {
    activeConvRef.current = activeConversationId;
  }, [activeConversationId]);

  useEffect(() => {
    userUidRef.current = user?.uid;
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;
    requestPermission();
    registerMessagePushSubscription().catch((err) => {
      console.warn("[Push] Failed to register message push subscription:", err);
    });
  }, [user?.uid]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !user?.uid) return;

    const handleUnreadUpdate = (update) => {
      applyUnreadUpdate(update);
    };

    const handleNewMessage = ({ conversationId, message, conversation }) => {
      if (!conversationId || !message) return;
      if (message.senderId === userUidRef.current) return;

      if (activeConvRef.current === conversationId) {
        markConversationAsRead(conversationId);
        if (socket.connected) {
          socket.emit("message_seen", { conversationId });
        }
        return;
      }

      const messageKey = message._id || message.clientRequestId;
      if (messageKey && notifiedRef.current.has(messageKey)) return;
      if (messageKey) notifiedRef.current.add(messageKey);

      const name = conversation?.senderName || message.senderName || "Someone";
      const rawPreview = message.text || conversation?.lastMessage || "";
      const preview =
        rawPreview.length > 80
          ? `${rawPreview.substring(0, 80)}...`
          : rawPreview;

      toast.success(`Message from ${name}`, {
        description: preview || "Sent you a message",
        duration: 5000,
      });

      playNotificationSound();
      showDeviceNotification(
        `ListnRent - ${name}`,
        preview || "You have a new message",
        `conv-${conversationId}`,
      );
    };

    socket.on("unread_count_update", handleUnreadUpdate);
    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("unread_count_update", handleUnreadUpdate);
      socket.off("new_message", handleNewMessage);
    };
  }, [
    connectCount,
    socketRef,
    socketState,
    user?.uid,
    applyUnreadUpdate,
    markConversationAsRead,
  ]);

  useEffect(() => {
    if (!activeConversationId) return;
    markConversationAsRead(activeConversationId);
  }, [activeConversationId, markConversationAsRead]);

  return null;
};

export default MessageNotificationListener;
