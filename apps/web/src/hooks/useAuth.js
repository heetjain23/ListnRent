import { useContext, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import {
  signInWithGoogle,
  sendMagicLink,
  completeMagicLinkSignIn,
} from '../services/firebase'

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  const [error, setError] = useState(null)
  const [loadingAction, setLoadingAction] = useState(false)

  const clearError = () => setError(null)

  /**
   * Sign in with Google
   */
  const loginWithGoogle = async () => {
    setLoadingAction(true)
    setError(null)
    try {
      const userData = await signInWithGoogle()
      console.log('[Auth] Google login successful:', userData)
      return userData
    } catch (err) {
      const errorMsg = err.message || 'Google login failed'
      setError(errorMsg)
      throw err
    } finally {
      setLoadingAction(false)
    }
  }

  /**
   * Send magic link to email
   */
  const sendMagicLinkToEmail = async (email) => {
    setLoadingAction(true)
    setError(null)
    try {
      await sendMagicLink(email)
      console.log('[Auth] Magic link sent to:', email)
      return { success: true }
    } catch (err) {
      const errorMsg = err.message || 'Failed to send magic link'
      setError(errorMsg)
      throw err
    } finally {
      setLoadingAction(false)
    }
  }

  /**
   * Complete magic link sign in
   */
  const completeMagicLink = async (email) => {
    setLoadingAction(true)
    setError(null)
    try {
      const userData = await completeMagicLinkSignIn(email)
      console.log('[Auth] Magic link signin successful:', userData)
      return userData
    } catch (err) {
      const errorMsg = err.message || 'Magic link signin failed'
      setError(errorMsg)
      throw err
    } finally {
      setLoadingAction(false)
    }
  }

  return {
    // From context
    user: context.user,
    isAuthenticated: context.isAuthenticated,
    loading: context.loading,
    logout: context.logout,

    // Action states
    loadingAction,
    error,
    clearError,

    // Methods
    loginWithGoogle,
    sendMagicLinkToEmail,
    completeMagicLink,
  }
}

export default useAuth