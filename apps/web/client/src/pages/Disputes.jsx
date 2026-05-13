import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { formatDistanceToNow } from "date-fns";
import { FiArrowLeft, FiInbox, FiMessageSquare, FiRefreshCcw } from "react-icons/fi";
import { IoAlertCircleOutline, IoCheckmarkDoneOutline } from "react-icons/io5";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import { useDisputeThread, useMyDisputes } from "../hooks/useDisputes";
import { useSEO } from "../hooks/useSEO";
import { useSocketContext } from "../context/SocketContext";
import {
  DISPUTE_CATEGORY,
  DISPUTE_PRIORITY,
  DISPUTE_STATUS,
  SENDER_ROLE,
  SYSTEM_ACTION,
} from "@listnrent/shared/constants";

void motion;

const statusMeta = {
  [DISPUTE_STATUS.OPEN]: {
    label: "Open",
    tone: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
    icon: <FiInbox size={14} />,
  },
  [DISPUTE_STATUS.IN_PROGRESS]: {
    label: "In Progress",
    tone: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    icon: <FiMessageSquare size={14} />,
  },
  [DISPUTE_STATUS.WAITING_FOR_USER]: {
    label: "Waiting on You",
    tone: "bg-violet-50 text-violet-700 border-violet-200",
    dot: "bg-violet-500",
    icon: <IoAlertCircleOutline size={14} />,
  },
  [DISPUTE_STATUS.RESOLVED_PENDING_CONFIRMATION]: {
    label: "Resolved - Confirm?",
    tone: "bg-orange-50 text-orange-700 border-orange-200",
    dot: "bg-orange-500",
    icon: <IoCheckmarkDoneOutline size={14} />,
  },
  [DISPUTE_STATUS.REOPENED]: {
    label: "Reopened",
    tone: "bg-rose-50 text-rose-700 border-rose-200",
    dot: "bg-rose-500",
    icon: <IoAlertCircleOutline size={14} />,
  },
  [DISPUTE_STATUS.CLOSED]: {
    label: "Closed",
    tone: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    icon: <IoCheckmarkDoneOutline size={14} />,
  },
};

const priorityLabel = {
  [DISPUTE_PRIORITY.LOW]: "Low",
  [DISPUTE_PRIORITY.MEDIUM]: "Medium",
  [DISPUTE_PRIORITY.HIGH]: "High",
  [DISPUTE_PRIORITY.URGENT]: "Urgent",
};

const categoryLabel = {
  [DISPUTE_CATEGORY.DELIVERY_ISSUE]: "Delivery issue",
  [DISPUTE_CATEGORY.PAYMENT_ISSUE]: "Payment issue",
  [DISPUTE_CATEGORY.ITEM_DAMAGED]: "Item damaged",
  [DISPUTE_CATEGORY.ITEM_NOT_AS_DESCRIBED]: "Not as described",
  [DISPUTE_CATEGORY.REFUND_REQUEST]: "Refund request",
  [DISPUTE_CATEGORY.CANCELLATION]: "Cancellation",
  [DISPUTE_CATEGORY.OTHER]: "Other",
};

const getMessageTime = (date) => {
  if (!date) return "Just now";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Just now";
  return formatDistanceToNow(parsed, { addSuffix: true });
};

const formatTicketId = (dispute) => dispute?.disputeId || dispute?._id || "Ticket";

