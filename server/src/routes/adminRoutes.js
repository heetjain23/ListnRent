import express from 'express'
import { handleInitializeAdmin, handleGetAdminProfile } from '../controllers/adminController.js'

const router = express.Router()

// POST /api/admin/init - Initialize admin in database
router.post('/init', handleInitializeAdmin)

// GET /api/admin/profile - Get admin profile
router.get('/profile', handleGetAdminProfile)

export default router
