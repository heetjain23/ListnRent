import express from 'express'
import { verifyFirebaseToken } from '../middleware/authMiddleware.js'
import {
  handleGetProfile,
  handleUpdateProfile,
  handleDeleteAccount,
} from '../controllers/userController.js'

const router = express.Router()

// GET /api/users/profile - Get user profile (protected)
router.get('/profile', verifyFirebaseToken, handleGetProfile)

// PATCH /api/users/profile - Update user profile (protected)
router.patch('/profile', verifyFirebaseToken, handleUpdateProfile)

// DELETE /api/users/account - Delete user account and all listings (protected)
router.delete('/account', verifyFirebaseToken, handleDeleteAccount)

export default router
