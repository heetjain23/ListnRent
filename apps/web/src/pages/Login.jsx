import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { loginWithGoogle, sendMagicLinkToEmail, loadingAction, error, clearError, isAuthenticated } = useAuth()

  const [email, setEmail] = useState('')
  const [step, setStep] = useState('initial') // initial, email-sent, completing-link
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
    const savedEmail = localStorage.getItem('emailForSignIn')
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
      // Redirect happens automatically via useEffect when isAuthenticated changes
    } catch (err) {
      console.error('Google login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMagicLink = async (e) => {
    e.preventDefault()
    if (!email.trim()) return

    try {
      clearError()
      setIsLoading(true)
      await sendMagicLinkToEmail(email)
      setStep('email-sent')
    } catch (err) {
      console.error('Magic link error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-4 pt-20">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">Welcome to RentFit</h1>
          <p className="text-sm text-[#666]">Sign in to continue browsing and renting ethnic wear</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Initial Step */}
        {step === 'initial' && (
          <div className="space-y-4">
            {/* Google Login */}
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading || loadingAction}
              className="w-full bg-white border-2 border-[#1A1A1A] text-blue-800 hover:bg-[#1A1A1A] hover:text-white"
              size="lg"
            >
              {isLoading ? 'Signing in...' : '🔑 Continue with Google'}
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-[#DDD]"></div>
              <span className="text-xs text-[#999] font-medium">OR</span>
              <div className="flex-1 h-px bg-[#DDD]"></div>
            </div>

            {/* Email Magic Link Form */}
            <form onSubmit={handleSendMagicLink} className="space-y-3">
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-[#1A1A1A] mb-2 uppercase tracking-wide">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading || loadingAction}
                  className="w-full px-4 py-3 border-2 border-[#E0E0E0] rounded-lg focus:outline-none focus:border-[#C8622A] text-sm disabled:opacity-50"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || loadingAction || !email.trim()}
                size="lg"
                className="w-full"
              >
                {isLoading ? 'Sending link...' : '✉️ Send Magic Link'}
              </Button>
            </form>

            {/* Info Box */}
            <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-700">
                <strong>Magic Link:</strong> We'll send you a secure link to sign in. No password needed!
              </p>
            </div>
          </div>
        )}

        {/* Email Sent Step */}
        {step === 'email-sent' && (
          <div className="space-y-4 text-center">
            <div className="mb-6 text-4xl">📬</div>
            <h2 className="text-xl font-bold text-[#1A1A1A]">Check Your Email</h2>
            <p className="text-sm text-[#666]">
              We've sent a sign-in link to <strong>{email}</strong>
            </p>
            <p className="text-xs text-[#999]">Click the link in the email to continue signing in.</p>

            <button
              onClick={() => {
                setStep('initial')
                setEmail('')
              }}
              className="text-sm text-[#C8622A] hover:text-[#1A1A1A] font-medium mt-4"
            >
              ← Try a different email
            </button>

            {/* Info Box */}
            <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-700">
                <strong>Tip:</strong> The link expires in 24 hours. Check your spam folder if you don't see it!
              </p>
            </div>
          </div>
        )}

        {/* Completing Link Step */}
        {step === 'completing-link' && (
          <div className="space-y-4 text-center">
            <div className="mb-6 text-4xl animate-spin">⏳</div>
            <h2 className="text-xl font-bold text-[#1A1A1A]">Completing Sign In...</h2>
            <p className="text-sm text-[#666]">One moment, we're signing you in securely.</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-[#999]">
          <p>By signing in, you agree to our Terms of Service</p>
        </div>
      </div>
    </div>
  )
}

export default Login
