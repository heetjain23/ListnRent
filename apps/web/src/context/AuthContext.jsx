import React, { createContext, useState, useEffect } from 'react'
import { subscribeToAuthChanges, firebaseSignOut } from '../services/firebase'
import { usersApi } from '../services/api'

export const AuthContext = createContext(null)

/**
 * AuthProvider - Manages global auth state
 * Must wrap the entire app
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Subscribe to Firebase auth state changes
    const unsubscribe = subscribeToAuthChanges(async (authUser) => {
      // Store the full Firebase user object (has getIdToken method)
      setUser(authUser)
      setLoading(false)

      // Initialize user in database if they just logged in
      if (authUser) {
        try {
          const response = await usersApi.init({
            displayName: authUser.displayName,
            photoURL: authUser.photoURL,
          })
        } catch (error) {
          // Don't fail the whole auth flow if this fails
        }

        // Persist user info to localStorage
        localStorage.setItem(
          'auth_user',
          JSON.stringify({
            uid: authUser.uid,
            email: authUser.email,
            displayName: authUser.displayName,
            photoURL: authUser.photoURL,
          })
        )
      } else {
        localStorage.removeItem('auth_user')
        localStorage.removeItem('auth_token')
      }
    })

    return unsubscribe
  }, [])

  const logout = async () => {
    try {
      await firebaseSignOut()
      setUser(null)
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_token')
    } catch (error) {
      throw error
    }
  }

  const value = {
    user,
    loading,
    logout,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
