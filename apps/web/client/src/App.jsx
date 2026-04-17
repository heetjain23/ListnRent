import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from './context/AuthContext'
import { completeMagicLinkSignIn } from './services/firebase'
import ErrorBoundary from './components/ui/ErrorBoundary'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import PageLoadAnimation from './components/animations/PageLoadAnimation'
import AnimatedRoutes from './components/animations/AnimatedRoutes'

const CompleteMagicLink = () => {
  const [status, setStatus] = useState('loading') // loading, success, error
  const [error, setError] = useState(null)

  useEffect(() => {
    const completeSignIn = async () => {
      try {
        const savedEmail = localStorage.getItem('emailForSignIn')
        if (!savedEmail) {
          setStatus('error')
          setError('No email found. Please try signing in again.')
          return
        }

        // Complete the magic link sign-in
        await completeMagicLinkSignIn(savedEmail)
        setStatus('success')

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 2000)
      } catch (err) {
        setStatus('error')
        setError(err.message || 'Failed to complete sign-in. Link may have expired.')
      }
    }

    completeSignIn()
  }, [])

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-4 pt-20">
      <div className="w-full max-w-md text-center">
        {status === 'loading' && (
          <>
            <div className="text-5xl animate-spin mb-4">⏳</div>
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Completing Sign In</h2>
            <p className="text-[#666]">Securing your session, one moment please...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Welcome Back!</h2>
            <p className="text-[#666]">Redirecting to your dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Sign In Failed</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <a
              href="/login"
              className="inline-block px-6 py-2 bg-[#1A1A1A] text-white rounded-lg hover:bg-[#00342B] transition-colors"
            >
              ← Back to Login
            </a>
          </>
        )}
      </div>
    </div>
  )
}

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Toaster
            position="top-center"
            richColors
            theme="light"
            closeButton
            duration={4000}
          />
          <div className="flex flex-col min-h-screen bg-[#FAF7F2]">
            <Navbar />
            <main className="grow">
              <PageLoadAnimation>
                <AnimatedRoutes CompleteMagicLinkComponent={CompleteMagicLink} />
              </PageLoadAnimation>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App