import * as userService from './userService.js'
import { sanitizeString, sanitizeEmail, sanitizePhone, sanitizeObject } from '../../utils/sanitizer.js'

export const handleInitializeUser = async (req, res) => {
  try {
    const userId = req.user.uid
    const email = sanitizeEmail(req.user.email)
    const { displayName, photoURL } = req.body

    // Sanitize input
    const sanitized = sanitizeObject(
      { displayName, photoURL },
      { displayName: 'string', photoURL: 'string' }
    )

    const user = await userService.initializeUser(userId, email, sanitized)
    
    res.status(200).json({ message: 'User initialized successfully', user })
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to initialize user' })
  }
}

export const handleGetProfile = async (req, res) => {
  try {
    const userId = req.user.uid
    const email = sanitizeEmail(req.user.email)
    const user = await userService.getUserById(userId, email)
    res.status(200).json({ user })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(404).json({ message: error.message || 'User not found' })
  }
}

export const handleUpdateProfile = async (req, res) => {
  try {
    const userId = req.user.uid
    const { displayName, photoURL } = req.body

    if (!displayName && !photoURL) {
      return res.status(400).json({ message: 'No data to update' })
    }

    // Sanitize input
    const sanitized = sanitizeObject(
      { displayName, photoURL },
      { displayName: 'string', photoURL: 'string' }
    )

    const user = await userService.updateUserProfile(userId, sanitized)
    res.status(200).json({ message: 'Profile updated successfully', user })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ message: error.message || 'Failed to update profile' })
  }
}

export const handleUpdateDeliveryDetails = async (req, res) => {
  try {
    const userId = req.user.uid
    const { mobileNumber, deliveryAddress, landmark, pincode } = req.body

    if (!mobileNumber && !deliveryAddress && !landmark && !pincode) {
      return res.status(400).json({ message: 'No delivery details to update' })
    }

    // Sanitize input
    const sanitized = sanitizeObject(
      { mobileNumber, deliveryAddress, landmark, pincode },
      { mobileNumber: 'phone', deliveryAddress: 'string', landmark: 'string', pincode: 'string' }
    )

    const deliveryDetails = {
      ...(sanitized.mobileNumber && { mobileNumber: sanitized.mobileNumber }),
      ...(sanitized.deliveryAddress && { deliveryAddress: sanitized.deliveryAddress }),
      ...(sanitized.landmark && { landmark: sanitized.landmark }),
      ...(sanitized.pincode && { pincode: sanitized.pincode }),
    }

    const user = await userService.updateDeliveryDetails(userId, deliveryDetails)
    res.status(200).json({ message: 'Delivery details updated successfully', user })
  } catch (error) {
    console.error('Update delivery details error:', error)
    res.status(500).json({ message: error.message || 'Failed to update delivery details' })
  }
}

export const handleDeleteAccount = async (req, res) => {
  try {
    const userId = req.user.uid
    const result = await userService.deleteUserAccount(userId)
    res.status(200).json(result)
  } catch (error) {
    console.error('Delete account error:', error)
    res.status(500).json({ message: error.message || 'Failed to delete account' })
  }
}
