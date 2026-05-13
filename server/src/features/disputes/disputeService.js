import mongoose from 'mongoose'
import Dispute from './Dispute.js'
import DisputeMessage from './DisputeMessage.js'
import Booking from '../bookings/Booking.js'
import User from '../users/User.js'
import Admin from '../admin/Admin.js'
import {
  DISPUTE_STATUS,
  DISPUTE_PRIORITY,
  SENDER_ROLE,
  SYSTEM_ACTION,
  SYSTEM_MESSAGES,
  ALLOWED_TRANSITIONS,
  STAFF_BLOCKED_STATUSES,
  adminRoleToSenderRole,
  USER_BLOCKED_STATUSES,
} from '@listnrent/shared/constants'
import { emitDisputeEvent } from './disputeSocketHooks.js'

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Generate a human-readable dispute ID: DSP-YYYYMM-XXXX
 */
const generateDisputeId = () => {
  const now = new Date()
  const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
  const suffix = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `DSP-${yyyymm}-${suffix}`
}

/**
 * Resolve display name for a user (Firebase UID → User model).
 */
const resolveUserName = async (uid) => {
  try {
    const user = await User.findOne({ uid }).select('displayName email').lean()
    if (user?.displayName) return user.displayName
    if (user?.email) return user.email.split('@')[0]
  } catch {
    // non-fatal
  }
  return 'Customer'
}

/**
 * Resolve display name for an admin (Admin ObjectId or string).
 */
const resolveAdminName = async (adminId) => {
  try {
    const admin = await Admin.findById(adminId).select('displayName email role').lean()
    if (admin?.displayName) return admin.displayName
    if (admin?.email) return admin.email.split('@')[0]
  } catch {
    // non-fatal
  }
  return 'Support'
}

/**
 * Increment unread count for all participants except the sender.
 * Returns the $set / $inc update object.
 */
const buildUnreadIncrements = (participantIds, senderUid) => {
  const inc = {}
  participantIds
    .filter((id) => id !== senderUid)
    .forEach((id) => {
      inc[`unreadCounts.${id}`] = 1
    })
  return inc
}

/**
 * Collect all participant IDs for a dispute:
 * customer + assignedTo admin (if set) + a virtual "staff" key for broadcast.
 * Returned as string array — safe for socket room targeting.
 */
const getDisputeParticipantIds = (dispute) => {
  const ids = [dispute.raisedBy]
  if (dispute.assignedTo) ids.push(dispute.assignedTo.toString())
  return ids
}

/**
 * Format a dispute document for API response.
 * Strips internal Map internals and adds convenience fields.
 */
const formatDispute = (dispute) => {
  const obj = dispute.toObject ? dispute.toObject({ flattenMaps: true }) : dispute
  return {
    ...obj,
    unreadCounts: obj.unreadCounts || {},
  }
}

/**
 * Format a message document for API response.
 */
const formatMessage = (message) => {
  const obj = message.toObject ? message.toObject() : message
  return obj
}

// ─── CREATE DISPUTE ────────────────────────────────────────────────────────────

/**
 * Create a new dispute for a booking.
 * Validates ownership, creates dispute + initial message atomically.
 *
 * @param {string} userId - Firebase UID of the customer
 * @param {object} payload - { bookingId, subject, message, category }
 */
