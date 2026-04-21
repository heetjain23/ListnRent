import express from 'express'
import {
  handleInitializeAdmin,
  handleAddAdmin,
  handleGetAllUsers,
  handleDeleteUser,
  handleGetAllAdmins,
  handleDeleteAdmin,
  handleUpdateAdminEmail,
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

export default router
