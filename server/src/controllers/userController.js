import * as userService from '../services/userService.js'

export const handleInitializeUser = async (req, res) => {
  try {
    const userId = req.user.uid
    const email = req.user.email
    const { displayName, photoURL } = req.body

    const user = await userService.initializeUser(userId, email, { displayName, photoURL })
    
    console.log('[UserController] User initialization successful:', user)
    res.status(200).json({ message: 'User initialized successfully', user })
  } catch (error) {
    console.error('[UserController] Initialize user error:', error)
    res.status(500).json({ message: error.message || 'Failed to initialize user' })
  }
}

export const handleGetProfile = async (req, res) => {
  try {
    const userId = req.user.uid
    const email = req.user.email
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

    const user = await userService.updateUserProfile(userId, req.body)
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

    const deliveryDetails = {
      ...(mobileNumber && { mobileNumber }),
      ...(deliveryAddress && { deliveryAddress }),
      ...(landmark && { landmark }),
      ...(pincode && { pincode }),
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