export const createDispute = async (userId, payload) => {
  const { bookingId, subject, message, category } = payload

  // Verify booking exists and belongs to this user
  const booking = await Booking.findById(bookingId).lean()
  if (!booking) {
    const err = new Error('Booking not found')
    err.statusCode = 404
    throw err
  }

  if (booking.userId !== userId) {
    const err = new Error('You can only raise disputes for your own bookings')
    err.statusCode = 403
    throw err
  }

  // Prevent duplicate open disputes for same booking
  const existing = await Dispute.findOne({
    bookingId,
    raisedBy: userId,
    status: { $nin: [DISPUTE_STATUS.CLOSED] },
  }).lean()

  if (existing) {
    const err = new Error('You already have an active dispute for this booking')
    err.statusCode = 409
    throw err
  }

  const senderName = await resolveUserName(userId)

  // Generate unique dispute ID with collision retry
  let disputeId
  let attempts = 0
  do {
    disputeId = generateDisputeId()
    attempts++
  } while (
    attempts < 5 &&
    (await Dispute.exists({ disputeId }))
  )

  // Create dispute
  const dispute = await Dispute.create({
    disputeId,
    bookingId,
    raisedBy: userId,
    subject: subject.trim(),
    category: category || 'OTHER',
    status: DISPUTE_STATUS.OPEN,
    priority: DISPUTE_PRIORITY.MEDIUM,
    lastMessage: message.trim().substring(0, 300),
    lastMessageAt: new Date(),
    lastMessageBy: userId,
    unreadCounts: new Map([['staff', 1]]), // notify staff pool
  })

  // Create the opening message (user's initial description)
  const openingMessage = await DisputeMessage.create({
    disputeId: dispute._id,
    sender: userId,
    senderRole: SENDER_ROLE.CUSTOMER,
    senderName,
    message: message.trim(),
    isSystemMessage: false,
    readBy: [{ uid: userId, readAt: new Date() }],
  })

  // Create system message: dispute opened
  await DisputeMessage.create({
    disputeId: dispute._id,
    sender: 'system',
    senderRole: SENDER_ROLE.SYSTEM,
    senderName: 'System',
    message: SYSTEM_MESSAGES.DISPUTE_OPENED(subject.trim()),
    isSystemMessage: true,
    systemAction: SYSTEM_ACTION.DISPUTE_OPENED,
  })

  // Emit socket event (non-blocking)
  emitDisputeEvent('dispute:created', {
    disputeId: dispute._id.toString(),
    dispute: formatDispute(dispute),
    message: formatMessage(openingMessage),
  })

  return {
    dispute: formatDispute(dispute),
    message: formatMessage(openingMessage),
  }
}

// ─── SEND MESSAGE ──────────────────────────────────────────────────────────────

/**
 * Send a message in a dispute thread.
 *
 * @param {string} senderId - Firebase UID (customer) or Admin _id string
 * @param {string} senderRole - one of SENDER_ROLE values
 * @param {string} senderAdminRole - raw Admin.role if staff/admin (for role mapping)
 * @param {string} disputeIdOrObjectId - Dispute _id
 * @param {string} messageText
 */
