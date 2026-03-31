import User from '../models/User.js'

// Initialize user - ensure user exists in database (without overwriting existing data)
export const initializeUser = async (uid, email, additionalData = {}) => {
  try {
    console.log('[UserService] Initializing user:', { uid, email, additionalData })
    
    // First check if user already exists
    const existingUser = await User.findOne({ uid })
    
    if (existingUser) {
      // User exists - only update email if changed, don't overwrite other fields
      console.log('[UserService] User already exists, preserving existing data')
      const updateData = { email }
      
      // Only set displayName if it's not already set
      if (!existingUser.displayName && additionalData.displayName) {
        updateData.displayName = additionalData.displayName
      }
      
      // Only set photoURL if it's not already set
      if (!existingUser.photoURL && additionalData.photoURL) {
        updateData.photoURL = additionalData.photoURL
      }
      
      const user = await User.findOneAndUpdate(
        { uid },
        updateData,
        { returnDocument: 'after' }
      )
      
      console.log('[UserService] User updated (preserved existing data):', user)
      return user
    } else {
      // New user - create with all initial data
      console.log('[UserService] New user, creating with initial data')
      const user = await User.create({
        uid,
        email,
        ...additionalData,
      })
      
      console.log('[UserService] New user created:', user)
      return user
    }
  } catch (error) {
    console.error('[UserService] Error initializing user:', error)
    throw error
  }
}

// Get user by UID (Firebase UID) - creates if not exists
export const getUserById = async (uid, email = null) => {
  try {
    console.log('[UserService] Getting user by UID:', uid)
    
    let user = await User.findOne({ uid })
    
    // If user doesn't exist, create one
    if (!user) {
      console.log('[UserService] User not found, creating new user')
      user = await User.create({
        uid,
        email,
      })
      console.log('[UserService] New user created:', user)
    } else {
      console.log('[UserService] User found:', user)
    }
    
    return user
  } catch (error) {
    console.error('[UserService] Error getting user:', error)
    throw error
  }
}

// Update user profile
export const updateUserProfile = async (uid, data) => {
  try {
    const updateData = {}
    if (data.displayName) updateData.displayName = data.displayName
    if (data.photoURL) updateData.photoURL = data.photoURL

    const user = await User.findOneAndUpdate(
      { uid },
      updateData,
      { 
        returnDocument: 'after',
        upsert: true, // Create if doesn't exist
      }
    )

    if (!user) throw new Error('User not found')
    return user
  } catch (error) {
    throw error
  }
}

// Update user delivery details
export const updateDeliveryDetails = async (uid, deliveryDetails) => {
  try {
    console.log('[UserService] Updating delivery details for user:', uid)
    
    const user = await User.findOneAndUpdate(
      { uid },
      { deliveryDetails },
      { 
        returnDocument: 'after',
        upsert: true,
      }
    )

    if (!user) throw new Error('User not found')
    console.log('[UserService] Delivery details updated:', user.deliveryDetails)
    return user
  } catch (error) {
    console.error('[UserService] Error updating delivery details:', error)
    throw error
  }
}

// Delete user account and all their listings
export const deleteUserAccount = async (uid) => {
  try {
    // Import listing model to delete listings
    const { default: Listing } = await import('../models/Listing.js')
    
    // Delete all listings by this user
    await Listing.deleteMany({ userId: uid })
    
    // Delete the user
    const user = await User.findOneAndDelete({ uid })
    if (!user) throw new Error('User not found')
    
    return { message: 'Account and all listings deleted successfully' }
  } catch (error) {
    throw error
  }
}
