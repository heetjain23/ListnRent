import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "./useAuth";
import { useSocketContext } from "../context/SocketContext";
import {
  confirmDisputeResolved,
  createDispute,
  getDispute,
  getDisputeMessages,
  getMyDisputes,
  reopenDispute,
  sendDisputeMessage,
} from "../services/disputesService";
import {
  DISPUTE_STATUS,
  SENDER_ROLE,
} from "@listnrent/shared/constants";

const EVENT_NAMES = [
  "dispute:created",
  "dispute:new_message",
  "dispute:status_changed",
  "dispute:resolved_pending",
  "dispute:closed",
  "dispute:reopened",
  "dispute:assigned",
  "dispute:unread_update",
];

const sortByNewestActivity = (left, right) => {
  const leftTime = new Date(left?.lastMessageAt || left?.updatedAt || left?.createdAt || 0).getTime();
  const rightTime = new Date(right?.lastMessageAt || right?.updatedAt || right?.createdAt || 0).getTime();
  return rightTime - leftTime;
};

const sortMessagesAscending = (messages = []) =>
  [...messages].sort(
    (left, right) =>
      new Date(left?.createdAt || left?.updatedAt || 0).getTime() -
      new Date(right?.createdAt || right?.updatedAt || 0).getTime(),
  );

const extractDispute = (payload) => payload?.dispute || payload?.data?.dispute || payload || null;
const extractMessage = (payload) => payload?.message || payload?.systemMessage || payload?.data?.message || null;

const upsertDispute = (items, incoming) => {
  if (!incoming?._id && !incoming?.disputeId) return items;

  const next = [...items];
  const index = next.findIndex(
    (item) => item._id === incoming._id || item.disputeId === incoming.disputeId,
  );

  if (index >= 0) {
    next[index] = { ...next[index], ...incoming };
  } else {
    next.unshift(incoming);
  }

  return next.sort(sortByNewestActivity);
};

const mergeMessages = (currentMessages, incomingMessages) => {
  const byId = new Map();
  [...currentMessages, ...incomingMessages].forEach((message) => {
    if (!message?._id) return;
    byId.set(message._id, { ...byId.get(message._id), ...message });
  });

  return sortMessagesAscending([...byId.values()]);
};

export const useMyDisputes = ({ initialStatus = "" } = {}) => {
  const { user } = useAuth();
  const { socketRef, connectCount } = useSocketContext();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const filterRef = useRef(statusFilter);

  useEffect(() => {
    filterRef.current = statusFilter;
  }, [statusFilter]);

  const fetchDisputes = useCallback(
    async ({ page = 1, append = false, limit = 10, status = filterRef.current } = {}) => {
      if (!user?.uid) return;

      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const response = await getMyDisputes({ page, limit, status });
        const nextDisputes = response?.data?.disputes || response?.disputes || [];
        const nextPagination = response?.data?.pagination || response?.pagination || {
          page,
          limit,
          total: nextDisputes.length,
          totalPages: 1,
        };

        setDisputes((current) => {
          if (!append || page === 1) return [...nextDisputes].sort(sortByNewestActivity);
          return upsertDispute(current, nextDisputes);
        });

        setPagination(nextPagination);
      } catch (fetchError) {
        setError(fetchError.message || "Failed to load disputes");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [user?.uid],
  );

  useEffect(() => {
    if (!user?.uid) return;
    queueMicrotask(() => {
      void fetchDisputes({ page: 1, append: false, status: statusFilter });
    });
  }, [user?.uid, statusFilter, fetchDisputes]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !user?.uid) return;

    const handleEvent = (payload) => {
      const dispute = extractDispute(payload);
      if (!dispute) return;
      if (dispute.raisedBy && dispute.raisedBy !== user.uid) return;

      setDisputes((current) => {
        const existed = current.some(
          (item) => item._id === dispute._id || item.disputeId === dispute.disputeId,
        );
        const next = upsertDispute(current, dispute);

        setPagination((paginationState) => ({
          ...paginationState,
          total: existed ? paginationState.total : paginationState.total + 1,
        }));

        return next;
      });
    };

    EVENT_NAMES.forEach((eventName) => socket.on(eventName, handleEvent));

    return () => {
      EVENT_NAMES.forEach((eventName) => socket.off(eventName, handleEvent));
    };
  }, [connectCount, socketRef, user?.uid]);

  const totalUnread = useMemo(
    () =>
      disputes.reduce(
        (sum, dispute) => sum + (dispute?.unreadCounts?.[user?.uid] || 0),
        0,
      ),
    [disputes, user?.uid],
  );

  const loadMore = useCallback(() => {
    if (loadingMore || loading || pagination.page >= pagination.totalPages) return;
    fetchDisputes({
      page: pagination.page + 1,
      append: true,
      status: statusFilter,
    });
  }, [fetchDisputes, loading, loadingMore, pagination.page, pagination.totalPages, statusFilter]);

  return {
    disputes,
    loading,
    loadingMore,
    error,
    pagination,
    statusFilter,
    setStatusFilter,
    refreshDisputes: () => fetchDisputes({ page: 1, append: false, status: statusFilter }),
    loadMore,
    totalUnread,
  };
};

