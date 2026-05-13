import React from 'react'
import PageHeader from '../../shared/PageHeader'
import { useAdminDisputes } from '../../../hooks/useAdminDisputes'
import { useAdminAuth } from '../../../hooks/useAdminAuth'
import {
  DISPUTE_CATEGORY,
  DISPUTE_PRIORITY,
  DISPUTE_STATUS,
  DISPUTE_TYPE,
  SENDER_ROLE,
} from '@listnrent/shared/constants'

const STATUS_META = {
  [DISPUTE_STATUS.OPEN]: 'bg-blue-100 text-blue-800 border-blue-200',
  [DISPUTE_STATUS.IN_PROGRESS]: 'bg-amber-100 text-amber-800 border-amber-200',
  [DISPUTE_STATUS.WAITING_FOR_USER]: 'bg-violet-100 text-violet-800 border-violet-200',
  [DISPUTE_STATUS.RESOLVED_PENDING_CONFIRMATION]: 'bg-orange-100 text-orange-800 border-orange-200',
  [DISPUTE_STATUS.REOPENED]: 'bg-rose-100 text-rose-800 border-rose-200',
  [DISPUTE_STATUS.CLOSED]: 'bg-emerald-100 text-emerald-800 border-emerald-200',
}

const PRIORITY_META = {
  [DISPUTE_PRIORITY.LOW]: 'bg-slate-100 text-slate-700',
  [DISPUTE_PRIORITY.MEDIUM]: 'bg-blue-100 text-blue-800',
  [DISPUTE_PRIORITY.HIGH]: 'bg-orange-100 text-orange-800',
  [DISPUTE_PRIORITY.URGENT]: 'bg-red-100 text-red-800',
}

const categoryOptions = Object.values(DISPUTE_CATEGORY)
const statusOptions = Object.values(DISPUTE_STATUS)
const priorityOptions = Object.values(DISPUTE_PRIORITY)

const formatDateTime = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Recently'
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const formatAgo = (value) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'now'

  const diffSeconds = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000))
  const units = [
    ['d', 86400],
    ['h', 3600],
    ['m', 60],
    ['s', 1],
  ]
  const [label, amount] = units.find(([, seconds]) => diffSeconds >= seconds) || ['s', 1]
  return `${Math.floor(diffSeconds / amount)}${label} ago`
}

const getParticipantLabel = (message, adminId) => {
  if (message?.isSystemMessage) return 'System'

  if (message?.senderRole === SENDER_ROLE.CUSTOMER) {
    return message?.senderName || 'Customer'
  }

  if (String(message?.sender || '') === String(adminId || '')) {
    return 'You'
  }

  return message?.senderName || 'Support'
}

const formatMoney = (value) => {
  if (value === null || value === undefined || value === '') return '—'
  const amount = Number(value)
  if (Number.isNaN(amount)) return '—'
  return `₹${amount.toLocaleString('en-IN')}`
}

