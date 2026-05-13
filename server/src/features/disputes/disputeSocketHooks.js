/**
 * disputeSocketHooks.js
 *
 * Realtime event layer for the dispute system.
 *
 * Architecture decision: we keep socket emission decoupled from the service
 * layer via this thin module. The service calls `emitDisputeEvent(...)` and
 * the actual IO reference is resolved at runtime from the shared socketServer.
 *
 * This means:
 *  - Service is testable without a live socket server
 *  - Socket namespace is extensible (e.g. /disputes namespace later)
 *  - All dispute socket events are defined in ONE place
 *
 * ── Socket Room Conventions ───────────────────────────────────────────────────
 *
 * Customer rooms   →  user:{firebaseUid}    (reuses existing pattern)
 * Staff pool room  →  staff:disputes        (all support_team/admin/super_admin)
 * Dispute thread   →  dispute:{disputeMongoId}   (joined on open)
 *
 * ── Events emitted ────────────────────────────────────────────────────────────
 *
 *  dispute:created          → staff:disputes, user:{raisedBy}
 *  dispute:new_message      → dispute:{id}, user:{raisedBy}, staff:disputes
 *  dispute:status_changed   → dispute:{id}, user:{raisedBy}, staff:disputes
 *  dispute:resolved_pending → dispute:{id}, user:{raisedBy}
 *  dispute:closed           → dispute:{id}, user:{raisedBy}, staff:disputes
 *  dispute:reopened         → dispute:{id}, user:{raisedBy}, staff:disputes
 *  dispute:assigned         → dispute:{id}, user:{assigneeId}, staff:disputes
 */

import { getIO } from '../../socket/socketServer.js'
import Admin from '../admin/Admin.js'
import { STAFF_ROLES } from '@listnrent/shared/constants'

/**
 * Emit a dispute-related socket event to all relevant rooms.
 *
 * @param {string} event - socket event name
 * @param {object} payload - data to emit
 */
export const emitDisputeEvent = (event, payload) => {
  try {
    const io = getIO()
    if (!io) {
      // Socket server not yet initialized (e.g. during tests) — silently skip
      return
    }

    const { disputeId, dispute } = payload

    // Always broadcast to the dispute thread room
    if (disputeId) {
      io.to(`dispute:${disputeId}`).emit(event, payload)
    }

    // Broadcast to the raising customer's personal room
    if (dispute?.raisedBy) {
      io.to(`user:${dispute.raisedBy}`).emit(event, payload)
    }

    // Broadcast to staff pool room (all support/admin/super_admin)
    io.to('staff:disputes').emit(event, payload)

    // If dispute is assigned to a specific staff member, also emit to their room
    if (dispute?.assignedTo) {
      const assigneeId = dispute.assignedTo?._id?.toString?.() || dispute.assignedTo?.toString?.()
      if (assigneeId) {
        io.to(`user:${assigneeId}`).emit(event, payload)
      }
    }
  } catch (err) {
    // Non-fatal: socket errors must never crash the API request
    console.error('[DisputeSocket] Emit error:', err.message)
  }
}

/**
 * Register dispute-specific socket event handlers on a connected socket.
 * Called from socketServer.js `io.on('connection', ...)`.
 *
 * Handlers added here:
 *  - join:dispute   → socket joins the dispute thread room
 *  - leave:dispute  → socket leaves the dispute thread room
 *
 * @param {Socket} socket - authenticated Socket.IO socket instance
 * @param {string} uid    - Firebase UID of authenticated user
 */
export const registerDisputeSocketHandlers = (socket, uid) => {
  /**
   * Client joins a dispute thread room for real-time message delivery.
   * Server validates the user has access before allowing the join.
   */
  socket.on('join:dispute', async ({ disputeId } = {}) => {
    if (!disputeId) return

    try {
      // Lazy import to avoid circular dependency with service
      const { getDisputeById } = await import('./disputeService.js')

      const dispute = await getDisputeById(disputeId)
        .catch(() => null)

      if (!dispute) {
        socket.emit('error:dispute', { message: 'Dispute not found' })
        return
      }

      const isOwner = dispute.raisedBy === uid

      if (!isOwner) {
        const admin = await Admin.findOne({ email: socket.userEmail }).select('role status').lean()
        const isStaff = !!admin && admin.status === 'active' && STAFF_ROLES.includes(admin.role)

        if (!isStaff) {
          socket.emit('error:unauthorized', { message: 'Not authorized to join this dispute thread' })
          return
        }
      }

      socket.join(`dispute:${disputeId}`)
    } catch (err) {
      console.error('[DisputeSocket] join:dispute error:', err.message)
    }
  })

  socket.on('leave:dispute', ({ disputeId } = {}) => {
    if (!disputeId) return
    socket.leave(`dispute:${disputeId}`)
  })

  /**
   * Staff members join the shared staff pool room on connection.
   * The Admin role is available on the socket from auth middleware (future).
   * For now, the frontend is responsible for calling this after role detection.
   */
  socket.on('join:staff_disputes', () => {
    try {
      const email = socket.userEmail
      if (!email) {
        socket.emit('error:unauthorized', { message: 'Admin email required to join staff room' })
        return
      }

      Admin.findOne({ email }).lean().then((admin) => {
        if (!admin || admin.status !== 'active' || !STAFF_ROLES.includes(admin.role)) {
          socket.emit('error:unauthorized', { message: 'Insufficient permissions to join staff room' })
          return
        }

        socket.join('staff:disputes')
      }).catch((err) => {
        console.error('[DisputeSocket] staff room check failed:', err.message)
        socket.emit('error:unauthorized', { message: 'Failed to verify staff access' })
      })
    } catch (err) {
      console.error('[DisputeSocket] join:staff_disputes error:', err.message)
    }
  })

  socket.on('leave:staff_disputes', () => {
    socket.leave('staff:disputes')
  })
}