export const sendDisputeMessage = async (
  senderId,
  resolvedSenderRole,
  senderAdminRole,
  disputeMongoId,
  messageText,
) => {
  if (!messageText?.trim()) {
    const err = new Error('Message cannot be empty')
    err.statusCode = 400
    throw err
  }

  const dispute = await Dispute.findById(disputeMongoId)
  if (!dispute) {
    const err = new Error('Dispute not found')
    err.statusCode = 404
    throw err
  }

  // Authorization & block checks
  if (resolvedSenderRole === SENDER_ROLE.CUSTOMER) {
    if (dispute.raisedBy !== senderId) {
      const err = new Error('Not authorized to message in this dispute')
      err.statusCode = 403
      throw err
    }
    if (USER_BLOCKED_STATUSES.includes(dispute.status)) {
      const err = new Error('This dispute is closed and cannot receive new messages')
      err.statusCode = 400
      throw err
    }
  } else {
    // Staff / admin
    if (STAFF_BLOCKED_STATUSES.includes(dispute.status)) {
      const err = new Error('This dispute is closed')
      err.statusCode = 400
      throw err
    }
  }

  // Resolve sender display name
  let senderName = 'Support'
  let senderPhoto = null
  if (resolvedSenderRole === SENDER_ROLE.CUSTOMER) {
    senderName = await resolveUserName(senderId)
    const u = await User.findOne({ uid: senderId }).select('photoURL').lean()
    senderPhoto = u?.photoURL || null
  } else {
    senderName = await resolveAdminName(senderId)
    const a = await Admin.findById(senderId).select('photoURL').lean()
    senderPhoto = a?.photoURL || null
  }

  const now = new Date()
  const trimmed = messageText.trim()

  // Determine participant IDs for unread tracking
  const customerUid = dispute.raisedBy
  const isCustomerSending = resolvedSenderRole === SENDER_ROLE.CUSTOMER

  // Create message
  const msg = await DisputeMessage.create({
    disputeId: dispute._id,
    sender: senderId,
    senderRole: resolvedSenderRole,
    senderName,
    senderPhoto,
    message: trimmed,
    isSystemMessage: false,
    readBy: [{ uid: senderId, readAt: now }],
  })

  // Build unread increments
  const unreadUpdates = {}
  if (isCustomerSending) {
    // Staff pool gets an unread
    unreadUpdates['unreadCounts.staff'] = (dispute.unreadCounts?.get?.('staff') || 0) + 1
  } else {
    // Customer gets an unread
    const current = dispute.unreadCounts?.get?.(customerUid) || 0
    unreadUpdates[`unreadCounts.${customerUid}`] = current + 1
  }

  // Auto-advance status: if staff replies to OPEN dispute → IN_PROGRESS
  let newStatus = dispute.status
  if (
    !isCustomerSending &&
    (dispute.status === DISPUTE_STATUS.OPEN || dispute.status === DISPUTE_STATUS.REOPENED)
  ) {
    newStatus = DISPUTE_STATUS.IN_PROGRESS
  }
  // If customer replies to WAITING_FOR_USER → IN_PROGRESS
  if (isCustomerSending && dispute.status === DISPUTE_STATUS.WAITING_FOR_USER) {
    newStatus = DISPUTE_STATUS.IN_PROGRESS
  }

  const updatedDispute = await Dispute.findByIdAndUpdate(
    dispute._id,
    {
      $set: {
        lastMessage: trimmed.substring(0, 300),
        lastMessageAt: now,
        lastMessageBy: senderId,
        status: newStatus,
        ...unreadUpdates,
      },
    },
    { new: true }
  )

  const formattedMsg = formatMessage(msg)
  const formattedDispute = formatDispute(updatedDispute)

  // Emit realtime event
  emitDisputeEvent('dispute:new_message', {
    disputeId: dispute._id.toString(),
    dispute: formattedDispute,
    message: formattedMsg,
    senderRole: resolvedSenderRole,
  })

  return { message: formattedMsg, dispute: formattedDispute }
}

// ─── GET USER DISPUTES ─────────────────────────────────────────────────────────

/**
 * Get paginated list of disputes for a customer.
 */
export const getUserDisputes = async (userId, options = {}) => {
  const {
    page = 1,
    limit = 10,
    status,
    sortBy = 'lastMessageAt',
    sortOrder = 'desc',
  } = options

  const skip = (Math.max(1, page) - 1) * Math.min(limit, 20)
  const query = { raisedBy: userId }
  if (status) query.status = status

  const sortDir = sortOrder === 'asc' ? 1 : -1
  const allowedSort = ['lastMessageAt', 'createdAt', 'status', 'priority']
  const sort = { [allowedSort.includes(sortBy) ? sortBy : 'lastMessageAt']: sortDir }

  const [disputes, total] = await Promise.all([
    Dispute.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Math.min(limit, 20))
      .populate('bookingId', 'listingId startDate endDate totalAmount paymentStatus')
      .lean(),
    Dispute.countDocuments(query),
  ])

  return {
    disputes: disputes.map((d) => ({ ...d, unreadCounts: d.unreadCounts || {} })),
    pagination: {
      page: Number(page),
      limit: Math.min(limit, 20),
      total,
      totalPages: Math.ceil(total / Math.min(limit, 20)),
    },
  }
}

