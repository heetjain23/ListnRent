import React from 'react'

const DashboardHeader = ({ userName, performanceText, onAddNew }) => {
  return (
    <div className="flex items-start justify-between gap-4 mb-8">
      <div>
        <h1 className="text-4xl font-bold text-[#1A1A1A] mb-2">
          Welcome back, {userName}.
        </h1>
        <p className="text-[#666]">{performanceText}</p>
      </div>
      <button
        onClick={onAddNew}
        className="bg-[#004D40] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#003830] transition-colors whitespace-nowrap flex items-center gap-2"
      >
        <span>+</span>
        <span>Add New Item</span>
      </button>
    </div>
  )
}

export default DashboardHeader
