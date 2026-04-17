import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { toast } from 'sonner'

const Dashboard = () => {
  const navigate = useNavigate()
  const { admin, logout } = useAdminAuth()
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logout()
      toast.success('Logged out successfully')
      navigate('/login')
    } catch (err) {
      toast.error(err.message || 'Failed to logout')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <header className="bg-slate-800 shadow-lg border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-slate-400 mt-1">Welcome back, {admin?.displayName || admin?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="bg-red-600 hover:bg-red-700 disabled:bg-slate-500 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <div className="text-center">
            <div className="text-6xl mb-4">👋</div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Welcome to ListnRent Admin Panel</h2>
            <p className="text-slate-600 text-lg mb-6">
              Hello, <strong>{admin?.displayName || admin?.email}</strong>!
            </p>
            <p className="text-slate-500 mb-8">
              Role: <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold mt-2">
                {admin?.role === 'admin' ? '👨‍💼 Admin' : '🚚 Delivery Partner'}
              </span>
            </p>
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg inline-block">
              <p className="text-sm text-amber-800">
                ℹ️ Additional features and functionality coming soon!
              </p>
            </div>
          </div>
        </div>

        {/* Admin Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Account Status</h3>
              <span className="text-2xl">✓</span>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-600">
                <strong>Email:</strong> {admin?.email}
              </p>
              <p className="text-sm text-slate-600">
                <strong>Status:</strong> <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">{admin?.status}</span>
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Permissions</h3>
              <span className="text-2xl">🔐</span>
            </div>
            <div className="space-y-2">
              {admin?.permissions && admin.permissions.length > 0 ? (
                <div className="space-y-1">
                  {admin.permissions.slice(0, 3).map((perm, idx) => (
                    <p key={idx} className="text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded w-fit">
                      ✓ {perm.replace(/_/g, ' ')}
                    </p>
                  ))}
                  {admin.permissions.length > 3 && (
                    <p className="text-xs text-slate-500 mt-2">
                      +{admin.permissions.length - 3} more permissions
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No additional permissions</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">System Status</h3>
              <span className="text-2xl">📊</span>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-600">
                API Status: <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">Online</span>
              </p>
              <p className="text-sm text-slate-600">
                Database: <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">Connected</span>
              </p>
            </div>
          </div>
        </div>

        {/* Features Coming Soon */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <div className="bg-white rounded-lg shadow-md p-6 opacity-75">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">📊 Analytics & Reports</h3>
            <p className="text-sm text-slate-600 mb-4">View detailed reports and analytics about listings, bookings, and revenue.</p>
            <button disabled className="w-full bg-slate-300 text-slate-600 py-2 px-4 rounded-lg cursor-not-allowed">
              Coming Soon
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 opacity-75">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">👥 User Management</h3>
            <p className="text-sm text-slate-600 mb-4">Manage users, admins, and delivery partners in the system.</p>
            <button disabled className="w-full bg-slate-300 text-slate-600 py-2 px-4 rounded-lg cursor-not-allowed">
              Coming Soon
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 opacity-75">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">📋 Listings Management</h3>
            <p className="text-sm text-slate-600 mb-4">Review and manage all listings on the platform.</p>
            <button disabled className="w-full bg-slate-300 text-slate-600 py-2 px-4 rounded-lg cursor-not-allowed">
              Coming Soon
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 opacity-75">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">🚚 Delivery Management</h3>
            <p className="text-sm text-slate-600 mb-4">Track and manage deliveries across the platform.</p>
            <button disabled className="w-full bg-slate-300 text-slate-600 py-2 px-4 rounded-lg cursor-not-allowed">
              Coming Soon
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