// ─── GET SINGLE DISPUTE ────────────────────────────────────────────────────────

/**
 * Get a dispute by Mongo ID or disputeId string.
 * Validates customer ownership when userId is provided.
 */
export const getDisputeById = async (idOrDisputeId, userId = null) => {
  const isObjectId = mongoose.Types.ObjectId.isValid(idOrDisputeId)
  const query = isObjectId
    ? { _id: idOrDisputeId }
    : { disputeId: idOrDisputeId }

  const dispute = await Dispute.findOne(query)
    .populate('bookingId', 'listingId startDate endDate totalAmount paymentStatus bookingStatus')
    .populate('assignedTo', 'displayName email role photoURL')
    .lean()

  if (!dispute) {
    const err = new Error('Dispute not found')
    err.statusCode = 404
    throw err
  }

  // Ownership check for customers
  if (userId && dispute.raisedBy !== userId) {
    const err = new Error('Not authorized to view this dispute')
    err.statusCode = 403
    throw err
  }

  return { ...dispute, unreadCounts: dispute.unreadCounts || {} }
}

// ─── GET DISPUTE MESSAGES ──────────────────────────────────────────────────────

/**
 * Paginated message thread for a dispute.
 * Returns oldest-first within the page.
 */
export const getDisputeMessages = async (disputeMongoId, options = {}) => {
  const { page = 1, limit = 30 } = options
  const skip = (Math.max(1, page) - 1) * Math.min(limit, 50)

  const [messages, total] = await Promise.all([
    DisputeMessage.find({
      disputeId: disputeMongoId,
      isDeleted: false,
    })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(Math.min(limit, 50))
      .lean(),
    DisputeMessage.countDocuments({ disputeId: disputeMongoId, isDeleted: false }),
  ])

  return {
    messages,
    pagination: {
      page: Number(page),
      limit: Math.min(limit, 50),
      total,
      totalPages: Math.ceil(total / Math.min(limit, 50)),
    },
  }
}

// ─── MARK MESSAGES AS READ ─────────────────────────────────────────────────────

/**
 * Zero out unread counter for a participant in a dispute.
 */
export const markDisputeMessagesRead = async (disputeMongoId, participantId) => {
  const key = `unreadCounts.${participantId}`
  await Dispute.findByIdAndUpdate(disputeMongoId, {
    $set: { [key]: 0 },
  })
}

// ─── MARK RESOLVED (staff/admin action) ───────────────────────────────────────

/**
 * Staff/admin marks dispute as resolved.
 * Status → RESOLVED_PENDING_CONFIRMATION.
 * Generates a system message prompting user to confirm.
 */
export const markDisputeResolved = async (adminId, adminRole, disputeMongoId) => {
  const dispute = await Dispute.findById(disputeMongoId)
  if (!dispute) {
    const err = new Error('Dispute not found')
    err.statusCode = 404
    throw err
  }

  const blockStatuses = [DISPUTE_STATUS.CLOSED, DISPUTE_STATUS.RESOLVED_PENDING_CONFIRMATION]
  if (blockStatuses.includes(dispute.status)) {
    const err = new Error(`Cannot mark as resolved when status is ${dispute.status}`)
    err.statusCode = 400
    throw err
  }

  const adminName = await resolveAdminName(adminId)
  const now = new Date()

  // Insert system message prompting user
  const systemMsg = await DisputeMessage.create({
    disputeId: dispute._id,
    sender: 'system',
    senderRole: SENDER_ROLE.SYSTEM,
    senderName: 'System',
    message: SYSTEM_MESSAGES.MARKED_RESOLVED(),
    isSystemMessage: true,
    systemAction: SYSTEM_ACTION.MARKED_RESOLVED,
  })

  // Customer gets unread increment for the prompt
  const customerUid = dispute.raisedBy
  const current = dispute.unreadCounts?.get?.(customerUid) || 0

  const updatedDispute = await Dispute.findByIdAndUpdate(
    dispute._id,
    {
      $set: {
        status: DISPUTE_STATUS.RESOLVED_PENDING_CONFIRMATION,
        resolvedAt: now,
        lastMessage: SYSTEM_MESSAGES.MARKED_RESOLVED().substring(0, 300),
        lastMessageAt: now,
        lastMessageBy: 'system',
        [`unreadCounts.${customerUid}`]: current + 1,
      },
    },
    { new: true }
  )

  const formattedDispute = formatDispute(updatedDispute)

  emitDisputeEvent('dispute:resolved_pending', {
    disputeId: dispute._id.toString(),
    dispute: formattedDispute,
    message: formatMessage(systemMsg),
  })

  return { dispute: formattedDispute, systemMessage: formatMessage(systemMsg) }
}

