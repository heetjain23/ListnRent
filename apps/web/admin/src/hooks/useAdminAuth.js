import { useContext, useState } from 'react'
import { AdminAuthContext } from '../context/AdminAuthContext'
import { signInWithGoogle, sendMagicLink, completeMagicLinkSignIn } from '../services/firebase'

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext)

  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider')
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
   * Send magic link to email for admin login
   */
  const sendMagicLinkToEmail = async (email) => {
    setLoadingAction(true)
    setError(null)
    try {
      await sendMagicLink(email)
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
      await completeMagicLinkSignIn(email)
      return { success: true }
    } catch (err) {
      const errorMsg = err.message || 'Failed to sign in'
      setError(errorMsg)
      throw err
    } finally {
      setLoadingAction(false)
    }
  }

  return {
    ...context,
    loginWithGoogle,
    sendMagicLinkToEmail,
    completeMagicLink,
    loadingAction,
    error,
    clearError,
  }
}

