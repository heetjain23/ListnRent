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
      if (authUser) {
        // Store the Firebase token immediately
        if (authUser.token) {
          localStorage.setItem('auth_token', authUser.token)
        }

        try {
          // Initialize user in database if they just logged in
          await usersApi.init({
            displayName: authUser.displayName,
            photoURL: authUser.photoURL,
          })

          // Fetch the complete user profile from backend to get saved displayName
          try {
            const response = await usersApi.getProfile()
            // Extract user from response (could be response.user or response directly)
            const dbUser = response.user || response.data || response
            
            // Only use database displayName if it exists and is different from Firebase one
            // This ensures we always use the most recently saved name in the database
            if (dbUser && dbUser.displayName) {
              const mergedUser = {
                ...authUser,
                displayName: dbUser.displayName,
                photoURL: dbUser.photoURL || authUser.photoURL,
              }

              setUser(mergedUser)

              // Persist merged user info to localStorage
              localStorage.setItem(
                'auth_user',
                JSON.stringify({
                  uid: mergedUser.uid,
                  email: mergedUser.email,
                  displayName: mergedUser.displayName,
                  photoURL: mergedUser.photoURL,
                })
              )
            } else {
              // Fallback if database displayName is empty
              setUser(authUser)
              localStorage.setItem(
                'auth_user',
                JSON.stringify({
                  uid: authUser.uid,
                  email: authUser.email,
                  displayName: authUser.displayName,
                  photoURL: authUser.photoURL,
                })
              )
            }
          } catch (err) {
            // If profile fetch fails, use Firebase user but still store it
            console.warn('Failed to fetch user profile:', err)
            setUser(authUser)
            localStorage.setItem(
              'auth_user',
              JSON.stringify({
                uid: authUser.uid,
                email: authUser.email,
                displayName: authUser.displayName,
                photoURL: authUser.photoURL,
              })
            )
          }
        } catch (error) {
          // Don't fail the whole auth flow if init fails
          console.warn('Failed to initialize user:', error)
          setUser(authUser)
          localStorage.setItem(
            'auth_user',
            JSON.stringify({
              uid: authUser.uid,
              email: authUser.email,
              displayName: authUser.displayName,
              photoURL: authUser.photoURL,
            })
          )
        }
      } else {
        setUser(null)
        localStorage.removeItem('auth_user')
        localStorage.removeItem('auth_token')
      }

      setLoading(false)
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