// ─── USER CONFIRMS RESOLVED ────────────────────────────────────────────────────

/**
 * Customer confirms their issue is resolved.
 * Status → CLOSED.
 */
export const confirmDisputeResolved = async (userId, disputeMongoId) => {
  const dispute = await Dispute.findById(disputeMongoId)
  if (!dispute) {
    const err = new Error('Dispute not found')
    err.statusCode = 404
    throw err
  }

  if (dispute.raisedBy !== userId) {
    const err = new Error('Not authorized')
    err.statusCode = 403
    throw err
  }

  if (dispute.status !== DISPUTE_STATUS.RESOLVED_PENDING_CONFIRMATION) {
    const err = new Error('Dispute is not awaiting confirmation')
    err.statusCode = 400
    throw err
  }

  const now = new Date()

  const systemMsg = await DisputeMessage.create({
    disputeId: dispute._id,
    sender: 'system',
    senderRole: SENDER_ROLE.SYSTEM,
    senderName: 'System',
    message: SYSTEM_MESSAGES.USER_CONFIRMED_RESOLVED(),
    isSystemMessage: true,
    systemAction: SYSTEM_ACTION.USER_CONFIRMED_RESOLVED,
  })

  const updatedDispute = await Dispute.findByIdAndUpdate(
    dispute._id,
    {
      $set: {
        status: DISPUTE_STATUS.CLOSED,
        closedAt: now,
        lastMessage: SYSTEM_MESSAGES.USER_CONFIRMED_RESOLVED().substring(0, 300),
        lastMessageAt: now,
        lastMessageBy: 'system',
        'unreadCounts.staff': 0,
      },
    },
    { new: true }
  )

  const formattedDispute = formatDispute(updatedDispute)

  emitDisputeEvent('dispute:closed', {
    disputeId: dispute._id.toString(),
    dispute: formattedDispute,
    message: formatMessage(systemMsg),
  })

  return { dispute: formattedDispute, systemMessage: formatMessage(systemMsg) }
}

// ─── USER REOPENS DISPUTE ──────────────────────────────────────────────────────

/**
 * Customer indicates issue is NOT resolved — reopens the dispute.
 * Status → REOPENED.
 * Staff pool gets an unread increment.
 */