export const useDisputeThread = (disputeIdentifier) => {
  const { user } = useAuth();
  const { socketRef, connectCount, connectionStatus } = useSocketContext();
  const [dispute, setDispute] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [sending, setSending] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const joinedRoomRef = useRef(null);

  const resolvedDisputeId = dispute?._id || disputeIdentifier;

  const loadThread = useCallback(
    async ({ nextPage = 1, append = false } = {}) => {
      if (!disputeIdentifier) return;

      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      setError(null);

      try {
        const disputeResponse = await getDispute(disputeIdentifier);
        const nextDispute = disputeResponse?.data?.dispute || disputeResponse?.dispute || disputeResponse?.data || disputeResponse;

        if (!nextDispute?._id && !nextDispute?.disputeId) {
          throw new Error("Dispute not found");
        }

        setDispute(nextDispute);

        const messagesResponse = await getDisputeMessages(disputeIdentifier, nextPage, 30);
        const nextMessages = messagesResponse?.data?.messages || messagesResponse?.messages || [];
        const nextPagination = messagesResponse?.data?.pagination || messagesResponse?.pagination || {
          page: nextPage,
          totalPages: 1,
        };

        setMessages((current) => {
          if (!append || nextPage === 1) return sortMessagesAscending(nextMessages);
          return mergeMessages(current, nextMessages);
        });

        setPage(nextPagination.page || nextPage);
        setHasMore((nextPagination.page || nextPage) < (nextPagination.totalPages || nextPage));
      } catch (fetchError) {
        setError(fetchError.message || "Failed to load dispute thread");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [disputeIdentifier],
  );

  useEffect(() => {
    if (!disputeIdentifier) return;
    setDispute(null);
    setMessages([]);
    setPage(1);
    setHasMore(true);
    loadThread({ nextPage: 1, append: false });
  }, [disputeIdentifier, loadThread]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !resolvedDisputeId) return;

    const joinRoom = () => {
      if (joinedRoomRef.current && joinedRoomRef.current !== resolvedDisputeId) {
        socket.emit("leave:dispute", { disputeId: joinedRoomRef.current });
      }

      socket.emit("join:dispute", { disputeId: resolvedDisputeId });
      joinedRoomRef.current = resolvedDisputeId;
    };

    joinRoom();

    const handleEvent = (payload) => {
      const nextDispute = extractDispute(payload);
      if (nextDispute && (nextDispute._id === resolvedDisputeId || nextDispute.disputeId === resolvedDisputeId)) {
        setDispute((current) => ({ ...current, ...nextDispute }));
      }

      const nextMessage = extractMessage(payload);
      if (nextMessage) {
        setMessages((current) => mergeMessages(current, [nextMessage]));
      }
    };

    EVENT_NAMES.forEach((eventName) => socket.on(eventName, handleEvent));

    return () => {
      EVENT_NAMES.forEach((eventName) => socket.off(eventName, handleEvent));

      if (joinedRoomRef.current) {
        socket.emit("leave:dispute", { disputeId: joinedRoomRef.current });
        joinedRoomRef.current = null;
      }
    };
  }, [connectCount, resolvedDisputeId, socketRef]);

  const sendMessage = useCallback(
    async (text) => {
      const trimmed = text?.trim();
      if (!trimmed || !resolvedDisputeId) {
        throw new Error("Message is required");
      }

      if (dispute?.status === DISPUTE_STATUS.CLOSED) {
        throw new Error("This dispute is closed");
      }

      setSending(true);
      setError(null);

      const tempId = `temp-${Date.now()}`;
      const optimisticMessage = {
        _id: tempId,
        disputeId: resolvedDisputeId,
        sender: user?.uid || "customer",
        senderRole: SENDER_ROLE.CUSTOMER,
        senderName: user?.displayName || user?.email || "You",
        senderPhoto: user?.photoURL || null,
        message: trimmed,
        isSystemMessage: false,
        systemAction: null,
        readBy: [],
        attachments: [],
        isDeleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pending: true,
      };

      setMessages((current) => mergeMessages(current, [optimisticMessage]));

      try {
        const response = await sendDisputeMessage(resolvedDisputeId, trimmed);
        const nextMessage = response?.data?.message || response?.message;
        const nextDispute = response?.data?.dispute || response?.dispute;

        if (nextMessage) {
          setMessages((current) => mergeMessages(current.filter((m) => m._id !== tempId), [nextMessage]));
        } else {
          // Fallback: clear pending flag on the temp message
          setMessages((current) =>
            current.map((message) =>
              message._id === tempId ? { ...message, pending: false } : message,
            ),
          );
        }

        if (nextDispute) {
          setDispute((current) => ({ ...current, ...nextDispute }));
        }

        return response;
      } catch (sendError) {
        setMessages((current) =>
          current.map((message) =>
            message._id === tempId
              ? {
                  ...message,
                  pending: false,
                  failed: true,
                  errorMessage: sendError.message || "Failed to send message",
                }
              : message,
          ),
        );
        setError(sendError.message || "Failed to send message");
        throw sendError;
      } finally {
        setSending(false);
      }
    },
    [dispute?.status, resolvedDisputeId, user?.displayName, user?.email, user?.photoURL, user?.uid],
  );

  const retryMessage = useCallback(
    (message) => {
      if (!message?.message) return Promise.reject(new Error("Message missing"));
      setMessages((current) => current.filter((item) => item._id !== message._id));
      return sendMessage(message.message);
    },
    [sendMessage],
  );

  const confirmResolvedAction = useCallback(async () => {
    if (!resolvedDisputeId) throw new Error("Dispute not found");
    setActionLoading("confirm");
    try {
      const response = await confirmDisputeResolved(resolvedDisputeId);
      const nextDispute = response?.data?.dispute || response?.dispute;
      const systemMessage = response?.data?.systemMessage || response?.systemMessage;
      if (nextDispute) setDispute((current) => ({ ...current, ...nextDispute }));
      if (systemMessage) setMessages((current) => mergeMessages(current, [systemMessage]));
      return response;
    } finally {
      setActionLoading(null);
    }
  }, [resolvedDisputeId]);

  const reopenAction = useCallback(async () => {
    if (!resolvedDisputeId) throw new Error("Dispute not found");
    setActionLoading("reopen");
    try {
      const response = await reopenDispute(resolvedDisputeId);
      const nextDispute = response?.data?.dispute || response?.dispute;
      const systemMessage = response?.data?.systemMessage || response?.systemMessage;
      if (nextDispute) setDispute((current) => ({ ...current, ...nextDispute }));
      if (systemMessage) setMessages((current) => mergeMessages(current, [systemMessage]));
      return response;
    } finally {
      setActionLoading(null);
    }
  }, [resolvedDisputeId]);

  const canSend = dispute && ![DISPUTE_STATUS.CLOSED, DISPUTE_STATUS.RESOLVED_PENDING_CONFIRMATION].includes(dispute.status);

  return {
    dispute,
    messages,
    loading,
    loadingMore,
    error,
    hasMore,
    page,
    sending,
    actionLoading,
    connectionStatus,
    loadMoreMessages: () => loadThread({ nextPage: page + 1, append: true }),
    refreshThread: () => loadThread({ nextPage: 1, append: false }),
    sendMessage,
    retryMessage,
    confirmResolvedAction,
    reopenAction,
    canSend,
  };
};

export const useCreateDispute = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      return await createDispute(payload);
    } catch (submitError) {
      setError(submitError.message || "Failed to create dispute");
      throw submitError;
    } finally {
      setLoading(false);
    }
  }, []);

  return { submit, loading, error };
};