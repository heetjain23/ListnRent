/**
 * adminDisputeRoutes.js  ─  Staff/Admin dispute API
 *
 * Mount point: /api/admin/disputes  (add to adminRoutes.js)
 * All routes require Firebase auth + staff/admin role check.
 */

import express from 'express'
import { verifyFirebaseToken } from '../../middleware/authMiddleware.js'
import { requireDisputeStaffAccess, requireDisputeAdminAccess } from './disputeMiddleware.js'
import {
  handleAdminGetAllDisputes,
  handleAdminGetDisputeById,
  handleAdminGetDisputeMessages,
  handleAdminSendMessage,
  handleAdminUpdateStatus,
  handleAdminMarkResolved,
  handleAdminAssignDispute,
} from './adminDisputeController.js'
import {
  validateSendMessage,
  validateUpdateStatus,
  validateAssignDispute,
  validateDisputeIdParam,
} from './disputeValidation.js'

const router = express.Router()

// All admin dispute routes require Firebase token + at least support_team role
router.use(verifyFirebaseToken, requireDisputeStaffAccess)

/**
 * GET /api/admin/disputes
 * List all disputes with filtering, sorting, pagination.
 * Query: {
 *   page?, limit?,
 *   status?, priority?, category?, assignedTo?,
 *   search?,
 *   sortBy?, sortOrder?
 * }
 */
router.get('/', handleAdminGetAllDisputes)

/**
 * GET /api/admin/disputes/:id
 * Get a single dispute (full detail, no ownership restriction).
 */
router.get('/:id', validateDisputeIdParam, handleAdminGetDisputeById)

/**
 * GET /api/admin/disputes/:id/messages
 * Get paginated message thread.
 * Query: { page?, limit? }
 */
router.get('/:id/messages', validateDisputeIdParam, handleAdminGetDisputeMessages)

/**
 * POST /api/admin/disputes/:id/message
 * Staff/admin sends a message in the dispute thread.
 * Body: { message }
 */
router.post('/:id/message', validateDisputeIdParam, validateSendMessage, handleAdminSendMessage)

/**
 * PATCH /api/admin/disputes/:id/status
 * Change dispute status (with transition validation).
 * Body: { status }
 */
router.patch('/:id/status', validateDisputeIdParam, validateUpdateStatus, handleAdminUpdateStatus)

/**
 * PATCH /api/admin/disputes/:id/resolve
 * Mark dispute as resolved — sends confirmation prompt to customer.
 * Does NOT directly close; waits for customer confirmation.
 */
router.patch('/:id/resolve', validateDisputeIdParam, handleAdminMarkResolved)

/**
 * PATCH /api/admin/disputes/:id/assign
 * Assign dispute to a support/admin team member.
 * Body: { assigneeId }
 * Restricted to admin/super_admin.
 */
router.patch(
  '/:id/assign',
  validateDisputeIdParam,
  validateAssignDispute,
  requireDisputeAdminAccess, // override to admin-only for assignment
  handleAdminAssignDispute,
)

export default router