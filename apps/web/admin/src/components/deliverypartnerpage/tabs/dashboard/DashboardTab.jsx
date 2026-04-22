import React from 'react'
import SummaryCardsSubtab from './subtabs/SummaryCardsSubtab'
import TaskBreakdownSubtab from './subtabs/TaskBreakdownSubtab'

const DashboardTab = () => {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-5xl font-bold leading-none text-teal-950 sm:text-6xl">Overview</h1>
          <p className="mt-2 text-stone-600">Your performance metrics for today.</p>
        </div>
        <span className="rounded-full bg-teal-900 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">Online</span>
      </div>

      <SummaryCardsSubtab />
      <TaskBreakdownSubtab />
    </div>
  )
}

export default DashboardTab
