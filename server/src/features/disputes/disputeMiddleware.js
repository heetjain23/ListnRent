/**
 * disputeMiddleware.js
 *
 * Role & access guards specific to the dispute feature.
 * Follows the same pattern as requireAdminAccess in adminRoutes.js.
 */

import Admin from '../admin/Admin.js'
import { STAFF_ROLES, ADMIN_ROLES } from '@listnrent/shared/constants'

/**
 * requireDisputeStaffAccess
 *
 * Ensures the Firebase-authenticated user is an active support_team, admin,
 * or super_admin. Attaches `req.admin` for downstream use.
 *
 * Usage: verifyFirebaseToken, requireDisputeStaffAccess
 */
export const requireDisputeStaffAccess = async (req, res, next) => {
  try {
    const email = req.user?.email

    if (!email) {
      return res.status(403).json({
        success: false,
        message: 'Admin email is required',
      })
    }

    const admin = await Admin.findOne({ email }).lean()

    if (!admin) {
      return res.status(403).json({
        success: false,
        message: 'Admin account not found',
      })
    }

    if (admin.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account is inactive',
      })
    }

    if (!STAFF_ROLES.includes(admin.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to access disputes',
      })
    }

    req.admin = admin
    next()
  } catch (error) {
    console.error('[DisputeMiddleware] Staff access error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to verify access',
    })
  }
}

/**
 * requireDisputeAdminAccess
 *
 * Restricts to admin / super_admin only (not support_team).
 * Use for destructive or high-privilege actions.
 */
export const requireDisputeAdminAccess = async (req, res, next) => {
  try {
    const email = req.user?.email

    if (!email) {
      return res.status(403).json({
        success: false,
        message: 'Admin email is required',
      })
    }

    const admin = await Admin.findOne({ email }).lean()

    if (!admin || admin.status !== 'active' || !ADMIN_ROLES.includes(admin.role)) {
      return res.status(403).json({
        success: false,
        message: 'Admin or Super Admin access required',
      })
    }

    req.admin = admin
    next()
  } catch (error) {
    console.error('[DisputeMiddleware] Admin access error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to verify access',
    })
  }
}