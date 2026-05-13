/**
 * disputeController.js  ─  User-facing dispute endpoints
 *
 * Follows the same pattern as cartController.js:
 *  - Thin controllers; all business logic lives in disputeService.js
 *  - successResponse / errorResponse from utils/helper.js
 *  - No direct DB calls here
 */

import { successResponse, errorResponse } from '../../utils/helper.js'
import * as disputeService from './disputeService.js'
import { SENDER_ROLE } from '@listnrent/shared/constants'

// ─── Helper ────────────────────────────────────────────────────────────────────

const parsePageOptions = (query) => ({
  page: Math.max(1, parseInt(query.page) || 1),
  limit: Math.min(50, Math.max(1, parseInt(query.limit) || 10)),
  status: query.status || undefined,
  sortBy: query.sortBy || 'lastMessageAt',
  sortOrder: query.sortOrder === 'asc' ? 'asc' : 'desc',
})

// ─── POST /api/disputes/create ─────────────────────────────────────────────────

/**
 * Create a new dispute for a booking.
 * Customer must own the booking.
 */
export const handleCreateDispute = async (req, res) => {
  try {
    const userId = req.user.uid
    const { bookingId, listingId, subject, message, category, disputeType } = req.body

    const result = await disputeService.createDispute(userId, {
      bookingId,
      listingId,
      subject,
      message,
      category,
      disputeType,
    })

    return successResponse(res, result, 201)
  } catch (error) {
    const code = error.statusCode || 500
    return errorResponse(res, error.message || 'Failed to create dispute', code)
  }
}

// ─── GET /api/disputes/my ─────────────────────────────────────────────────────

/**
 * Get all disputes raised by the authenticated customer (paginated).
 */
export const handleGetMyDisputes = async (req, res) => {
  try {
    const userId = req.user.uid
    const options = parsePageOptions(req.query)

    const result = await disputeService.getUserDisputes(userId, options)
    return successResponse(res, result)
  } catch (error) {
    return errorResponse(res, error.message || 'Failed to get disputes', 500)
  }
}

// ─── GET /api/disputes/:id ─────────────────────────────────────────────────────

/**
 * Get a single dispute (customer can only view their own).
 */
export const handleGetDisputeById = async (req, res) => {
  try {
    const userId = req.user.uid
    const { id } = req.params

    const dispute = await disputeService.getDisputeById(id, userId)
    return successResponse(res, { dispute })
  } catch (error) {
    const code = error.statusCode || 500
    return errorResponse(res, error.message || 'Failed to get dispute', code)
  }
}

// ─── GET /api/disputes/:id/messages ───────────────────────────────────────────

/**
 * Get paginated message thread for a dispute.
 * Marks unread messages as read after fetch.
 */
export const handleGetDisputeMessages = async (req, res) => {
  try {
    const userId = req.user.uid
    const { id } = req.params

    // Ownership check
    const dispute = await disputeService.getDisputeById(id, userId)

    const options = {
      page: Math.max(1, parseInt(req.query.page) || 1),
      limit: Math.min(50, Math.max(1, parseInt(req.query.limit) || 30)),
    }

    const result = await disputeService.getDisputeMessages(dispute._id.toString(), options)

    // Mark as read (fire-and-forget — don't block response)
    disputeService.markDisputeMessagesRead(dispute._id.toString(), userId).catch(() => {})

    return successResponse(res, result)
  } catch (error) {
    const code = error.statusCode || 500
    return errorResponse(res, error.message || 'Failed to get messages', code)
  }
}

// ─── POST /api/disputes/:id/message ───────────────────────────────────────────

/**
 * Customer sends a message in their dispute thread.
 */
export const handleSendUserMessage = async (req, res) => {
  try {
    const userId = req.user.uid
    const { id } = req.params
    const { message } = req.body

    // Verify ownership & get mongo ID
    const dispute = await disputeService.getDisputeById(id, userId)

    const result = await disputeService.sendDisputeMessage(
      userId,
      SENDER_ROLE.CUSTOMER,
      null,
      dispute._id.toString(),
      message,
    )

    return successResponse(res, result, 201)
  } catch (error) {
    const code = error.statusCode || 500
    return errorResponse(res, error.message || 'Failed to send message', code)
  }
}

// ─── POST /api/disputes/:id/confirm-resolved ──────────────────────────────────

/**
 * Customer confirms their issue is resolved → dispute CLOSED.
 */
export const handleConfirmResolved = async (req, res) => {
  try {
    const userId = req.user.uid
    const { id } = req.params

    const dispute = await disputeService.getDisputeById(id, userId)
    const result = await disputeService.confirmDisputeResolved(userId, dispute._id.toString())

    return successResponse(res, result)
  } catch (error) {
    const code = error.statusCode || 500
    return errorResponse(res, error.message || 'Failed to confirm resolution', code)
  }
}

// ─── POST /api/disputes/:id/reopen ────────────────────────────────────────────

/**
 * Customer says issue is NOT resolved → dispute REOPENED.
 */
export const handleReopenDispute = async (req, res) => {
  try {
    const userId = req.user.uid
    const { id } = req.params

    const dispute = await disputeService.getDisputeById(id, userId)
    const result = await disputeService.reopenDispute(userId, dispute._id.toString())

    return successResponse(res, result)
  } catch (error) {
    const code = error.statusCode || 500
    return errorResponse(res, error.message || 'Failed to reopen dispute', code)
  }
}