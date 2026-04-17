import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { toast } from 'sonner'

const AdminLogin = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { loginWithGoogle, sendMagicLinkToEmail, loadingAction, error, clearError, isAuthenticated } = useAdminAuth()

  const [email, setEmail] = useState('')
  const [step, setStep] = useState('initial')
  const [isLoading, setIsLoading] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard'
      navigate(from)
    }
  }, [isAuthenticated, navigate, location])

  // Check if we're completing a magic link
  useEffect(() => {
    const savedEmail = localStorage.getItem('adminEmailForSignIn')
    if (savedEmail && location.search.includes('signInEmail')) {
      setEmail(savedEmail)
      setStep('completing-link')
    }
  }, [location])

  const handleGoogleLogin = async () => {
    try {
      clearError()
      setIsLoading(true)
      await loginWithGoogle()
      toast.success('Welcome! Redirecting to dashboard...')
      // Redirect happens automatically via useEffect when isAuthenticated changes
    } catch (err) {
      toast.error(err.message || 'Google login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMagicLink = async (e) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error('Please enter your email')
      return
    }

    try {
      clearError()
      setIsLoading(true)
      await sendMagicLinkToEmail(email)
      toast.success(`Magic link sent to ${email}. Check your email!`)
      setStep('email-sent')
    } catch (err) {
      toast.error(err.message || 'Failed to send magic link. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">ListnRent Admin</h1>
          <p className="text-slate-600">Sign in to continue to admin panel</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Initial Step */}
        {step === 'initial' && (
          <div className="space-y-6">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading || loadingAction}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-semibold py-3 px-4 rounded-full transition flex items-center justify-center gap-2"
            >
              {isLoading ? 'Signing in...' : '🔑 Continue with Google'}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#FAF7F2] text-slate-600">OR</span>
              </div>
            </div>

            <form onSubmit={handleSendMagicLink} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900 transition"
                  disabled={isLoading || loadingAction}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || loadingAction || !email.trim()}
                className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-semibold py-3 px-4 rounded-full transition"
              >
                {isLoading ? 'Sending...' : '✉️ Send Magic Link'}
              </button>
            </form>

            {/* Info Box */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>Admin Login:</strong> A secure magic link will be sent to your email. Only authorized admins and delivery partners can access this panel.
              </p>
            </div>
          </div>
        )}

        {/* Email Sent Step */}
        {step === 'email-sent' && (
          <div className="space-y-6">
            <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-center">
              <div className="text-4xl mb-3">📧</div>
              <p className="text-sm text-green-800 mb-4">
                We've sent a secure magic link to <strong>{email}</strong>
              </p>
              <p className="text-xs text-green-700 mb-4">
                Click the link in your email to sign in. The link is valid for 24 hours.
              </p>
              <button
                onClick={() => {
                  setStep('initial')
                  setEmail('')
                }}
                className="text-sm text-green-700 hover:text-green-900 font-semibold"
              >
                ← Use different email
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-slate-600 mt-8">
          Only authorized admins and delivery partners can access this panel
        </p>
      </div>
    </div>
  )
}

export default AdminLogin
