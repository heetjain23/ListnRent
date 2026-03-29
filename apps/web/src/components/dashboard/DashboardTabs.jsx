import React from 'react'

const DashboardTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'listings', label: 'My Listings' },
    { id: 'orders', label: 'My Orders' },
    { id: 'rentals', label: 'My Rentals (Owner)' },
    { id: 'messages', label: 'Messages' },
    { id: 'settings', label: 'Settings' },
  ]

  return (
    <div className="border-b border-[#E8E0D5] mb-6 md:mb-8 flex overflow-x-auto">
      <div className="flex gap-4 md:gap-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`pb-4 font-medium transition-colors border-b-2 whitespace-nowrap text-xs sm:text-sm md:text-base ${
              activeTab === tab.id
                ? 'text-[#004D40] border-b-[#004D40]'
                : 'text-[#999] border-b-transparent hover:text-[#666]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default DashboardTabs