export const reopenDispute = async (userId, disputeMongoId) => {
  const dispute = await Dispute.findById(disputeMongoId)
  if (!dispute) {
    const err = new Error('Dispute not found')
    err.statusCode = 404
    throw err
  }

  if (dispute.raisedBy !== userId) {
    const err = new Error('Not authorized')
    err.statusCode = 403
    throw err
  }

  if (dispute.status !== DISPUTE_STATUS.RESOLVED_PENDING_CONFIRMATION) {
    const err = new Error('Dispute is not awaiting confirmation')
    err.statusCode = 400
    throw err
  }

  const now = new Date()

  const systemMsg = await DisputeMessage.create({
    disputeId: dispute._id,
    sender: 'system',
    senderRole: SENDER_ROLE.SYSTEM,
    senderName: 'System',
    message: SYSTEM_MESSAGES.USER_REOPENED(),
    isSystemMessage: true,
    systemAction: SYSTEM_ACTION.USER_REOPENED,
  })

  const staffUnread = (dispute.unreadCounts?.get?.('staff') || 0) + 1

  const updatedDispute = await Dispute.findByIdAndUpdate(
    dispute._id,
    {
      $set: {
        status: DISPUTE_STATUS.REOPENED,
        resolvedAt: null,
        lastMessage: SYSTEM_MESSAGES.USER_REOPENED().substring(0, 300),
        lastMessageAt: now,
        lastMessageBy: 'system',
        'unreadCounts.staff': staffUnread,
      },
      $inc: { reopenCount: 1 },
    },
    { new: true }
  )

  const formattedDispute = formatDispute(updatedDispute)

  emitDisputeEvent('dispute:reopened', {
    disputeId: dispute._id.toString(),
    dispute: formattedDispute,
    message: formatMessage(systemMsg),
  })

  return { dispute: formattedDispute, systemMessage: formatMessage(systemMsg) }
}

// ─── ADMIN: GET ALL DISPUTES ───────────────────────────────────────────────────

/**
 * Full dispute list for admin/support with filtering, sorting, pagination.
 */
export const getAllDisputesAdmin = async (options = {}) => {
  const {
    page = 1,
    limit = 15,
    status,
    priority,
    category,
    assignedTo,
    search,
    sortBy = 'lastMessageAt',
    sortOrder = 'desc',
  } = options

  const skip = (Math.max(1, page) - 1) * Math.min(limit, 50)
  const query = {}

  if (status) query.status = status
  if (priority) query.priority = priority
  if (category) query.category = category
  if (assignedTo) query.assignedTo = assignedTo

  // Search by disputeId or subject
  if (search) {
    const re = new RegExp(search.trim(), 'i')
    query.$or = [{ disputeId: re }, { subject: re }]
  }

  const allowedSort = ['lastMessageAt', 'createdAt', 'status', 'priority', 'reopenCount']
  const sort = {
    [allowedSort.includes(sortBy) ? sortBy : 'lastMessageAt']: sortOrder === 'asc' ? 1 : -1,
  }

  const [disputes, total] = await Promise.all([
    Dispute.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Math.min(limit, 50))
      .populate('bookingId', 'listingId startDate endDate totalAmount paymentStatus')
      .populate('assignedTo', 'displayName email role photoURL')
      .lean(),
    Dispute.countDocuments(query),
  ])

  // Enrich with customer display name in one batch
  const userIds = [...new Set(disputes.map((d) => d.raisedBy).filter(Boolean))]
  const users = userIds.length
    ? await User.find({ uid: { $in: userIds } }).select('uid displayName email photoURL').lean()
    : []
  const userMap = new Map(users.map((u) => [u.uid, u]))

  const enriched = disputes.map((d) => {
    const user = userMap.get(d.raisedBy) || {}
    return {
      ...d,
      unreadCounts: d.unreadCounts || {},
      raisedByUser: {
        uid: d.raisedBy,
        displayName: user.displayName || user.email?.split('@')[0] || 'Customer',
        email: user.email || null,
        photoURL: user.photoURL || null,
      },
    }
  })

  return {
    disputes: enriched,
    pagination: {
      page: Number(page),
      limit: Math.min(limit, 50),
      total,
      totalPages: Math.ceil(total / Math.min(limit, 50)),
    },
  }
}

// ─── ADMIN: UPDATE STATUS ──────────────────────────────────────────────────────

/**
 * Admin/support manually changes dispute status.
 * Validates transition is allowed.
 * Auto-generates system message for the transition.
 */
