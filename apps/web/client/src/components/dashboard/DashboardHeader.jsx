import React from 'react'

const DashboardHeader = ({ userName, performanceText, onAddNew }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 md:mb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-1 md:mb-2">
          Welcome back, {userName}.
        </h1>
        <p className="text-sm md:text-base text-[#666]">{performanceText}</p>
      </div>
      <button
        onClick={onAddNew}
        className="bg-[#004D40] text-white px-4 sm:px-6 py-2 rounded-lg font-medium hover:bg-[#003830] transition-colors whitespace-nowrap flex items-center gap-2 text-sm md:text-base"
      >
        <span>+</span>
        <span>Add New Item</span>
      </button>
    </div>
  )
}

export default DashboardHeader
