import express from 'express'
import { verifyFirebaseToken } from '../../middleware/authMiddleware.js'
import * as adminService from './adminService.js'
import {
  handleInitializeAdmin,
  handleAddAdmin,
  handleGetAllUsers,
  handleGetDashboardMetrics,
  handleGetRecentBookings,
  handleGetMarketplaceListings,
  handleUpdateMarketplaceListingVisibility,
  handleDeleteMarketplaceListing,
  handleDeleteUser,
  handleGetAllAdmins,
  handleDeleteAdmin,
  handleUpdateAdminEmail,
  handleGetAllDeliveryPartners,
  handleAddDeliveryPartner,
  handleUpdateDeliveryPartner,
  handleDeleteDeliveryPartner,
  handleToggleDeliveryPartnerStatus,
  handleGetDeliveryHandlingTasks,
  handleAssignDeliveryPartnerToBooking,
  handleUpdateDeliveryTaskStatus,
  handleGetAssignedTasksForDeliveryPartner,
  handleMarkDeliveryMilestone,
  handleGetDeliveryPartnerProfile,
  handleUpdateDeliveryPartnerProfile,
  handleGetAllSupportTeamMembers,
  handleAddSupportTeamMember,
  handleUpdateSupportTeamMember,
  handleDeleteSupportTeamMember,
  handleToggleSupportTeamMemberStatus,
} from './adminController.js'

const router = express.Router()

const requireAdminAccess = async (req, res, next) => {
  try {
    const email = req.user?.email

    if (!email) {
      return res.status(403).json({
        success: false,
        message: 'Admin email is required',
      })
    }

    const admin = await adminService.getAdminByEmail(email)

    if (!admin || admin.status !== 'active' || !['admin', 'super_admin'].includes(admin.role)) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to manage listings',
      })
    }

    req.admin = admin
    next()
  } catch (error) {
    console.error('Admin access check error:', error)
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify admin access',
    })
  }
}

// POST /api/admin/init - Initialize admin in database
router.post('/init', handleInitializeAdmin)

// Admin Routes
router.post('/add-admin', handleAddAdmin)
router.get('/list', handleGetAllAdmins)
router.delete('/admin/:email', handleDeleteAdmin)
router.patch('/admin-email/:email', handleUpdateAdminEmail)

// Users Routes
router.get('/users', handleGetAllUsers)
router.delete('/users/:id', handleDeleteUser)

// Dashboard Routes
router.get('/dashboard-metrics', handleGetDashboardMetrics)
router.get('/dashboard/recent-bookings', handleGetRecentBookings)

// Marketplace Routes
router.get('/listings', verifyFirebaseToken, requireAdminAccess, handleGetMarketplaceListings)
router.patch('/listings/:id/visibility', verifyFirebaseToken, requireAdminAccess, handleUpdateMarketplaceListingVisibility)
router.delete('/listings/:id', verifyFirebaseToken, requireAdminAccess, handleDeleteMarketplaceListing)

// Delivery Partners Routes
router.get('/delivery-partners', handleGetAllDeliveryPartners)
router.post('/delivery-partners', handleAddDeliveryPartner)
router.patch('/delivery-partners/:id', handleUpdateDeliveryPartner)
router.delete('/delivery-partners/:id', handleDeleteDeliveryPartner)
router.patch('/delivery-partners/:id/status', handleToggleDeliveryPartnerStatus)
router.get('/delivery-partners/:email/tasks', handleGetAssignedTasksForDeliveryPartner)
router.get('/delivery-handling/tasks', handleGetDeliveryHandlingTasks)
router.post('/delivery-handling/:bookingId/assign', handleAssignDeliveryPartnerToBooking)
router.patch('/delivery-handling/:bookingId/status', handleUpdateDeliveryTaskStatus)
router.patch('/delivery-handling/:bookingId/milestone', handleMarkDeliveryMilestone)
router.get('/delivery-partners/profile/:email', handleGetDeliveryPartnerProfile)
router.patch('/delivery-partners/profile/:email', handleUpdateDeliveryPartnerProfile)

// Support Team Routes
router.get('/support-team', handleGetAllSupportTeamMembers)
router.post('/support-team', handleAddSupportTeamMember)
router.patch('/support-team/:id', handleUpdateSupportTeamMember)
router.delete('/support-team/:id', handleDeleteSupportTeamMember)
router.patch('/support-team/:id/status', handleToggleSupportTeamMemberStatus)

export default router
