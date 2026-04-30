import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAdminAuth } from '../../../hooks/useAdminAuth'
import { ROLES } from '../../../utils/permissions'

const Sidebar = ({ isOpen, onClose, menuItems, currentTab, onTabChange }) => {
  const { admin, logout } = useAdminAuth()
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await logout()
    } catch (err) {
      console.error('Logout failed:', err)
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Get role badge info
  const getRoleBadge = () => {
    const roleMap = {
      [ROLES.SUPER_ADMIN]: { label: 'Super Admin', color: 'bg-red-600' },
      [ROLES.ADMIN]: { label: 'Admin', color: 'bg-blue-600' },
      [ROLES.DELIVERY_PARTNER]: { label: 'Delivery Partner', color: 'bg-green-600' },
      [ROLES.SUPPORT_TEAM]: { label: 'Support Team', color: 'bg-purple-600' },
    }
    return roleMap[admin?.role] || { label: admin?.role || 'User', color: 'bg-gray-600' }
  }

  const roleBadge = getRoleBadge()

  // Map tab names to actual tab keys
  const tabMap = {
    'Dashboard': 'dashboard',
    'Team Management': 'team',
    'Marketplace': 'marketplace',
    'Category Videos': 'category-videos',
    'Disputes': 'disputes',
    'Delivires Handling': 'deliviresHandling',
    'Finance': 'finance',
    'Analytics': 'analytics',
    'Settings': 'settings',
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-linear-to-b from-teal-900 to-teal-800 text-white transition-transform duration-300 z-50 lg:z-10 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 overflow-y-auto`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-teal-700">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold text-teal-900">A</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">ListnRent</h1>
              <p className="text-xs text-teal-200">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="py-6 px-4 space-y-2">
          {menuItems.length > 0 ? (
            menuItems.map((item) => {
              const tabKey = tabMap[item.label] || item.label.toLowerCase()
              return (
                <button
                  key={tabKey}
                  onClick={() => {
                    onTabChange(tabKey)
                    onClose()
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-left ${
                    currentTab === tabKey
                      ? 'bg-yellow-400 text-teal-900 font-semibold'
                      : 'text-teal-100 hover:bg-teal-700'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              )
            })
          ) : (
            <div className="px-4 py-3 text-teal-200 text-sm">
              <p>No menu items available for your role.</p>
            </div>
          )}
        </nav>

        {/* User Info - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-teal-700 bg-teal-900">
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-lg">
                👤
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white truncate">
                  {admin?.displayName || 'Admin'}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <span
                    className={`${roleBadge.color} text-white text-xs px-2 py-1 rounded-full font-semibold`}
                  >
                    {roleBadge.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full bg-teal-700 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
