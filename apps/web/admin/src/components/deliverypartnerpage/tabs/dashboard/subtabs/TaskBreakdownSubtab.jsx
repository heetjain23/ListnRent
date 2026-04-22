import React from 'react'

const breakdown = [
  { label: 'Pickup', percent: 35 },
  { label: 'Delivery', percent: 45 },
  { label: 'Return', percent: 20 },
]

const TaskBreakdownSubtab = () => {
  return (
    <div className="mt-4 rounded-xl border bg-[#f5f4e8] p-4">
      <h3 className="text-3xl font-semibold leading-none text-zinc-800">Task Type Breakdown</h3>

      <div className="mt-4 grid gap-3">
        {breakdown.map((item) => (
          <div key={item.label} className="grid grid-cols-[90px_1fr_50px] items-center gap-2">
            <span className="text-sm font-semibold text-zinc-700">{item.label}</span>
            <div className="h-2 overflow-hidden rounded-full bg-stone-300">
              <div className="h-full rounded-full bg-teal-900" style={{ width: `${item.percent}%` }} />
            </div>
            <span className="text-sm font-bold text-zinc-800">{item.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TaskBreakdownSubtab
