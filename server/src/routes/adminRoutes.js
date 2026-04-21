import express from 'express'
import {
  handleInitializeAdmin,
  handleGetAdminProfile,
  handleAddDeliveryPartner,
  handleGetDeliveryPartners,
  handleRemoveDeliveryPartner,
  handleAddAdmin,
  handleGetAdmins,
  handleUpdateAdminStatus,
  handleAddSupportTeamMember,
  handleGetSupportTeam,
  handleRemoveSupportTeamMember,
  handleUpdateAdminRole,
} from '../controllers/adminController.js'

const router = express.Router()

// POST /api/admin/init - Initialize admin in database
router.post('/init', handleInitializeAdmin)

// GET /api/admin/profile - Get admin profile
router.get('/profile', handleGetAdminProfile)

// Delivery Partner Routes
router.post('/delivery-partners', handleAddDeliveryPartner)
router.get('/delivery-partners', handleGetDeliveryPartners)
router.delete('/delivery-partners/:email', handleRemoveDeliveryPartner)

// Admin Routes
router.post('/add-admin', handleAddAdmin)
router.get('/admins', handleGetAdmins)
router.patch('/admin-status/:email', handleUpdateAdminStatus)

// Support Team Routes
router.post('/support-team', handleAddSupportTeamMember)
router.get('/support-team', handleGetSupportTeam)
router.delete('/support-team/:email', handleRemoveSupportTeamMember)

// Update Admin Role
router.patch('/update-role/:email', handleUpdateAdminRole)

export default router
