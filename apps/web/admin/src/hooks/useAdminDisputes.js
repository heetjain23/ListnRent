import React from 'react'
import { adminApi } from '../services/api'
import {
  assignAdminDispute,
  getAdminDisputeById,
  getAdminDisputeMessages,
  getAdminDisputeMetrics,
  getAdminDisputes,
  resolveAdminDispute,
  sendAdminDisputeMessage,
  updateAdminDisputeStatus,
} from '../services/adminDisputesService'
import { useAdminSocketContext } from '../context/AdminSocketContext'
import { useAdminAuth } from './useAdminAuth'
import {
  DISPUTE_STATUS,
  SENDER_ROLE,
  SYSTEM_ACTION,
} from '@listnrent/shared/constants'

const DISPUTE_EVENTS = [
  'dispute:created',
  'dispute:new_message',
  'dispute:status_changed',
  'dispute:resolved_pending',
  'dispute:closed',
  'dispute:reopened',
  'dispute:assigned',
  'dispute:unread_update',
]

const byNewestActivity = (left, right) => {
  const leftTime = new Date(left?.lastMessageAt || left?.updatedAt || left?.createdAt || 0).getTime()
  const rightTime = new Date(right?.lastMessageAt || right?.updatedAt || right?.createdAt || 0).getTime()
  return rightTime - leftTime
}

const normalizeDispute = (payload) => payload?.dispute || payload?.data?.dispute || payload || null
const normalizeMessage = (payload) => payload?.message || payload?.systemMessage || payload?.data?.message || null

const mergeDisputes = (current, incoming) => {
  if (!Array.isArray(incoming)) return current

  const map = new Map()
  current.forEach((item) => {
    if (item?._id) map.set(item._id, item)
  })

  incoming.forEach((item) => {
    if (!item?._id) return
    map.set(item._id, { ...map.get(item._id), ...item })
  })

  return Array.from(map.values()).sort(byNewestActivity)
}

const mergeMessages = (current, incoming) => {
  const combined = [...current, ...incoming]
  const map = new Map()

  combined.forEach((message) => {
    if (!message?._id) return
    map.set(message._id, { ...map.get(message._id), ...message })
  })

  return Array.from(map.values()).sort(
    (left, right) =>
      new Date(left?.createdAt || 0).getTime() - new Date(right?.createdAt || 0).getTime(),
  )
}

const senderRoleFromAdminRole = (role) => {
  if (role === 'super_admin') return SENDER_ROLE.SUPER_ADMIN
  if (role === 'admin') return SENDER_ROLE.ADMIN
  return SENDER_ROLE.SUPPORT_TEAM
}

const isFilterMatch = (dispute, filters, adminId) => {
  if (!dispute) return false

  if (filters.status && dispute.status !== filters.status) return false
  if (filters.priority && dispute.priority !== filters.priority) return false
  if (filters.category && dispute.category !== filters.category) return false

  if (filters.reopenedOnly && Number(dispute.reopenCount || 0) <= 0) {
    return false
  }

  if (filters.search) {
    const term = filters.search.toLowerCase()
    const haystack = `${dispute.disputeId || ''} ${dispute.subject || ''}`.toLowerCase()
    if (!haystack.includes(term)) return false
  }

  if (filters.assignment === 'unassigned' && dispute.assignedTo) return false
  if (filters.assignment === 'assigned' && !dispute.assignedTo) return false
  if (filters.assignment === 'assigned_to_me') {
    const assignedId = dispute.assignedTo?._id || dispute.assignedTo || null
    if (!assignedId || String(assignedId) !== String(adminId || '')) {
      return false
    }
  }

  return true
}

