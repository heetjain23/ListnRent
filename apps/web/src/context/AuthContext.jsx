import React, { createContext, useState, useEffect } from 'react'
import { subscribeToAuthChanges, firebaseSignOut } from '../services/firebase'

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
    const unsubscribe = subscribeToAuthChanges((authUser) => {
      setUser(authUser)
      setLoading(false)

      // Persist user and token to localStorage
      if (authUser) {
        localStorage.setItem(
          'auth_user',
          JSON.stringify({
            uid: authUser.uid,
            email: authUser.email,
            displayName: authUser.displayName,
            photoURL: authUser.photoURL,
            token: authUser.token,
          })
        )
        localStorage.setItem('auth_token', authUser.token)
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
      console.error('Logout error:', error)
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
