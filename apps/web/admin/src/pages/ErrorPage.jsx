import React from 'react'
import { useNavigate } from 'react-router-dom'

const ErrorPage = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-2xl">
        <div className="text-8xl mb-6">⚠️</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Page Not Found</h1>
        <p className="text-xl text-gray-600 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8">
          <p className="text-red-900 font-semibold mb-2">Error 404</p>
          <p className="text-red-700 text-sm">We couldn't find what you're looking for. Please go back and try again.</p>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition"
          >
            Go Back
          </button>
          <button
            onClick={() => navigate('/admin')}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

export default ErrorPage