export const useAdminDisputes = () => {
  const { admin } = useAdminAuth()
  const { socketRef, connectCount } = useAdminSocketContext()

  const [filters, setFilters] = React.useState({
    search: '',
    status: '',
    priority: '',
    category: '',
    assignment: 'all',
    reopenedOnly: false,
    sortBy: 'lastMessageAt',
    sortOrder: 'desc',
  })

  const [listState, setListState] = React.useState({
    disputes: [],
    pagination: { page: 1, limit: 20, total: 0, totalPages: 1 },
    loading: true,
    loadingMore: false,
    error: '',
  })

  const [threadState, setThreadState] = React.useState({
    selectedDisputeId: '',
    dispute: null,
    messages: [],
    pagination: { page: 1, limit: 30, total: 0, totalPages: 1 },
    loading: false,
    loadingMore: false,
    sending: false,
    actionLoading: '',
    error: '',
  })

  const [metrics, setMetrics] = React.useState(null)
  const [staffOptions, setStaffOptions] = React.useState([])

  const filtersRef = React.useRef(filters)
  const threadIdRef = React.useRef(threadState.selectedDisputeId)

  React.useEffect(() => {
    filtersRef.current = filters
  }, [filters])

  React.useEffect(() => {
    threadIdRef.current = threadState.selectedDisputeId
  }, [threadState.selectedDisputeId])

  const getQueryParams = React.useCallback((page = 1) => {
    const current = filtersRef.current

    return {
      page,
      limit: 20,
      status: current.status || undefined,
      priority: current.priority || undefined,
      category: current.category || undefined,
      search: current.search || undefined,
      sortBy: current.sortBy || 'lastMessageAt',
      sortOrder: current.sortOrder || 'desc',
      assigned: current.assignment || undefined,
      reopened: current.reopenedOnly ? 'true' : undefined,
      me: admin?._id || undefined,
    }
  }, [admin?._id])

  const refreshMetrics = React.useCallback(async () => {
    try {
      const response = await getAdminDisputeMetrics()
      setMetrics(response?.data || response || null)
    } catch {
      // Keep metrics non-blocking
    }
  }, [])

  const loadDisputes = React.useCallback(async ({ page = 1, append = false } = {}) => {
    setListState((current) => ({
      ...current,
      loading: append ? current.loading : true,
      loadingMore: append,
      error: '',
    }))

    try {
      const response = await getAdminDisputes(getQueryParams(page))
      const data = response?.data || response || {}
      const nextDisputes = data.disputes || []
      const nextPagination = data.pagination || {
        page,
        limit: 20,
        total: nextDisputes.length,
        totalPages: 1,
      }

      setListState((current) => ({
        ...current,
        disputes: append ? mergeDisputes(current.disputes, nextDisputes) : nextDisputes,
        pagination: nextPagination,
        loading: false,
        loadingMore: false,
      }))
    } catch (err) {
      setListState((current) => ({
        ...current,
        loading: false,
        loadingMore: false,
        error: err.message || 'Failed to load disputes',
      }))
    }
  }, [getQueryParams])

  const openDispute = React.useCallback(async (disputeId) => {
    if (!disputeId) return

    setThreadState((current) => ({
      ...current,
      selectedDisputeId: disputeId,
      loading: true,
      loadingMore: false,
      sending: false,
      actionLoading: '',
      error: '',
      pagination: { page: 1, limit: 30, total: 0, totalPages: 1 },
      messages: [],
    }))

    try {
      const [disputeResponse, messagesResponse] = await Promise.all([
        getAdminDisputeById(disputeId),
        getAdminDisputeMessages(disputeId, 1, 30),
      ])

      const disputeData = disputeResponse?.data?.dispute || disputeResponse?.dispute || null
      const messagesData = messagesResponse?.data?.messages || messagesResponse?.messages || []
      const paginationData = messagesResponse?.data?.pagination || messagesResponse?.pagination || {
        page: 1,
        limit: 30,
        total: messagesData.length,
        totalPages: 1,
      }

      setThreadState((current) => ({
        ...current,
        dispute: disputeData,
        messages: mergeMessages([], messagesData),
        pagination: paginationData,
        loading: false,
        error: '',
      }))

      setListState((current) => ({
        ...current,
        disputes: current.disputes.map((item) =>
          item._id === disputeData?._id
            ? {
                ...item,
                ...disputeData,
                unreadCounts: {
                  ...(item.unreadCounts || {}),
                  ...(disputeData?.unreadCounts || {}),
                  staff: 0,
                },
              }
            : item,
        ),
      }))

      refreshMetrics()
    } catch (err) {
      setThreadState((current) => ({
        ...current,
        loading: false,
        error: err.message || 'Failed to open dispute',
      }))
    }
  }, [refreshMetrics])

  const loadMoreDisputes = React.useCallback(() => {
    const pagination = listState.pagination
    if (listState.loadingMore || listState.loading || pagination.page >= pagination.totalPages) return
    loadDisputes({ page: pagination.page + 1, append: true })
  }, [listState.loading, listState.loadingMore, listState.pagination, loadDisputes])

  const loadMoreMessages = React.useCallback(async () => {
    const { selectedDisputeId, pagination, loadingMore, loading } = threadState
    if (!selectedDisputeId || loading || loadingMore || pagination.page >= pagination.totalPages) return

    setThreadState((current) => ({ ...current, loadingMore: true }))

    try {
      const nextPage = pagination.page + 1
      const response = await getAdminDisputeMessages(selectedDisputeId, nextPage, 30)
      const messagesData = response?.data?.messages || response?.messages || []
      const paginationData = response?.data?.pagination || response?.pagination || pagination

      setThreadState((current) => ({
        ...current,
        messages: mergeMessages(current.messages, messagesData),
        pagination: paginationData,
        loadingMore: false,
      }))
    } catch (err) {
      setThreadState((current) => ({
        ...current,
        loadingMore: false,
        error: err.message || 'Failed to load more messages',
      }))
    }
  }, [threadState])

  React.useEffect(() => {
    loadDisputes({ page: 1, append: false })
    refreshMetrics()
  }, [filters, loadDisputes, refreshMetrics])

  React.useEffect(() => {
    const socket = socketRef.current
    if (!socket) return undefined

    socket.emit('join:staff_disputes')

    let refreshTimer = null
    const scheduleMetricsRefresh = () => {
      if (refreshTimer) window.clearTimeout(refreshTimer)
      refreshTimer = window.setTimeout(() => {
        refreshMetrics()
      }, 220)
    }

    const onEvent = (payload) => {
      const nextDispute = normalizeDispute(payload)
      const nextMessage = normalizeMessage(payload)

      if (nextDispute && isFilterMatch(nextDispute, filtersRef.current, admin?._id)) {
        setListState((current) => {
          const exists = current.disputes.some((item) => item._id === nextDispute._id)
          const merged = mergeDisputes(current.disputes, [nextDispute])

          return {
            ...current,
            disputes: merged,
            pagination: {
              ...current.pagination,
              total: exists ? current.pagination.total : current.pagination.total + 1,
            },
          }
        })
      }

      if (nextDispute && nextDispute._id === threadIdRef.current) {
        setThreadState((current) => ({
          ...current,
          dispute: { ...current.dispute, ...nextDispute },
        }))
      }

      if (nextMessage) {
        const disputeId =
          nextDispute?._id ||
          nextDispute?.disputeId ||
          payload?.disputeId ||
          nextMessage?.disputeId

        if (String(disputeId || '') === String(threadIdRef.current || '')) {
          setThreadState((current) => ({
            ...current,
            messages: mergeMessages(current.messages, [nextMessage]),
          }))
        }
      }

      scheduleMetricsRefresh()
    }

    DISPUTE_EVENTS.forEach((eventName) => socket.on(eventName, onEvent))

    return () => {
      if (refreshTimer) window.clearTimeout(refreshTimer)
      DISPUTE_EVENTS.forEach((eventName) => socket.off(eventName, onEvent))
    }
  }, [admin?._id, connectCount, refreshMetrics, socketRef])

  const sendMessage = React.useCallback(async (messageText) => {
    const text = messageText?.trim()
    const disputeId = threadState.selectedDisputeId

    if (!text || !disputeId) {
      throw new Error('Message is required')
    }

    const tempId = `temp-${Date.now()}`
    const nowIso = new Date().toISOString()

    const optimistic = {
      _id: tempId,
      disputeId,
      sender: admin?._id || admin?.uid || 'staff',
      senderRole: senderRoleFromAdminRole(admin?.role),
      senderName: admin?.displayName || admin?.email || 'Support',
      senderPhoto: admin?.photoURL || null,
      message: text,
      isSystemMessage: false,
      systemAction: null,
      createdAt: nowIso,
      updatedAt: nowIso,
      pending: true,
    }

    setThreadState((current) => ({
      ...current,
      sending: true,
      error: '',
      messages: mergeMessages(current.messages, [optimistic]),
    }))

    try {
      const response = await sendAdminDisputeMessage(disputeId, text)
      const nextMessage = response?.data?.message || response?.message || null
      const nextDispute = response?.data?.dispute || response?.dispute || null

      setThreadState((current) => ({
        ...current,
        sending: false,
        messages: nextMessage
          ? mergeMessages(current.messages.filter((item) => item._id !== tempId), [nextMessage])
          : current.messages.map((item) =>
              item._id === tempId ? { ...item, pending: false } : item,
            ),
        dispute: nextDispute ? { ...current.dispute, ...nextDispute } : current.dispute,
      }))

      if (nextDispute) {
        setListState((current) => ({
          ...current,
          disputes: mergeDisputes(current.disputes, [nextDispute]),
        }))
      }

      refreshMetrics()
      return response
    } catch (err) {
      setThreadState((current) => ({
        ...current,
        sending: false,
        error: err.message || 'Failed to send message',
        messages: current.messages.map((item) =>
          item._id === tempId
            ? {
                ...item,
                pending: false,
                failed: true,
                errorMessage: err.message || 'Failed to send message',
              }
            : item,
        ),
      }))

      throw err
    }
  }, [admin?._id, admin?.displayName, admin?.email, admin?.photoURL, admin?.role, admin?.uid, refreshMetrics, threadState.selectedDisputeId])

  const retryMessage = React.useCallback(async (message) => {
    if (!message?.message) return

    setThreadState((current) => ({
      ...current,
      messages: current.messages.filter((item) => item._id !== message._id),
    }))

    return sendMessage(message.message)
  }, [sendMessage])

  const setStatus = React.useCallback(async (status) => {
    const disputeId = threadState.selectedDisputeId
    if (!disputeId || !status) return

    setThreadState((current) => ({ ...current, actionLoading: 'status', error: '' }))

    try {
      const response = await updateAdminDisputeStatus(disputeId, status)
      const nextDispute = response?.data?.dispute || response?.dispute || null
      const systemMessage = response?.data?.systemMessage || response?.systemMessage || null

      setThreadState((current) => ({
        ...current,
        actionLoading: '',
        dispute: nextDispute ? { ...current.dispute, ...nextDispute } : current.dispute,
        messages: systemMessage ? mergeMessages(current.messages, [systemMessage]) : current.messages,
      }))

      if (nextDispute) {
        setListState((current) => ({
          ...current,
          disputes: mergeDisputes(current.disputes, [nextDispute]),
        }))
      }

      refreshMetrics()
      return response
    } catch (err) {
      setThreadState((current) => ({
        ...current,
        actionLoading: '',
        error: err.message || 'Failed to change status',
      }))
      throw err
    }
  }, [refreshMetrics, threadState.selectedDisputeId])

  const markResolved = React.useCallback(async () => {
    const disputeId = threadState.selectedDisputeId
    if (!disputeId) return

    setThreadState((current) => ({ ...current, actionLoading: 'resolve', error: '' }))

    try {
      const response = await resolveAdminDispute(disputeId)
      const nextDispute = response?.data?.dispute || response?.dispute || null
      const systemMessage = response?.data?.systemMessage || response?.systemMessage || null

      setThreadState((current) => ({
        ...current,
        actionLoading: '',
        dispute: nextDispute ? { ...current.dispute, ...nextDispute } : current.dispute,
        messages: systemMessage ? mergeMessages(current.messages, [systemMessage]) : current.messages,
      }))

      if (nextDispute) {
        setListState((current) => ({
          ...current,
          disputes: mergeDisputes(current.disputes, [nextDispute]),
        }))
      }

      refreshMetrics()
      return response
    } catch (err) {
      setThreadState((current) => ({
        ...current,
        actionLoading: '',
        error: err.message || 'Failed to resolve dispute',
      }))
      throw err
    }
  }, [refreshMetrics, threadState.selectedDisputeId])

  const assignDispute = React.useCallback(async (assigneeId) => {
    const disputeId = threadState.selectedDisputeId
    if (!disputeId || !assigneeId) return

    setThreadState((current) => ({ ...current, actionLoading: 'assign', error: '' }))

    try {
      const response = await assignAdminDispute(disputeId, assigneeId)
      const nextDispute = response?.data?.dispute || response?.dispute || null
      const systemMessage = response?.data?.systemMessage || response?.systemMessage || null

      setThreadState((current) => ({
        ...current,
        actionLoading: '',
        dispute: nextDispute ? { ...current.dispute, ...nextDispute } : current.dispute,
        messages: systemMessage ? mergeMessages(current.messages, [systemMessage]) : current.messages,
      }))

      if (nextDispute) {
        setListState((current) => ({
          ...current,
          disputes: mergeDisputes(current.disputes, [nextDispute]),
        }))
      }

      refreshMetrics()
      return response
    } catch (err) {
      setThreadState((current) => ({
        ...current,
        actionLoading: '',
        error: err.message || 'Failed to assign dispute',
      }))
      throw err
    }
  }, [refreshMetrics, threadState.selectedDisputeId])

  const loadStaffOptions = React.useCallback(async () => {
    try {
      const [supportResponse, adminResponse] = await Promise.all([
        adminApi.getSupportTeamMembers(),
        adminApi.getAllAdmins(),
      ])

      const support = supportResponse?.members || supportResponse?.data || []
      const admins = adminResponse?.admins || adminResponse?.data || []

      const merged = [...support, ...admins]
        .filter((member) => member?.status === 'active')
        .map((member) => ({
          _id: member._id,
          displayName: member.displayName || member.email || 'Team Member',
          email: member.email || '',
          role: member.role || 'support_team',
          photoURL: member.photoURL || null,
        }))

      const map = new Map()
      merged.forEach((member) => {
        if (member._id) map.set(member._id, member)
      })

      setStaffOptions(Array.from(map.values()))
    } catch {
      setStaffOptions([])
    }
  }, [])

  React.useEffect(() => {
    if (!admin?.uid) return
    loadStaffOptions()
  }, [admin?.uid, loadStaffOptions])

  const statusActions = React.useMemo(() => {
    const currentStatus = threadState.dispute?.status
    const transitions = {
      [DISPUTE_STATUS.OPEN]: [DISPUTE_STATUS.IN_PROGRESS, DISPUTE_STATUS.WAITING_FOR_USER],
      [DISPUTE_STATUS.IN_PROGRESS]: [DISPUTE_STATUS.WAITING_FOR_USER],
      [DISPUTE_STATUS.WAITING_FOR_USER]: [DISPUTE_STATUS.IN_PROGRESS],
      [DISPUTE_STATUS.REOPENED]: [DISPUTE_STATUS.IN_PROGRESS, DISPUTE_STATUS.WAITING_FOR_USER],
    }

    return transitions[currentStatus] || []
  }, [threadState.dispute?.status])

  const timelineMessages = React.useMemo(
    () =>
      threadState.messages.map((message) => ({
        ...message,
        isTimelineEvent:
          message.isSystemMessage ||
          [
            SYSTEM_ACTION.DISPUTE_OPENED,
            SYSTEM_ACTION.STATUS_CHANGED,
            SYSTEM_ACTION.ASSIGNED,
            SYSTEM_ACTION.MARKED_RESOLVED,
            SYSTEM_ACTION.USER_REOPENED,
            SYSTEM_ACTION.USER_CONFIRMED_RESOLVED,
          ].includes(message.systemAction),
      })),
    [threadState.messages],
  )

  return {
    filters,
    setFilters,
    disputes: listState.disputes,
    listPagination: listState.pagination,
    listLoading: listState.loading,
    listLoadingMore: listState.loadingMore,
    listError: listState.error,
    loadMoreDisputes,
    refreshDisputes: () => loadDisputes({ page: 1, append: false }),

    selectedDisputeId: threadState.selectedDisputeId,
    selectedDispute: threadState.dispute,
    openDispute,

    messages: timelineMessages,
    threadPagination: threadState.pagination,
    threadLoading: threadState.loading,
    threadLoadingMore: threadState.loadingMore,
    threadSending: threadState.sending,
    threadError: threadState.error,
    threadActionLoading: threadState.actionLoading,
    loadMoreMessages,

    sendMessage,
    retryMessage,
    setStatus,
    markResolved,
    assignDispute,

    metrics,
    refreshMetrics,

    staffOptions,
    statusActions,
    canAssign: admin?.role === 'admin' || admin?.role === 'super_admin',
    isStaff: admin?.role === 'support_team' || admin?.role === 'admin' || admin?.role === 'super_admin',
  }
}
