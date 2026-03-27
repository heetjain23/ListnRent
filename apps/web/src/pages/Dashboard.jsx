import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, logout, loading } = useAuth()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login')
    }
  }, [user, loading, navigate])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="text-4xl animate-spin mb-4">⏳</div>
          <p className="text-[#666]">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] pt-20 pb-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">Dashboard</h1>
          <p className="text-[#666]">Manage your RentFit account</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-sm border border-[#E8E0D5] p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Profile'}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#C8622A]"
                />
              )}
              <div>
                <h2 className="text-2xl font-bold text-[#1A1A1A]">
                  {user.displayName || 'Welcome!'}
                </h2>
                <p className="text-[#666] text-sm">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-[#E8E0D5] pt-4">
            <h3 className="font-semibold text-[#1A1A1A] mb-3 text-sm">Account Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[#999] text-xs uppercase tracking-wide">Email</p>
                <p className="text-[#1A1A1A] font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-[#999] text-xs uppercase tracking-wide">Display Name</p>
                <p className="text-[#1A1A1A] font-medium">{user.displayName || 'Not set'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Button
            onClick={() => navigate('/')}
            className="bg-[#1A1A1A] text-white hover:bg-[#C8622A] w-full justify-center"
            size="lg"
          >
            ← Browse Listings
          </Button>

          <Button
            onClick={() => navigate('/create')}
            className="bg-[#C8622A] text-white hover:bg-[#1A1A1A] w-full justify-center"
            size="lg"
          >
            + List New Outfit
          </Button>
        </div>

        {/* Logout */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-[#666] mb-3">
            Ready to sign out? You can always sign back in anytime.
          </p>
          <Button
            onClick={handleLogout}
            className="bg-red-600 text-white hover:bg-red-700"
            size="lg"
          >
            🚪 Sign Out
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
