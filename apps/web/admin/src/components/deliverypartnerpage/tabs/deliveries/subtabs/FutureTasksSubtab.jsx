import React from 'react'
import { motion } from 'framer-motion'
import { getBadgeClass } from './badgeStyles'

const FutureTasksSubtab = ({ tasks = [], onTaskSelect }) => {
  if (tasks.length === 0) {
    return (
      <div className="mt-5 rounded-lg border border-dashed border-stone-300 bg-[#f8f8f5] p-6 text-sm font-semibold text-stone-600">
        No upcoming deliveries scheduled.
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 grid gap-3">
      {tasks.map((task) => {
        const [month, day] = task.date.split(' ')

        return (
          <button
            key={task.id}
            type="button"
            onClick={() => onTaskSelect(task)}
            className="grid grid-cols-[60px_1fr_auto] items-center gap-3 border border-[#ebe8dc] bg-[#f8f8f5] px-3 py-3 text-left"
          >
            <div className="rounded-lg bg-[#ecebe2] py-2 text-center">
              <p className="text-[10px] font-bold uppercase text-stone-500">{month}</p>
              <p className="text-2xl font-bold leading-none text-teal-900">{day}</p>
            </div>

            <div>
              <span className={getBadgeClass(task.badge)}>{task.badge}</span>
              <h4 className="mt-2 text-xl font-semibold leading-tight text-zinc-800">{task.location}</h4>
              <p className="text-sm text-stone-600">{task.time} · {task.description}</p>
            </div>

            <span className="text-sm font-bold text-teal-900 underline">View Details</span>
          </button>
        )
      })}
    </motion.div>
  )
}

export default FutureTasksSubtab
