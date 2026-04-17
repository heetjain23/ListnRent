import React from 'react'

/**
 * ErrorBoundary Component - Catches errors and displays error page
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-4 pt-20">
          <div className="w-full max-w-md text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">Something Went Wrong</h1>
            <p className="text-[#666] mb-6">
              An unexpected error occurred. Please try refreshing the page or returning home.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <details className="text-left mb-6 p-4 bg-red-50 rounded-lg text-sm text-red-600 max-h-32 overflow-auto">
                <summary className="cursor-pointer font-semibold mb-2">Error Details</summary>
                <pre className="whitespace-pre-wrap overflow-x-auto">{this.state.error?.toString()}</pre>
              </details>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-2 bg-[#1A1A1A] text-white rounded-lg hover:bg-[#00342B] transition-colors"
              >
                Go Home
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 border-2 border-[#1A1A1A] text-[#1A1A1A] rounded-lg hover:bg-[#F5F5F5] transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
