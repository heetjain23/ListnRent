import React from 'react'
import { useAdminAuth } from '../../hooks/useAdminAuth'

const SupportTeamDeveloping = () => {
  const { logout } = useAdminAuth()
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logout()
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-2xl">
        <div className="text-8xl mb-6 animate-bounce">🎧</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Support Team Dashboard</h1>
        <p className="text-xl text-gray-600 mb-8">We are building a comprehensive dashboard for our support team with all the tools you need.</p>
        
        <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 mb-8">
          <p className="text-purple-900 font-semibold mb-2">🔄 Coming Soon</p>
          <p className="text-purple-700 text-sm">We're working hard to make this the best experience for you. Please check back soon!</p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
          <span className="text-purple-600 font-semibold">Status: In Development</span>
        </div>

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
        >
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </div>
  )
}

export default SupportTeamDeveloping
