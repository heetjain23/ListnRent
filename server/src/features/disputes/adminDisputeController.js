/**
 * adminDisputeController.js  ─  Admin/Staff dispute endpoints
 *
 * All handlers here require `req.admin` (set by requireDisputeStaffAccess).
 * Business logic lives in disputeService.js.
 */

import { successResponse, errorResponse } from '../../utils/helper.js'
import * as disputeService from './disputeService.js'
import { adminRoleToSenderRole } from '@listnrent/shared/constants'

// ─── Helper ────────────────────────────────────────────────────────────────────

const parseAdminPageOptions = (query) => ({
  page: Math.max(1, parseInt(query.page) || 1),
  limit: Math.min(50, Math.max(1, parseInt(query.limit) || 15)),
  status: query.status || undefined,
  priority: query.priority || undefined,
  category: query.category || undefined,
  assignedTo: query.assignedTo || undefined,
  assigned: query.assigned || undefined,
  me: query.me || undefined,
  reopened: query.reopened || undefined,
  search: query.search?.trim() || undefined,
  sortBy: query.sortBy || 'lastMessageAt',
  sortOrder: query.sortOrder === 'asc' ? 'asc' : 'desc',
})

export const handleAdminGetDisputeMetrics = async (req, res) => {
  try {
    const result = await disputeService.getDisputeMetricsAdmin(req.admin?._id?.toString?.() || null)
    return successResponse(res, result)
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to get dispute metrics', 500)
  }
}

// ─── GET /api/admin/disputes ───────────────────────────────────────────────────

/**
 * Get all disputes with full filtering/sorting/pagination.
 */
export const handleAdminGetAllDisputes = async (req, res) => {
  try {
    const options = parseAdminPageOptions(req.query)
    const result = await disputeService.getAllDisputesAdmin(options)
    return successResponse(res, result)
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to get disputes', 500)
  }
}

// ─── GET /api/admin/disputes/:id ──────────────────────────────────────────────

/**
 * Get a single dispute (no ownership restriction for staff).
 */
export const handleAdminGetDisputeById = async (req, res) => {
  try {
    const { id } = req.params
    // No userId passed → ownership check skipped for staff
    const dispute = await disputeService.getDisputeById(id)
    return successResponse(res, { dispute })
  } catch (error) {
    const code = error.statusCode || 500
    return errorResponse(res, error.message || 'Failed to get dispute', code)
  }
}

// ─── GET /api/admin/disputes/:id/messages ─────────────────────────────────────

/**
 * Get paginated message thread for a dispute (staff view).
 * Marks staff unread as read after fetch.
 */
export const handleAdminGetDisputeMessages = async (req, res) => {
  try {
    const { id } = req.params

    const dispute = await disputeService.getDisputeById(id)

    const options = {
      page: Math.max(1, parseInt(req.query.page) || 1),
      limit: Math.min(50, Math.max(1, parseInt(req.query.limit) || 30)),
    }

    const result = await disputeService.getDisputeMessages(dispute._id.toString(), options)

    // Mark staff pool unread as read
    disputeService.markDisputeMessagesRead(dispute._id.toString(), 'staff').catch(() => {})

    return successResponse(res, result)
  } catch (error) {
    const code = error.statusCode || 500
    return errorResponse(res, error.message || 'Failed to get messages', code)
  }
}

// ─── POST /api/admin/disputes/:id/message ─────────────────────────────────────

/**
 * Staff/admin sends a message in a dispute thread.
 */
export const handleAdminSendMessage = async (req, res) => {
  try {
    const { id } = req.params
    const { message } = req.body
    const admin = req.admin

    const dispute = await disputeService.getDisputeById(id)

    const senderRole = adminRoleToSenderRole(admin.role)

    const result = await disputeService.sendDisputeMessage(
      admin._id.toString(),
      senderRole,
      admin.role,
      dispute._id.toString(),
      message,
    )

    return successResponse(res, result, 201)
  } catch (error) {
    const code = error.statusCode || 500
    return errorResponse(res, error.message || 'Failed to send message', code)
  }
}

// ─── PATCH /api/admin/disputes/:id/status ─────────────────────────────────────

/**
 * Change dispute status (with transition validation).
 */
export const handleAdminUpdateStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const admin = req.admin

    const dispute = await disputeService.getDisputeById(id)

    const result = await disputeService.updateDisputeStatus(
      admin._id.toString(),
      admin.role,
      dispute._id.toString(),
      status,
    )

    return successResponse(res, result)
  } catch (error) {
    const code = error.statusCode || 500
    return errorResponse(res, error.message || 'Failed to update status', code)
  }
}

// ─── PATCH /api/admin/disputes/:id/resolve ────────────────────────────────────

/**
 * Mark dispute as resolved — sends confirmation prompt to customer.
 */
export const handleAdminMarkResolved = async (req, res) => {
  try {
    const { id } = req.params
    const admin = req.admin

    const dispute = await disputeService.getDisputeById(id)

    const result = await disputeService.markDisputeResolved(
      admin._id.toString(),
      admin.role,
      dispute._id.toString(),
    )

    return successResponse(res, result)
  } catch (error) {
    const code = error.statusCode || 500
    return errorResponse(res, error.message || 'Failed to mark as resolved', code)
  }
}

// ─── PATCH /api/admin/disputes/:id/assign ─────────────────────────────────────

/**
 * Assign a dispute to a specific support/admin team member.
 */
export const handleAdminAssignDispute = async (req, res) => {
  try {
    const { id } = req.params
    const { assigneeId } = req.body
    const admin = req.admin

    const dispute = await disputeService.getDisputeById(id)

    const result = await disputeService.assignDispute(
      admin._id.toString(),
      admin.role,
      dispute._id.toString(),
      assigneeId,
    )

    return successResponse(res, result)
  } catch (error) {
    const code = error.statusCode || 500
    return errorResponse(res, error.message || 'Failed to assign dispute', code)
  }
}