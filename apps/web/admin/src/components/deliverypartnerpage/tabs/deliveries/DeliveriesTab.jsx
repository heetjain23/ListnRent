import React from 'react'
import TodayTasksSubtab from './subtabs/TodayTasksSubtab'
import FutureTasksSubtab from './subtabs/FutureTasksSubtab'
import TaskDetailModalSubtab from './subtabs/TaskDetailModalSubtab'

const DeliveriesTab = () => {
  const [activeTask, setActiveTask] = React.useState(null)

  return (
    <div className="mx-auto max-w-280 bg-transparent">
      <div className="mb-8 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-5xl font-bold leading-none text-teal-950 sm:text-6xl">Deliveries & Tasks</h1>
          <p className="mt-2 text-stone-600">Your schedule for Colaba, Mumbai</p>
        </div>
        <span className="rounded-full bg-teal-900 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">3 Active</span>
      </div>

      <div className="mb-4 inline-flex border-b-2 border-[#b59d4b] pb-1">
        <h2 className="font-serif text-4xl font-semibold leading-none text-zinc-800">Today's Tasks</h2>
      </div>

      <TodayTasksSubtab onTaskSelect={setActiveTask} />

      <div className="mt-8 rounded-xl bg-[#e9e8df] p-6">
        <h3 className="font-serif text-4xl font-semibold leading-none text-zinc-800">Upcoming Schedule</h3>
        <FutureTasksSubtab onTaskSelect={setActiveTask} />
      </div>

      <TaskDetailModalSubtab task={activeTask} onClose={() => setActiveTask(null)} />
    </div>
  )
}

export default DeliveriesTab