const DisputeContextPanel = ({ dispute }) => {
  if (!dispute) return null

  const context = dispute.context || {}
  const display = context.display || {}
  const booking = context.booking || null
  const listing = context.listing || null
  const kind = context.kind || dispute.disputeType

  return (
    <div className="rounded-2xl border border-slate-200 bg-linear-to-br from-white to-slate-50 p-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-teal-600">
            {display.badge || (kind === DISPUTE_TYPE.LISTING_SUPPORT ? 'Listing support' : kind === DISPUTE_TYPE.GENERAL_SUPPORT ? 'General support' : 'Booking dispute')}
          </p>
          <h3 className="text-lg font-bold text-slate-900">
            {display.title || booking?.listingTitle || listing?.listingTitle || dispute.subject}
          </h3>
          <p className="max-w-3xl text-sm text-slate-600">
            {display.subtitle || 'Support context attached to the current thread.'}
          </p>
        </div>

        {display.image ? (
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
            <img src={display.image} alt="Context" className="h-full w-full object-cover" />
          </div>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kind === DISPUTE_TYPE.BOOKING_DISPUTE ? (
          <>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Booking</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{booking?.bookingId ? `#${String(booking.bookingId).slice(-8).toUpperCase()}` : '—'}</p>
              {booking?.orderReference ? <p className="mt-1 text-xs text-slate-500">Order {booking.orderReference}</p> : null}
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Rental dates</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{booking?.rentalDates?.label || '—'}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Payment</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{booking?.paymentStatus || '—'}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Amount</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{formatMoney(booking?.bookingAmount)}</p>
            </div>
          </>
        ) : kind === DISPUTE_TYPE.LISTING_SUPPORT ? (
          <>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Listing</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{listing?.listingTitle || display.title || '—'}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Category</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{listing?.category || '—'}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Pricing</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{formatMoney(listing?.pricing?.pricePerDay)}/day</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Owner</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{listing?.owner?.displayName || listing?.owner?.email || '—'}</p>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-3 sm:col-span-2 xl:col-span-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Context</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">General support request</p>
            <p className="mt-1 text-xs text-slate-500">No booking or listing context was attached.</p>
          </div>
        )}
      </div>
    </div>
  )
}

const DisputesTab = () => {
  const { admin } = useAdminAuth()
  const {
    filters,
    setFilters,
    disputes,
    listPagination,
    listLoading,
    listLoadingMore,
    listError,
    loadMoreDisputes,
    refreshDisputes,

    selectedDispute,
    selectedDisputeId,
    openDispute,

    messages,
    threadPagination,
    threadLoading,
    threadLoadingMore,
    threadSending,
    threadError,
    threadActionLoading,
    loadMoreMessages,

    sendMessage,
    retryMessage,
    setStatus,
    markResolved,
    assignDispute,

    metrics,
    staffOptions,
    statusActions,
    canAssign,
  } = useAdminDisputes()

  const [draftMessage, setDraftMessage] = React.useState('')
  const [mobileListOpen, setMobileListOpen] = React.useState(true)

  const activeCount = metrics?.activeCount || 0
  const pendingCount = metrics?.pendingCount || 0
  const unreadCount = metrics?.unreadStaffTotal || 0
  const unassignedCount = metrics?.unassignedCount || 0

  const handleSend = async (event) => {
    event.preventDefault()
    if (!draftMessage.trim()) return

    try {
      await sendMessage(draftMessage)
      setDraftMessage('')
    } catch {
      // error handled by hook state
    }
  }

  return (
    <>
      <PageHeader
        title="Support Disputes"
        subtitle="Realtime customer support queue with assignment, lifecycle control, and audit timeline"
      >
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Active Queue</p>
            <p className="mt-1 text-2xl font-black text-slate-900">{activeCount}</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-amber-700">Pending Customer</p>
            <p className="mt-1 text-2xl font-black text-amber-900">{pendingCount}</p>
          </div>
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-red-700">Unread</p>
            <p className="mt-1 text-2xl font-black text-red-900">{unreadCount}</p>
          </div>
          <div className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-violet-700">Unassigned</p>
            <p className="mt-1 text-2xl font-black text-violet-900">{unassignedCount}</p>
          </div>
        </div>
      </PageHeader>

      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-7">
          <input
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            placeholder="Search disputeId or subject"
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-teal-300"
          />

          <select
            value={filters.status}
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-300"
          >
            <option value="">All statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>
            ))}
          </select>

          <select
            value={filters.priority}
            onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value }))}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-300"
          >
            <option value="">All priorities</option>
            {priorityOptions.map((priority) => (
              <option key={priority} value={priority}>{priority}</option>
            ))}
          </select>

          <select
            value={filters.category}
            onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-300"
          >
            <option value="">All categories</option>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>{category.replaceAll('_', ' ')}</option>
            ))}
          </select>

          <select
            value={filters.assignment}
            onChange={(event) => setFilters((current) => ({ ...current, assignment: event.target.value }))}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-teal-300"
          >
            <option value="all">All assignments</option>
            <option value="assigned">Assigned</option>
            <option value="unassigned">Unassigned</option>
            <option value="assigned_to_me">Assigned to me</option>
          </select>

          <button
            type="button"
            onClick={() => setFilters((current) => ({ ...current, reopenedOnly: !current.reopenedOnly }))}
            className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
              filters.reopenedOnly
                ? 'border-rose-200 bg-rose-50 text-rose-700'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            Reopened only
          </button>

          <button
            type="button"
            onClick={refreshDisputes}
            className="rounded-xl bg-teal-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
          >
            Refresh
          </button>
        </div>
      </div>

      {listError ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {listError}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[420px,1fr]">
        <div className={`${mobileListOpen ? 'block' : 'hidden'} xl:block`}>
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Dispute Queue</h3>
                <p className="text-xs text-slate-500">{listPagination.total || disputes.length} tickets</p>
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">Realtime</p>
            </div>

            <div className="max-h-[75vh] overflow-y-auto p-2">
              {listLoading ? (
                <div className="space-y-2 p-2">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
                      <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                      <div className="mt-2 h-3 w-full animate-pulse rounded bg-slate-200" />
                    </div>
                  ))}
                </div>
              ) : disputes.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-sm font-semibold text-slate-700">No disputes in this queue</p>
                  <p className="mt-1 text-xs text-slate-500">Try changing filters or refresh the feed.</p>
                </div>
              ) : (
                disputes.map((dispute, index) => {
                  const staffUnread = Number(dispute?.unreadCounts?.staff || 0)
                  const isSelected = selectedDisputeId === dispute._id

                  return (
                    <button
                      key={dispute._id}
                      onClick={() => {
                        openDispute(dispute._id)
                        setMobileListOpen(false)
                      }}
                      className={`mb-2 w-full rounded-xl border p-3 text-left transition ${
                        isSelected
                          ? 'border-teal-300 bg-teal-50 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{dispute.disputeId}</p>
                          <h4 className="mt-1 text-sm font-bold text-slate-900 line-clamp-1">{dispute.subject || 'No subject'}</h4>
                        </div>
                        {staffUnread > 0 ? (
                          <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
                            {staffUnread}
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-2 line-clamp-2 text-xs text-slate-600">{dispute.lastMessage || 'No messages yet'}</p>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${STATUS_META[dispute.status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                          {dispute.status?.replaceAll('_', ' ')}
                        </span>
                        <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${PRIORITY_META[dispute.priority] || 'bg-slate-100 text-slate-700'}`}>
                          {dispute.priority}
                        </span>
                        {Number(dispute.reopenCount || 0) > 0 ? (
                          <span className="rounded-full bg-rose-100 px-2 py-1 text-[11px] font-semibold text-rose-700">
                            Reopened x{dispute.reopenCount}
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                        <span>{dispute?.raisedByUser?.displayName || 'Customer'}</span>
                        <span>{formatAgo(dispute.lastMessageAt)}</span>
                      </div>
                    </button>
                  )
                })
              )}

              {!listLoading && listPagination.page < listPagination.totalPages ? (
                <button
                  type="button"
                  onClick={loadMoreDisputes}
                  disabled={listLoadingMore}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {listLoadingMore ? 'Loading...' : 'Load more disputes'}
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className={`${mobileListOpen ? 'hidden' : 'block'} xl:block`}>
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            {!selectedDispute ? (
              <div className="flex min-h-[60vh] items-center justify-center p-8 text-center">
                <div>
                  <p className="text-xl font-black text-slate-900">Select a dispute</p>
                  <p className="mt-2 text-sm text-slate-500">Open any ticket from the queue to start realtime support operations.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="border-b border-slate-100 px-4 py-4 lg:px-6">
                  <div className="mb-3 flex items-center justify-between gap-3 xl:hidden">
                    <button
                      type="button"
                      onClick={() => setMobileListOpen(true)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
                    >
                      Back to queue
                    </button>
                  </div>

                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{selectedDispute.disputeId}</p>
                      <h2 className="mt-1 text-xl font-black text-slate-900">{selectedDispute.subject}</h2>
                      <p className="mt-1 text-sm text-slate-600">
                        {selectedDispute?.raisedByUser?.displayName || 'Customer'}
                        {selectedDispute?.raisedByUser?.email ? ` • ${selectedDispute.raisedByUser.email}` : ''}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${STATUS_META[selectedDispute.status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                        {selectedDispute.status?.replaceAll('_', ' ')}
                      </span>
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${PRIORITY_META[selectedDispute.priority] || 'bg-slate-100 text-slate-700'}`}>
                        {selectedDispute.priority}
                      </span>
                      {selectedDispute.category ? (
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                          {selectedDispute.category.replaceAll('_', ' ')}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-4">
                    <DisputeContextPanel dispute={selectedDispute} />
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Assignment</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {selectedDispute?.assignedTo?.displayName || 'Unassigned'}
                      </p>
                      {canAssign ? (
                        <select
                          value={selectedDispute?.assignedTo?._id || ''}
                          onChange={(event) => assignDispute(event.target.value)}
                          disabled={threadActionLoading === 'assign'}
                          className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs outline-none transition focus:border-teal-300 disabled:opacity-60"
                        >
                          <option value="">Select assignee</option>
                          {staffOptions.map((member) => (
                            <option key={member._id} value={member._id}>
                              {member.displayName} ({member.role})
                            </option>
                          ))}
                        </select>
                      ) : null}
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Lifecycle</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {statusActions.map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => setStatus(status)}
                            disabled={threadActionLoading === 'status'}
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
                          >
                            {status.replaceAll('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-emerald-700">Resolution</p>
                      <button
                        type="button"
                        onClick={markResolved}
                        disabled={
                          threadActionLoading === 'resolve' ||
                          selectedDispute.status === DISPUTE_STATUS.CLOSED ||
                          selectedDispute.status === DISPUTE_STATUS.RESOLVED_PENDING_CONFIRMATION
                        }
                        className="mt-2 w-full rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {threadActionLoading === 'resolve' ? 'Marking...' : 'Mark Resolved'}
                      </button>
                      <p className="mt-1 text-[11px] text-emerald-700">Dedicated action. Customer must confirm closure.</p>
                    </div>
                  </div>
                </div>

                {threadError ? (
                  <div className="mx-4 mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 lg:mx-6">
                    {threadError}
                  </div>
                ) : null}

                <div className="max-h-[52vh] overflow-y-auto px-4 py-4 lg:px-6">
                  {threadLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 7 }).map((_, index) => (
                        <div key={index} className="h-14 animate-pulse rounded-xl bg-slate-100" />
                      ))}
                    </div>
                  ) : (
                    <>
                      {threadPagination.page < threadPagination.totalPages ? (
                        <button
                          type="button"
                          onClick={loadMoreMessages}
                          disabled={threadLoadingMore}
                          className="mb-3 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
                        >
                          {threadLoadingMore ? 'Loading more...' : 'Load older messages'}
                        </button>
                      ) : null}

                      {messages.map((message) => {
                        if (message.isTimelineEvent) {
                          return (
                            <div key={message._id} className="my-3 flex justify-center">
                              <div className="max-w-[90%] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center shadow-sm">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">System event</p>
                                <p className="mt-1 text-sm text-slate-700">{message.message}</p>
                                <p className="mt-1 text-[11px] text-slate-500">{formatDateTime(message.createdAt)}</p>
                              </div>
                            </div>
                          )
                        }

                        const fromCustomer = message.senderRole === SENDER_ROLE.CUSTOMER
                        const fromCurrentStaff = String(message.sender || '') === String(admin?._id || '')
                        const alignRight = !fromCustomer && fromCurrentStaff

                        return (
                          <div key={message._id} className={`mb-3 flex ${alignRight ? 'justify-end' : 'justify-start'}`}>
                            <div
                              className={`max-w-[85%] rounded-2xl px-3 py-2 shadow-sm ${
                                fromCustomer
                                  ? 'border border-blue-200 bg-blue-50 text-blue-900'
                                  : alignRight
                                    ? 'border border-teal-200 bg-teal-600 text-white'
                                    : 'border border-slate-200 bg-white text-slate-900'
                              }`}
                            >
                              <p className={`text-[11px] font-semibold ${alignRight ? 'text-teal-100' : 'text-slate-500'}`}>
                                {getParticipantLabel(message, admin?._id)}
                              </p>
                              <p className="mt-1 whitespace-pre-wrap text-sm">{message.message}</p>
                              <div className={`mt-1 flex items-center gap-2 text-[11px] ${alignRight ? 'text-teal-100' : 'text-slate-500'}`}>
                                <span>{formatDateTime(message.createdAt)}</span>
                                {message.pending ? <span>Sending...</span> : null}
                                {message.failed ? (
                                  <button
                                    type="button"
                                    onClick={() => retryMessage(message)}
                                    className="font-semibold text-red-500"
                                  >
                                    Retry
                                  </button>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </>
                  )}
                </div>

                <form onSubmit={handleSend} className="border-t border-slate-100 p-4 lg:p-6">
                  <div className="flex items-end gap-3">
                    <textarea
                      value={draftMessage}
                      onChange={(event) => setDraftMessage(event.target.value)}
                      rows={3}
                      placeholder="Type support response..."
                      className="min-h-22 flex-1 resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-teal-300"
                    />
                    <button
                      type="submit"
                      disabled={threadSending || !draftMessage.trim() || selectedDispute.status === DISPUTE_STATUS.CLOSED}
                      className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {threadSending ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                  {selectedDispute.status === DISPUTE_STATUS.CLOSED ? (
                    <p className="mt-2 text-xs font-semibold text-slate-500">This dispute is closed. Messaging is locked.</p>
                  ) : null}
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default DisputesTab
