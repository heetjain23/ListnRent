import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../hooks/useAdminAuth'
import DeliveryPartnerManager from '../components/DeliveryPartnerManager'
import AdminManager from '../components/AdminManager'
import { toast } from 'sonner'

const Dashboard = () => {
  const navigate = useNavigate()
  const { admin, logout } = useAdminAuth()
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState('overview')

  const isAdmin = admin?.role === 'admin'
  const isDeliveryPartner = admin?.role === 'delivery_partner'

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

      {/* Navigation Tabs - Only show for Admins */}
      {isAdmin && (
        <nav className="bg-slate-700 border-b border-slate-600 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-4 font-semibold text-sm transition border-b-2 ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-300 hover:text-white'
                }`}
              >
                📊 Overview
              </button>
              <button
                onClick={() => setActiveTab('delivery-partners')}
                className={`py-4 px-4 font-semibold text-sm transition border-b-2 ${
                  activeTab === 'delivery-partners'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-300 hover:text-white'
                }`}
              >
                🚚 Delivery Partners
              </button>
              <button
                onClick={() => setActiveTab('admins')}
                className={`py-4 px-4 font-semibold text-sm transition border-b-2 ${
                  activeTab === 'admins'
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-300 hover:text-white'
                }`}
              >
                👥 Admins
              </button>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* DELIVERY PARTNER DASHBOARD */}
        {isDeliveryPartner && (
          <div className="bg-white rounded-lg shadow-lg p-12">
            <div className="text-center">
              <div className="text-8xl mb-6">🚚</div>
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Welcome, Delivery Partner!</h2>
              <p className="text-slate-600 text-lg mb-8">
                Hello, <strong>{admin?.displayName || admin?.email}</strong>
              </p>
              <p className="text-slate-500 mb-8">
                Role: <span className="inline-block bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold mt-2">
                  🚚 Delivery Partner
                </span>
              </p>

              {/* Coming Soon Section */}
              <div className="mt-12 p-8 bg-linear-to-r from-blue-50 to-indigo-50 border-2 border-dashed border-blue-300 rounded-lg inline-block">
                <div className="text-6xl mb-4">⏳</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Coming Soon</h3>
                <p className="text-slate-600 text-lg mb-6 max-w-md">
                  Exciting delivery partner features are being built and will be available soon!
                </p>
                <div className="space-y-3 text-left max-w-md mx-auto">
                  <p className="text-slate-600 flex items-center">
                    <span className="text-2xl mr-3">📦</span> Delivery Management
                  </p>
                  <p className="text-slate-600 flex items-center">
                    <span className="text-2xl mr-3">📊</span> Earnings & Analytics
                  </p>
                  <p className="text-slate-600 flex items-center">
                    <span className="text-2xl mr-3">🗺️</span> Route Optimization
                  </p>
                  <p className="text-slate-600 flex items-center">
                    <span className="text-2xl mr-3">⭐</span> Performance Tracking
                  </p>
                </div>
              </div>

              <div className="mt-8 text-slate-500 text-sm">
                <p>Stay tuned for updates!</p>
              </div>
            </div>
          </div>
        )}

        {/* ADMIN DASHBOARD */}
        {isAdmin && (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
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
                        👨‍💼 Admin
                      </span>
                    </p>
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

                {/* Quick Navigation */}
                <div className="mt-12">
                  <h3 className="text-2xl font-bold text-white mb-6">⚡ Quick Access</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button
                      onClick={() => setActiveTab('delivery-partners')}
                      className="bg-linear-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg shadow-md p-6 transition transform hover:scale-105"
                    >
                      <h3 className="text-lg font-semibold mb-2 text-left">🚚 Manage Delivery Partners</h3>
                      <p className="text-sm text-orange-100 text-left">Add, view, and manage delivery partner accounts</p>
                    </button>

                    <button
                      onClick={() => setActiveTab('admins')}
                      className="bg-linear-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg shadow-md p-6 transition transform hover:scale-105"
                    >
                      <h3 className="text-lg font-semibold mb-2 text-left">👥 Manage Admins</h3>
                      <p className="text-sm text-green-100 text-left">Add and manage admin accounts with different roles</p>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Delivery Partners Tab */}
            {activeTab === 'delivery-partners' && (
              <DeliveryPartnerManager />
            )}

            {/* Admins Tab */}
            {activeTab === 'admins' && (
              <AdminManager />
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default Dashboard