export const updateDisputeStatus = async (adminId, adminRole, disputeMongoId, newStatus) => {
  const dispute = await Dispute.findById(disputeMongoId)
  if (!dispute) {
    const err = new Error('Dispute not found')
    err.statusCode = 404
    throw err
  }

  const actorType = 'staff'
  const allowed = ALLOWED_TRANSITIONS[actorType]?.[dispute.status] || []
  if (!allowed.includes(newStatus)) {
    const err = new Error(
      `Cannot transition from ${dispute.status} to ${newStatus}`
    )
    err.statusCode = 400
    throw err
  }

  const now = new Date()
  const from = dispute.status

  const systemMsg = await DisputeMessage.create({
    disputeId: dispute._id,
    sender: 'system',
    senderRole: SENDER_ROLE.SYSTEM,
    senderName: 'System',
    message: SYSTEM_MESSAGES.STATUS_CHANGED(from, newStatus),
    isSystemMessage: true,
    systemAction: SYSTEM_ACTION.STATUS_CHANGED,
  })

  const updateData = {
    status: newStatus,
    lastMessage: SYSTEM_MESSAGES.STATUS_CHANGED(from, newStatus).substring(0, 300),
    lastMessageAt: now,
    lastMessageBy: 'system',
  }

  if (newStatus === DISPUTE_STATUS.RESOLVED_PENDING_CONFIRMATION) {
    updateData.resolvedAt = now
    const customerUid = dispute.raisedBy
    const current = dispute.unreadCounts?.get?.(customerUid) || 0
    updateData[`unreadCounts.${customerUid}`] = current + 1
  }

  const updatedDispute = await Dispute.findByIdAndUpdate(
    dispute._id,
    { $set: updateData },
    { new: true }
  )

  const formattedDispute = formatDispute(updatedDispute)

  emitDisputeEvent('dispute:status_changed', {
    disputeId: dispute._id.toString(),
    dispute: formattedDispute,
    from,
    to: newStatus,
    message: formatMessage(systemMsg),
  })

  return { dispute: formattedDispute, systemMessage: formatMessage(systemMsg) }
}

// ─── ADMIN: ASSIGN DISPUTE ─────────────────────────────────────────────────────

/**
 * Assign a dispute to a support team member or admin.
 */
export const assignDispute = async (adminId, adminRole, disputeMongoId, assigneeAdminId) => {
  const dispute = await Dispute.findById(disputeMongoId)
  if (!dispute) {
    const err = new Error('Dispute not found')
    err.statusCode = 404
    throw err
  }

  const assignee = await Admin.findById(assigneeAdminId)
  if (!assignee) {
    const err = new Error('Assignee not found')
    err.statusCode = 404
    throw err
  }

  const assigneeName = assignee.displayName || assignee.email?.split('@')[0] || 'Staff'
  const now = new Date()

  const systemMsg = await DisputeMessage.create({
    disputeId: dispute._id,
    sender: 'system',
    senderRole: SENDER_ROLE.SYSTEM,
    senderName: 'System',
    message: SYSTEM_MESSAGES.ASSIGNED(assigneeName),
    isSystemMessage: true,
    systemAction: SYSTEM_ACTION.ASSIGNED,
  })

  const updatedDispute = await Dispute.findByIdAndUpdate(
    dispute._id,
    {
      $set: {
        assignedTo: assigneeAdminId,
        lastMessage: SYSTEM_MESSAGES.ASSIGNED(assigneeName).substring(0, 300),
        lastMessageAt: now,
        lastMessageBy: 'system',
      },
    },
    { new: true }
  ).populate('assignedTo', 'displayName email role photoURL')

  const formattedDispute = formatDispute(updatedDispute)

  emitDisputeEvent('dispute:assigned', {
    disputeId: dispute._id.toString(),
    dispute: formattedDispute,
    assigneeId: assigneeAdminId,
    message: formatMessage(systemMsg),
  })

  return { dispute: formattedDispute, systemMessage: formatMessage(systemMsg) }
}