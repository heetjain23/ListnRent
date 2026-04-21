import React from 'react'
import { useAdminAuth } from '../../hooks/useAdminAuth'

const DeliveryPartnerDeveloping = () => {
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
    <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-12 text-center max-w-2xl">
        <div className="text-8xl mb-6 animate-bounce">🚚</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Delivery Partner Dashboard</h1>
        <p className="text-xl text-gray-600 mb-8">We are building an amazing dashboard tailored specifically for delivery partners.</p>
        
        <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-8">
          <p className="text-green-900 font-semibold mb-2">🔄 Coming Soon</p>
          <p className="text-green-700 text-sm">We're working hard to make this the best experience for you. Please check back soon!</p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-600 font-semibold">Status: In Development</span>
        </div>

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
        >
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </div>
  )
}

export default DeliveryPartnerDeveloping
