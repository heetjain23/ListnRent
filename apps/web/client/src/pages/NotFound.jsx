import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useSEO } from '../hooks/useSEO'

/**
 * NotFound Page - Displays 404 error
 */
const NotFound = () => {
  const navigate = useNavigate()

  useSEO({
    title: 'Page Not Found',
    description: 'The page you are looking for is not available on ListnRent.',
    canonicalPath: '/404',
    noIndex: true,
  })

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-4 pt-20">
      <div className="w-full max-w-md text-center">
        <div className="text-6xl font-bold text-[#C8622A] mb-4">404</div>
        <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">Page Not Found</h1>
        <p className="text-[#666] mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-[#1A1A1A] text-white rounded-lg hover:bg-[#00342B] transition-colors"
          >
            Go Home
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 border-2 border-[#1A1A1A] text-[#1A1A1A] rounded-lg hover:bg-[#F5F5F5] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotFound
