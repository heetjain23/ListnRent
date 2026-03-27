import React from 'react'

const DashboardSidebar = ({ activeTab, onTabChange, onLogout }) => {
  const tabs = [
    { id: 'personal', label: 'Personal Information', icon: '👤' },
    { id: 'listings', label: 'My Listings', icon: '📋' },
    { id: 'orders', label: 'My Orders', icon: '📦' },
  ]

  return (
    <div className="w-full md:w-64 flex-shrink-0">
      <div className="bg-white rounded-lg border border-[#E8E0D5] overflow-hidden sticky top-24">
        {/* Sidebar Navigation */}
        <nav className="flex flex-col">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full px-6 py-4 text-left font-medium transition-colors flex items-center gap-3 ${
                activeTab === tab.id
                  ? 'bg-[#C8622A] text-white border-l-4 border-[#C8622A]'
                  : 'text-[#555] hover:bg-[#FAF7F2] border-l-4 border-transparent'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Divider */}
        <div className="h-px bg-[#E8E0D5]"></div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full px-6 py-4 text-left font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3"
        >
          <span className="text-lg">↪️</span>
          <span>Log Out</span>
        </button>
      </div>
    </div>
  )
}

export default DashboardSidebar
