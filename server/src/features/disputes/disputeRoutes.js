/**
 * disputeRoutes.js  ─  Customer-facing dispute API
 *
 * Mount point: /api/disputes  (see app.js)
 * All routes require Firebase authentication.
 */

import express from 'express'
import { verifyFirebaseToken } from '../../middleware/authMiddleware.js'
import {
  handleCreateDispute,
  handleGetMyDisputes,
  handleGetDisputeById,
  handleGetDisputeMessages,
  handleSendUserMessage,
  handleConfirmResolved,
  handleReopenDispute,
} from './disputeController.js'
import {
  validateCreateDispute,
  validateSendMessage,
  validateDisputeIdParam,
} from './disputeValidation.js'

const router = express.Router()

// All dispute routes require a valid Firebase token
router.use(verifyFirebaseToken)

/**
 * POST /api/disputes/create
 * Create a new dispute for a booking.
 * Body: { bookingId, subject, message, category? }
 */
router.post('/create', validateCreateDispute, handleCreateDispute)

/**
 * GET /api/disputes/my
 * Get all disputes raised by the authenticated customer.
 * Query: { page?, limit?, status?, sortBy?, sortOrder? }
 */
router.get('/my', handleGetMyDisputes)

/**
 * GET /api/disputes/:id
 * Get a single dispute by Mongo ID or disputeId (DSP-YYYYMM-XXXX).
 * Customer can only view their own disputes.
 */
router.get('/:id', validateDisputeIdParam, handleGetDisputeById)

/**
 * GET /api/disputes/:id/messages
 * Get paginated messages for a dispute thread.
 * Query: { page?, limit? }
 * Also marks unread messages as read for this user.
 */
router.get('/:id/messages', validateDisputeIdParam, handleGetDisputeMessages)

/**
 * POST /api/disputes/:id/message
 * Customer sends a message in their dispute.
 * Body: { message }
 */
router.post('/:id/message', validateDisputeIdParam, validateSendMessage, handleSendUserMessage)

/**
 * POST /api/disputes/:id/confirm-resolved
 * Customer confirms issue is resolved → status CLOSED.
 */
router.post('/:id/confirm-resolved', validateDisputeIdParam, handleConfirmResolved)

/**
 * POST /api/disputes/:id/reopen
 * Customer says issue is NOT resolved → status REOPENED.
 */
router.post('/:id/reopen', validateDisputeIdParam, handleReopenDispute)

export default router