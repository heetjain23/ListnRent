import User from '../models/User.js'

// Initialize user - ensure user exists in database
export const initializeUser = async (uid, email, additionalData = {}) => {
  try {
    console.log('[UserService] Initializing user:', { uid, email, additionalData })
    
    const user = await User.findOneAndUpdate(
      { uid },
      {
        uid,
        email,
        ...additionalData,
      },
      { 
        returnDocument: 'after',
        upsert: true, // Create if doesn't exist
      }
    )

    console.log('[UserService] User initialized/updated in DB:', user)
    return user
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
