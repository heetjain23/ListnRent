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

export default router
