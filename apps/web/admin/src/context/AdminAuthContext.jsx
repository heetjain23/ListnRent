import React, { createContext, useState, useEffect } from 'react'
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'
import { adminApi } from '../services/api'

export const AdminAuthContext = createContext(null)

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [shouldRedirectToClient, setShouldRedirectToClient] = useState(false)
  const auth = getAuth()

  useEffect(() => {
    // Subscribe to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setError(null)
        
        if (firebaseUser) {
          // Initialize/verify admin in database
          try {
            const response = await adminApi.init({
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
            })

            // Check if user should be redirected to client app
            if (response.shouldRedirectToClient) {
              console.log('[AdminAuth] User is not registered, initiating redirect to client app...')
              setShouldRedirectToClient(true)
              // Keep the user signed in via Firebase - don't sign out
              // The client app will recognize the Firebase auth and auto-login
              setAdmin(null)
              localStorage.removeItem('admin_user')
              
              // Get the current Firebase user's ID token to pass to client app
              const idToken = await firebaseUser.getIdToken(true)
              console.log('[AdminAuth] Obtained ID token for redirect')
              
              // Store redirect flag and user info for client app
              const clientRedirectData = {
                fromAdminPanel: true,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                idToken: idToken,
              }
              sessionStorage.setItem('clientRedirectData', JSON.stringify(clientRedirectData))
              console.log('[AdminAuth] Stored redirect data with ID token')
              
              // Redirect to client app with token in URL
              setTimeout(() => {
                const clientUrl = import.meta.env.VITE_CLIENT_APP_URL || 'http://localhost:5173'
                const params = new URLSearchParams({
                  redirected: 'true',
                  token: idToken,
                  displayName: firebaseUser.displayName || '',
                  photoURL: firebaseUser.photoURL || '',
                })
                const redirectUrl = `${clientUrl}?${params.toString()}`
                console.log('[AdminAuth] Redirecting to:', clientUrl)
                window.location.href = redirectUrl
              }, 1500)
              return
            }

            if (!response.success) {
              throw new Error(response.message || 'Not authorized as admin')
            }

            const adminData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: response.admin?.displayName || firebaseUser.displayName,
              photoURL: response.admin?.photoURL || firebaseUser.photoURL,
              role: response.admin?.role,
              status: response.admin?.status,
              permissions: response.admin?.permissions,
            }

            setAdmin(adminData)
            localStorage.setItem('admin_user', JSON.stringify(adminData))
          } catch (err) {
            console.error('Admin verification error:', err)
            setError(err.message)
            setAdmin(null)
            localStorage.removeItem('admin_user')
            // Sign out if verification fails
            await signOut(auth)
          }
        } else {
          setAdmin(null)
          localStorage.removeItem('admin_user')
        }
      } catch (err) {
        console.error('Auth error:', err)
        setError(err.message)
        setAdmin(null)
        localStorage.removeItem('admin_user')
      } finally {
        setLoading(false)
      }
    })

    return unsubscribe
  }, [auth])

  const logout = async () => {
    try {
      await signOut(auth)
      setAdmin(null)
      localStorage.removeItem('admin_user')
      setShouldRedirectToClient(false)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        loading,
        error,
        isAuthenticated: !!admin,
        shouldRedirectToClient,
        logout,
        setError,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}
