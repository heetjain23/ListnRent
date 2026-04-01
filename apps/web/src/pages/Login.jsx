import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../hooks/useAuth'
import AuthHeader from '../components/login/AuthHeader'
import ErrorMessage from '../components/login/ErrorMessage'
import GoogleAuthSection from '../components/login/GoogleAuthSection'
import AuthDivider from '../components/login/AuthDivider'
import EmailAuthSection from '../components/login/EmailAuthSection'

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
      toast.success('Welcome back! Redirecting to dashboard...')
      // Redirect happens automatically via useEffect when isAuthenticated changes
    } catch (err) {
      toast.error(err.message || 'Google login failed. Please try again.')
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
      toast.success(`Magic link sent to ${email}. Check your email!`)
      setStep('email-sent')
    } catch (err) {
      toast.error(err.message || 'Failed to send magic link. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-4 pt-20">
      <div className="w-full max-w-md">
        <AuthHeader />

        <ErrorMessage error={error} />

        {/* Initial Step */}
        {step === 'initial' && (
          <div className="space-y-4">
            <GoogleAuthSection
              onGoogleLogin={handleGoogleLogin}
              isLoading={isLoading}
              loadingAction={loadingAction}
            />

            <AuthDivider />

            <EmailAuthSection
              email={email}
              onEmailChange={setEmail}
              onSendMagicLink={handleSendMagicLink}
              isLoading={isLoading}
              loadingAction={loadingAction}
            />
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
