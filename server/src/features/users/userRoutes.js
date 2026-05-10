import express from 'express'
import { verifyFirebaseToken } from '../../middleware/authMiddleware.js'
import {
  handleInitializeUser,
  handleGetProfile,
  handleUpdateProfile,
  handleUpdateDeliveryDetails,
  handleDeleteAccount,
} from './userController.js'

const router = express.Router()

// POST /api/users/init - Initialize/create user in database (protected)
router.post('/init', verifyFirebaseToken, handleInitializeUser)

// GET /api/users/profile - Get user profile (protected)
router.get('/profile', verifyFirebaseToken, handleGetProfile)

// PATCH /api/users/profile - Update user profile (protected)
router.patch('/profile', verifyFirebaseToken, handleUpdateProfile)

// PATCH /api/users/delivery-details - Update user delivery details (protected)
router.patch('/delivery-details', verifyFirebaseToken, handleUpdateDeliveryDetails)

// DELETE /api/users/account - Delete user account and all listings (protected)
router.delete('/account', verifyFirebaseToken, handleDeleteAccount)

export default router
