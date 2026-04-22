import express from 'express'
import {
  handleInitializeAdmin,
  handleAddAdmin,
  handleGetAllUsers,
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
  handleGetDeliveryPartnerProfile,
  handleUpdateDeliveryPartnerProfile,
  handleGetAllSupportTeamMembers,
  handleAddSupportTeamMember,
  handleUpdateSupportTeamMember,
  handleDeleteSupportTeamMember,
  handleToggleSupportTeamMemberStatus,
} from '../controllers/adminController.js'

const router = express.Router()

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
router.get('/delivery-partners/profile/:email', handleGetDeliveryPartnerProfile)
router.patch('/delivery-partners/profile/:email', handleUpdateDeliveryPartnerProfile)

// Support Team Routes
router.get('/support-team', handleGetAllSupportTeamMembers)
router.post('/support-team', handleAddSupportTeamMember)
router.patch('/support-team/:id', handleUpdateSupportTeamMember)
router.delete('/support-team/:id', handleDeleteSupportTeamMember)
router.patch('/support-team/:id/status', handleToggleSupportTeamMemberStatus)

export default router
