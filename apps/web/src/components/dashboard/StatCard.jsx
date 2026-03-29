import React from 'react'

const StatCard = ({ icon, label, value, period }) => {
  return (
    <div className="bg-white rounded-lg border border-[#E8E0D5] p-6 flex items-start gap-4">
      <div className="text-4xl">{icon}</div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[#999] text-xs uppercase tracking-wide font-medium">{label}</p>
          {period && <span className="text-xs text-[#666] bg-[#F5F5F5] px-2 py-1 rounded">{period}</span>}
        </div>
        <p className="text-3xl font-bold text-[#1A1A1A]">{value}</p>
      </div>
    </div>
  )
}

export default StatCard
