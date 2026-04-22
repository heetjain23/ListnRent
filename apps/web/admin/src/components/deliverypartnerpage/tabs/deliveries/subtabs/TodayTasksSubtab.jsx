import React from 'react'
import { motion } from 'framer-motion'
import { todayTasks } from '../../../mockData'
import { getBadgeClass } from './badgeStyles'
import { FaRoute } from "react-icons/fa6";

const RouteIcon = () => (
  <FaRoute size={18} className="text-teal-900" />
)

const TodayTasksSubtab = ({ onTaskSelect }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 gap-5 lg:grid-cols-2"
    >
      {todayTasks.map((task, index) => (
        <motion.button
          key={task.id}
          type="button"
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onTaskSelect(task)}
          className={`rounded-sm border border-[#e2e0d4] bg-[#f8f8f5] p-4 text-left shadow-sm transition hover:shadow-md ${
            index === 1 ? 'relative before:absolute before:bottom-0 before:left-0 before:top-0 before:w-0.75 before:bg-red-600 before:content-[""]' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={getBadgeClass(task.badge)}>{task.badge}</span>
            <span className="text-lg font-bold text-red-600">{task.time}</span>
          </div>

          <h3 className="mt-3 text-4xl font-semibold leading-none text-zinc-800">{task.customer}</h3>
          <p className="mt-2 text-base leading-tight text-stone-600">{task.address}</p>

          <div className="mt-3 flex items-center gap-3 rounded-lg bg-[#ecebe2] px-3 py-2.5">
            <div className={`h-9 w-9 rounded-md ${task.type === 'delivery' ? 'bg-[#5b1410]' : 'bg-zinc-900'}`} />
            <div>
              <p className="text-2xl font-semibold leading-none text-zinc-800">{task.item}</p>
              <p className="mt-1 text-sm text-stone-500">ID: {task.itemId}</p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-[1fr_auto] gap-3">
            <div className="rounded-none bg-teal-900 px-3 py-2 text-center text-sm font-bold text-white">
              {task.type === 'delivery' ? 'Mark Picked Up' : 'Start Journey'}
            </div>
            <div className="grid place-items-center bg-[#ecebe2] px-3 text-teal-900">
              <RouteIcon />
            </div>
          </div>
        </motion.button>
      ))}
    </motion.div>
  )
}

export default TodayTasksSubtab