const DisputeBadge = ({ status }) => {
  const meta = statusMeta[status] || statusMeta[DISPUTE_STATUS.OPEN];

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${meta.tone}`}>
      <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
      <span className="flex items-center gap-1">{meta.icon}{meta.label}</span>
    </span>
  );
};

const SectionSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3].map((item) => (
      <div key={item} className="rounded-3xlrder border-[#E8E0D5] bg-white p-4 animate-pulse">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="h-3 w-24 rounded-full bg-[#F0EAE0]" />
            <div className="h-5 w-3/4 rounded-full bg-[#F0EAE0]" />
            <div className="h-4 w-full rounded-full bg-[#F0EAE0]" />
            <div className="h-4 w-1/2 rounded-full bg-[#F0EAE0]" />
          </div>
          <div className="h-8 w-20 rounded-full bg-[#F0EAE0]" />
        </div>
      </div>
    ))}
  </div>
);

const EmptyState = ({ onAction }) => (
  <div className="rounded-[28px] border border-[#E8E0D5] bg-white px-6 py-14 text-center shadow-[0_14px_36px_rgba(0,0,0,0.04)]">
    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#004D40]/8 text-[#004D40]">
      <FiInbox size={24} />
    </div>
    <h3 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">No disputes yet</h3>
    <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#6B645A]">
      If something with a booking feels off, open the order details and start a support thread. We’ll keep the process calm and traceable.
    </p>
    <button
      type="button"
      onClick={onAction}
      className="mt-6 rounded-full bg-[#004D40] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(0,77,64,0.22)] transition-all hover:bg-[#003830]"
    >
      Go to Orders
    </button>
  </div>
);

const DisputeCard = ({ dispute, onOpen }) => {
  const unreadCount = dispute?.unreadCounts?.[dispute?.viewerUid] || 0;

  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={onOpen}
      className="group w-full rounded-[28px] border border-[#E8E0D5] bg-white p-4 text-left shadow-[0_10px_30px_rgba(0,0,0,0.04)] transition-all hover:border-[#D4AF37]/50 hover:shadow-[0_18px_42px_rgba(0,0,0,0.08)] sm:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <DisputeBadge status={dispute.status} />
            <span className="rounded-full border border-[#E8E0D5] bg-[#FAF7F2] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#7D6B41]">
              {categoryLabel[dispute.category] || dispute.category || "Other"}
            </span>
            {dispute.priority && (
              <span className="rounded-full border border-[#E8E0D5] bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#7D6B41]">
                {priorityLabel[dispute.priority] || dispute.priority}
              </span>
            )}
          </div>

          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#9E9E7A]">
              {formatTicketId(dispute)}
            </p>
            <h3 className="mt-1 truncate text-lg font-bold tracking-tight text-[#1A1A1A]">
              {dispute.subject}
            </h3>
          </div>

          <p className="line-clamp-2 text-sm leading-relaxed text-[#5D564C]">
            {dispute.lastMessage || "We’re waiting for the next update in this thread."}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-[#8F8575]">
            <span>{getMessageTime(dispute.lastMessageAt || dispute.updatedAt || dispute.createdAt)}</span>
            <span>•</span>
            <span>{dispute.reopenCount > 0 ? `${dispute.reopenCount} reopen${dispute.reopenCount > 1 ? "s" : ""}` : "No reopen history"}</span>
          </div>
        </div>

        <div className="flex flex-row items-center gap-3 sm:flex-col sm:items-end sm:text-right">
          {unreadCount > 0 && (
            <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-[#004D40] px-2.5 py-1 text-xs font-bold text-white shadow-[0_8px_16px_rgba(0,77,64,0.2)]">
              {unreadCount}
            </span>
          )}
          <span className="text-sm font-semibold text-[#004D40] transition-colors group-hover:text-[#003830]">
            View thread →
          </span>
        </div>
      </div>
    </motion.button>
  );
};

const SystemEvent = ({ message }) => {
  const text = (() => {
    switch (message.systemAction) {
      case SYSTEM_ACTION.DISPUTE_OPENED:
        return "Dispute opened";
      case SYSTEM_ACTION.STATUS_CHANGED:
        return "Status updated";
      case SYSTEM_ACTION.MARKED_RESOLVED:
        return "Support marked this as resolved";
      case SYSTEM_ACTION.USER_CONFIRMED_RESOLVED:
        return "You confirmed the issue is resolved";
      case SYSTEM_ACTION.USER_REOPENED:
        return "You reopened the dispute";
      case SYSTEM_ACTION.ASSIGNED:
        return "Assigned to support";
      case SYSTEM_ACTION.PRIORITY_CHANGED:
        return "Priority changed";
      case SYSTEM_ACTION.ESCALATED:
        return "Escalated";
      default:
        return "Support activity";
    }
  })();

  return (
    <div className="my-4 flex justify-center">
      <div className="max-w-[88%] rounded-[22px] border border-[#E8E0D5] bg-[#FBF8F1] px-4 py-3 text-center text-sm text-[#5D564C] shadow-[0_8px_20px_rgba(0,0,0,0.03)]">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#9E9E7A]">{text}</p>
        <p className="mt-1 leading-relaxed">{message.message}</p>
        <p className="mt-2 text-[11px] text-[#A49B8D]">{getMessageTime(message.createdAt)}</p>
      </div>
    </div>
  );
};

const ChatBubble = ({ message, isMine, onRetry }) => {
  const bubbleBase = isMine
    ? "ml-auto bg-[#004D40] text-white shadow-[0_12px_26px_rgba(0,77,64,0.18)]"
    : "mr-auto bg-white text-[#1A1A1A] border border-[#E8E0D5] shadow-[0_12px_26px_rgba(0,0,0,0.04)]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className={`max-w-[82%] ${message.failed ? "opacity-90" : ""}`}
    >
      <div className={`rounded-3xl px-4 py-3 ${bubbleBase}`}>
        {!isMine && (
          <p className="mb-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#7D6B41]">
            {message.senderName || (message.senderRole === SENDER_ROLE.SYSTEM ? "System" : "Support")}
          </p>
        )}
        <p className="whitespace-pre-wrap wrap-break-word text-[15px] leading-relaxed">{message.message}</p>
        <div className={`mt-2 flex items-center gap-2 text-[11px] ${isMine ? "text-white/70" : "text-[#A49B8D]"}`}>
          <span>{getMessageTime(message.createdAt)}</span>
          {message.pending && <span>Sending…</span>}
          {message.failed && (
            <button type="button" onClick={() => onRetry?.(message)} className="font-semibold text-[#C8622A] underline underline-offset-2">
              Try again
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const MessageComposer = ({ value, onChange, onSubmit, disabled, sending, placeholder }) => {
  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="sticky bottom-0 z-10 mt-4 border-t border-[#E8E0D5] bg-[linear-gradient(180deg,rgba(252,250,246,0.8)_0%,#FCFAF6_20%,#FCFAF6_100%)] px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4 backdrop-blur-md sm:px-5">
      <div className="rounded-[26px] border border-[#E8E0D5] bg-white p-3 shadow-[0_14px_34px_rgba(0,0,0,0.05)]">
        <textarea
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          rows={3}
          className="w-full resize-none rounded-2xl border border-[#E8E0D5] bg-[#FAF7F2] px-4 py-3 text-sm text-[#1A1A1A] outline-none transition-all placeholder:text-[#A39A8D] focus:border-[#004D40] focus:ring-4 focus:ring-[#004D40]/8 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-[11px] text-[#8F8575]">
            Press <span className="font-semibold">Enter</span> to send, <span className="font-semibold">Shift + Enter</span> for a new line.
          </p>
          <button
            type="button"
            onClick={onSubmit}
            disabled={disabled || sending || !value.trim()}
            className="rounded-full bg-[#004D40] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(0,77,64,0.2)] transition-all hover:bg-[#003830] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {sending ? "Sending…" : "Send message"}
          </button>
        </div>
      </div>
    </div>
  );
};

const ResolutionBanner = ({ onConfirm, onReopen, loading }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="sticky bottom-[calc(env(safe-area-inset-bottom)+6.75rem)] z-9 mx-4 mb-4 rounded-[28px] border border-[#F0D7AF] bg-[linear-gradient(180deg,#FFF9EF_0%,#FFF4DF_100%)] p-4 shadow-[0_16px_38px_rgba(200,98,42,0.12)] sm:mx-5"
  >
    <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#A66A37]">Resolution needed</p>
    <h3 className="mt-1 text-lg font-bold text-[#1A1A1A]">Support has marked your issue as resolved</h3>
    <p className="mt-2 text-sm leading-relaxed text-[#6B645A]">
      Please confirm if everything is now okay. If not, you can reopen the conversation and continue from here.
    </p>

    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
      <button
        type="button"
        onClick={onConfirm}
        disabled={loading}
        className="flex-1 rounded-2xl bg-[#004D40] px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-[#003830] disabled:cursor-not-allowed disabled:opacity-70"
      >
        Yes, close dispute
      </button>
      <button
        type="button"
        onClick={onReopen}
        disabled={loading}
        className="flex-1 rounded-2xl border border-[#E8E0D5] bg-white px-4 py-3 text-sm font-semibold text-[#1A1A1A] transition-all hover:border-[#D4AF37] disabled:cursor-not-allowed disabled:opacity-70"
      >
        No, continue conversation
      </button>
    </div>
  </motion.div>
);

const ThreadHeader = ({ dispute, onBack }) => {
  if (!dispute) return null;

  return (
    <div className="rounded-[30px] border border-[#E8E0D5] bg-white p-5 shadow-[0_16px_44px_rgba(0,0,0,0.05)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <button onClick={onBack} className="inline-flex items-center gap-2 text-sm font-semibold text-[#004D40] transition-colors hover:text-[#003830]">
            <FiArrowLeft size={16} /> Back to disputes
          </button>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#9E9E7A]">{formatTicketId(dispute)}</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1A1A1A] sm:text-3xl">{dispute.subject}</h1>
            <p className="mt-2 text-sm leading-relaxed text-[#6B645A]">{dispute.lastMessage || "This conversation keeps a full audit trail of every support update."}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <DisputeBadge status={dispute.status} />
          {dispute.priority && (
            <span className="rounded-full border border-[#E8E0D5] bg-[#FAF7F2] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#7D6B41]">
              {priorityLabel[dispute.priority] || dispute.priority}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const ThreadSummary = ({ dispute }) => {
  if (!dispute) return null;

  return (
    <div className="rounded-[30px] border border-[#E8E0D5] bg-white p-5 shadow-[0_16px_44px_rgba(0,0,0,0.05)]">
      <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#9E9E7A]">Ticket summary</p>
      <div className="mt-4 space-y-4 text-sm text-[#5D564C]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9E9E7A]">Category</p>
          <p className="mt-1 font-semibold text-[#1A1A1A]">{categoryLabel[dispute.category] || dispute.category || "Other"}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9E9E7A]">Raised on</p>
          <p className="mt-1 font-semibold text-[#1A1A1A]">{getMessageTime(dispute.createdAt)}</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9E9E7A]">Last activity</p>
          <p className="mt-1 font-semibold text-[#1A1A1A]">{getMessageTime(dispute.lastMessageAt || dispute.updatedAt || dispute.createdAt)}</p>
        </div>
        <div className="rounded-2xl bg-[#FAF7F2] p-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9E9E7A]">Thread notes</p>
          <ul className="mt-2 space-y-2 text-sm leading-relaxed text-[#6B645A]">
            <li>Customer messages are right-aligned.</li>
            <li>Support messages stay clean and professional.</li>
            <li>System events appear as centered timeline cards.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const DisputesListView = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { disputes, loading, loadingMore, error, pagination, statusFilter, setStatusFilter, loadMore, refreshDisputes } = useMyDisputes();

  const counts = useMemo(() => {
    return disputes.reduce(
      (accumulator, dispute) => {
        accumulator.total += 1;
        if (dispute.status === DISPUTE_STATUS.OPEN) accumulator.open += 1;
        if (dispute.status === DISPUTE_STATUS.WAITING_FOR_USER) accumulator.waiting += 1;
        if (dispute.status === DISPUTE_STATUS.RESOLVED_PENDING_CONFIRMATION) accumulator.resolved += 1;
        if (dispute.status === DISPUTE_STATUS.CLOSED) accumulator.closed += 1;
        accumulator.unread += dispute?.unreadCounts?.[user?.uid] || 0;
        return accumulator;
      },
      { total: 0, open: 0, waiting: 0, resolved: 0, closed: 0, unread: 0 },
    );
  }, [disputes, user?.uid]);

  const filters = [
    { label: "All", value: "" },
    { label: "Open", value: DISPUTE_STATUS.OPEN },
    { label: "Waiting", value: DISPUTE_STATUS.WAITING_FOR_USER },
    { label: "Resolved", value: DISPUTE_STATUS.RESOLVED_PENDING_CONFIRMATION },
    { label: "Closed", value: DISPUTE_STATUS.CLOSED },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-4xl border border-[#E8E0D5] bg-[linear-gradient(135deg,#00342B_0%,#004D40_45%,#005A4A_100%)] p-5 text-white shadow-[0_20px_56px_rgba(0,52,43,0.2)] sm:p-6"
      >
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#D4AF37]/90">Support center</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">My Disputes</h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/72">
              A calm, private support space for bookings that need attention. Track every reply, status change, and resolution in one place.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Total", value: counts.total },
              { label: "Open", value: counts.open },
              { label: "Waiting", value: counts.waiting },
              { label: "Unread", value: counts.unread },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3 backdrop-blur-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55">{item.label}</p>
                <p className="mt-1 text-2xl font-bold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="flex flex-wrap items-center gap-2">
        {filters.map((filter) => (
          <button
            key={filter.label}
            type="button"
            onClick={() => setStatusFilter(filter.value)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${statusFilter === filter.value ? "bg-[#004D40] text-white shadow-[0_10px_20px_rgba(0,77,64,0.16)]" : "border border-[#E8E0D5] bg-white text-[#6B645A] hover:border-[#D4AF37] hover:text-[#1A1A1A]"}`}
          >
            {filter.label}
          </button>
        ))}

        <button
          type="button"
          onClick={refreshDisputes}
          className="ml-auto inline-flex items-center gap-2 rounded-full border border-[#E8E0D5] bg-white px-4 py-2 text-sm font-semibold text-[#6B645A] transition-all hover:border-[#D4AF37] hover:text-[#1A1A1A]"
        >
          <FiRefreshCcw size={14} /> Refresh
        </button>
      </div>

      {loading ? (
        <SectionSkeleton />
      ) : error ? (
        <div className="rounded-[28px] border border-red-200 bg-red-50 px-5 py-6 text-red-700">
          <p className="font-semibold">We couldn’t load your disputes.</p>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      ) : disputes.length === 0 ? (
        <EmptyState onAction={() => navigate("/dashboard?tab=orders")} />
      ) : (
        <div className="space-y-4">
          <AnimatePresence initial={false} mode="popLayout">
            {disputes.map((dispute) => (
              <motion.div
                key={dispute._id || dispute.disputeId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              >
                <DisputeCard
                  dispute={{ ...dispute, viewerUid: user?.uid }}
                  onOpen={() => navigate(`/disputes/${dispute._id || dispute.disputeId}`)}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {pagination.totalPages > pagination.page && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="rounded-full border border-[#E8E0D5] bg-white px-5 py-3 text-sm font-semibold text-[#004D40] transition-all hover:border-[#D4AF37] hover:text-[#003830] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loadingMore ? "Loading more…" : "Load more disputes"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const ThreadComposerState = ({ dispute, connectionStatus, sending, onConfirm, onReopen, actionLoading, canSend, value, setValue, send }) => {
  const placeholder = (() => {
    if (dispute?.status === DISPUTE_STATUS.CLOSED) return "This dispute is closed.";
    if (dispute?.status === DISPUTE_STATUS.RESOLVED_PENDING_CONFIRMATION) return "Please confirm or reopen the dispute above.";
    return "Write a calm, clear update…";
  })();

  return (
    <>
      {dispute?.status === DISPUTE_STATUS.RESOLVED_PENDING_CONFIRMATION && (
        <ResolutionBanner
          onConfirm={onConfirm}
          onReopen={onReopen}
          loading={actionLoading}
        />
      )}

      {dispute?.status === DISPUTE_STATUS.CLOSED && (
        <div className="sticky bottom-[calc(env(safe-area-inset-bottom)+6.75rem)] z-9 x-4 mb-4 rounded-[28px] border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 shadow-[0_16px_38px_rgba(16,185,129,0.12)] sm:mx-5">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-emerald-700">Closed</p>
          <p className="mt-1 text-sm leading-relaxed">This dispute is now closed. You can still view the complete timeline for reference.</p>
        </div>
      )}

      <MessageComposer
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onSubmit={send}
        disabled={!canSend || connectionStatus === "error"}
        sending={sending}
        placeholder={placeholder}
      />
    </>
  );
};

const DisputeThreadView = ({ disputeIdentifier }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { connectionStatus } = useSocketContext();
  const {
    dispute,
    messages,
    loading,
    loadingMore,
    error,
    hasMore,
    sending,
    actionLoading,
    loadMoreMessages,
    sendMessage,
    retryMessage,
    confirmResolvedAction,
    reopenAction,
    canSend,
  } = useDisputeThread(disputeIdentifier);
  const [composerValue, setComposerValue] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, dispute?.status]);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [navigate, user]);

  const handleSend = async () => {
    if (!composerValue.trim()) return;
    const text = composerValue;
    setComposerValue("");
    try {
      await sendMessage(text);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 50);
    } catch (sendError) {
      setComposerValue(text);
      toast.error(sendError.message || "Could not send your message right now.");
    }
  };

  const handleRetry = async (message) => {
    try {
      await retryMessage(message);
    } catch (retryError) {
      toast.error(retryError.message || "Retry failed.");
    }
  };

  if (loading && !dispute) {
    return (
      <div className="space-y-6">
        <div className="h-44 animate-pulse rounded-4xl border border-[#E8E0D5] bg-white" />
        <div className="grid gap-6 lg:grid-cols-[1.45fr_0.55fr]">
          <div className="h-140 animate-pulse rounded-4xl border border-[#E8E0D5] bg-white" />
          <div className="h-80 animate-pulse rounded-4xl border border-[#E8E0D5] bg-white" />
        </div>
      </div>
    );
  }

  if (error && !dispute) {
    return (
      <div className="rounded-[28px] border border-red-200 bg-red-50 px-5 py-6 text-red-700">
        <p className="font-semibold">We couldn’t load this dispute.</p>
        <p className="mt-1 text-sm">{error}</p>
        <button
          type="button"
          onClick={() => navigate("/disputes")}
          className="mt-4 rounded-full bg-[#004D40] px-4 py-2.5 text-sm font-semibold text-white"
        >
          Back to disputes
        </button>
      </div>
    );
  }

  const sortedMessages = [...messages];

  return (
    <div className="space-y-6">
      <ThreadHeader dispute={dispute} onBack={() => navigate("/disputes")} />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="rounded-4xl border border-[#E8E0D5] bg-white shadow-[0_18px_52px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between gap-3 border-b border-[#E8E0D5] px-5 py-4">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#9E9E7A]">Conversation</p>
              <p className="mt-1 text-sm text-[#6B645A]">Real-time updates, calm support, and an auditable timeline.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/disputes")}
              className="rounded-full border border-[#E8E0D5] bg-[#FAF7F2] px-4 py-2 text-sm font-semibold text-[#004D40] transition-all hover:border-[#D4AF37]"
            >
              List view
            </button>
          </div>

          <div className="max-h-[68dvh] overflow-y-auto px-4 py-4 sm:px-5">
            {hasMore && (
              <div className="mb-4 flex justify-center">
                <button
                  type="button"
                  onClick={loadMoreMessages}
                  disabled={loadingMore}
                  className="rounded-full border border-[#E8E0D5] bg-[#FAF7F2] px-4 py-2 text-xs font-semibold text-[#6B645A] transition-all hover:border-[#D4AF37] disabled:opacity-70"
                >
                  {loadingMore ? "Loading earlier messages…" : "Load earlier messages"}
                </button>
              </div>
            )}

            <div className="space-y-1">
              {sortedMessages.length === 0 && !loading ? (
                <div className="py-16 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#004D40]/8 text-[#004D40]">
                    <FiMessageSquare size={24} />
                  </div>
                  <p className="text-lg font-semibold text-[#1A1A1A]">No messages yet</p>
                  <p className="mx-auto mt-2 max-w-md text-sm text-[#6B645A]">Once support responds, the conversation will appear here with a full support timeline.</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {sortedMessages.map((message) => {
                    if (message.isSystemMessage || message.senderRole === SENDER_ROLE.SYSTEM) {
                      return <SystemEvent key={message._id} message={message} />;
                    }

                    const isMine = message.senderRole === SENDER_ROLE.CUSTOMER || message.sender === user?.uid;
                    return (
                      <div key={message._id} className={`flex ${isMine ? "justify-end" : "justify-start"} py-1.5`}>
                        <ChatBubble message={message} isMine={isMine} onRetry={handleRetry} />
                      </div>
                    );
                  })}
                </AnimatePresence>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <ThreadComposerState
            dispute={dispute}
            connectionStatus={connectionStatus}
            sending={sending}
            onConfirm={confirmResolvedAction}
            onReopen={reopenAction}
            actionLoading={actionLoading}
            canSend={canSend}
            value={composerValue}
            setValue={setComposerValue}
            send={handleSend}
          />
        </div>

        <div className="space-y-6">
          <ThreadSummary dispute={dispute} />

          <div className="rounded-[30px] border border-[#E8E0D5] bg-[linear-gradient(180deg,#FFFFFF_0%,#FBF8F1_100%)] p-5 shadow-[0_16px_44px_rgba(0,0,0,0.05)]">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#9E9E7A]">Connection</p>
            <div className="mt-4 space-y-3 text-sm text-[#6B645A]">
              <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 border border-[#E8E0D5]">
                <span>Realtime status</span>
                <span className={`font-semibold ${connectionStatus === "connected" ? "text-emerald-600" : "text-amber-600"}`}>
                  {connectionStatus}
                </span>
              </div>
              <div className="rounded-2xl bg-white px-4 py-3 border border-[#E8E0D5]">
                <p className="font-semibold text-[#1A1A1A]">Calm, clear, consistent</p>
                <p className="mt-1 text-sm leading-relaxed">We keep this thread focused on the booking, the evidence, and the next helpful step.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DisputesPage = () => {
  const { disputeId } = useParams();

  useSEO({
    title: disputeId ? "Dispute Thread" : "My Disputes",
    description: "Track and manage your support disputes on ListnRent.",
    canonicalPath: disputeId ? `/disputes/${disputeId}` : "/disputes",
    noIndex: true,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen bg-[#FAF7F2] pt-20 pb-12"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {disputeId ? <DisputeThreadView disputeIdentifier={disputeId} /> : <DisputesListView />}
      </div>
    </motion.div>
  );
};

export default DisputesPage;