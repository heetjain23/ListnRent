import React, { createContext, useState, useEffect } from 'react'
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'
import { adminApi } from '../services/api'

export const AdminAuthContext = createContext(null)

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
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
        logout,
        setError,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}
