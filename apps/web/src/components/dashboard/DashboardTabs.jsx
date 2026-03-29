import React from 'react'

const DashboardTabs = ({ activeTab, onTabChange, onLogout }) => {
  const tabs = [
    { id: 'personal', label: 'Personal Information' },
    { id: 'listings', label: 'My Listings' },
    { id: 'orders', label: 'My Orders' },
    { id: 'earnings', label: 'Earnings' },
    { id: 'rentals', label: 'My Rentals (Owner)' },
    { id: 'messages', label: 'Messages' },
    { id: 'settings', label: 'Settings' },
  ]

  return (
    <div className="border-b border-[#E8E0D5] mb-8 flex items-center justify-between overflow-x-auto">
      <div className="flex gap-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`pb-4 font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-[#004D40] border-b-[#004D40]'
                : 'text-[#999] border-b-transparent hover:text-[#666]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {onLogout && (
        <button
          onClick={onLogout}
          className="text-red-600 hover:text-red-700 font-medium text-sm transition-colors whitespace-nowrap ml-auto"
        >
          Log Out
        </button>
      )}
    </div>
  )
}

export default DashboardTabs
