import React from 'react'
import { useAdminAuth } from '../../../../hooks/useAdminAuth'
import { adminApi } from '../../../../services/api'
import TodayTasksSubtab from './subtabs/TodayTasksSubtab'
import FutureTasksSubtab from './subtabs/FutureTasksSubtab'
import TaskDetailModalSubtab from './subtabs/TaskDetailModalSubtab'

const toUiTask = (task) => {
  const deliveryDate = task.deliveryDate ? new Date(task.deliveryDate) : null

  return {
    id: task.bookingId,
    badge: 'DELIVERY',
    type: 'delivery',
    time: deliveryDate && !Number.isNaN(deliveryDate.getTime())
      ? deliveryDate.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
      : 'Scheduled',
    date: deliveryDate && !Number.isNaN(deliveryDate.getTime())
      ? deliveryDate.toLocaleDateString('en-IN', { month: 'short', day: '2-digit' }).toUpperCase()
      : 'TBD',
    customer: task.customerName || 'Customer',
    seller: 'ListnRent Studio',
    buyer: task.customerName || 'Customer',
    address: task.address || 'Delivery address missing',
    location: task.address || 'Delivery address missing',
    item: task.listingTitle || 'Outfit',
    itemId: task.listingId ? `#${String(task.listingId).slice(-6).toUpperCase()}` : '#NA',
    rent: task.rentalAmount || 0,
    deposit: task.depositAmount || 0,
    pending: task.pendingAmount || 0,
    bookingId: task.bookingId,
    deliveryStatus: task.deliveryStatus,
    eventDate: task.eventDate || null,
    sellerPickupDate: task.sellerPickupDate || null,
    customerPickupDate: task.customerPickupDate || null,
    sellerReturnDate: task.sellerReturnDate || null,
    bucket: task.bucket,
    milestones: task.milestones || {},
    timeline: task.timeline || null,
    paymentStatus: task.paymentStatus,
  }
}

const DeliveriesTab = () => {
  const { admin } = useAdminAuth()
  const [activeTask, setActiveTask] = React.useState(null)
  const [tasks, setTasks] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [marking, setMarking] = React.useState(false)

  const loadAssignedTasks = React.useCallback(async () => {
    if (!admin?.email) {
      setLoading(false)
      return
    }

    try {
      const response = await adminApi.getAssignedTasksForDeliveryPartner(admin.email)
      const fetchedTasks = (response.tasks || []).map(toUiTask)

      setTasks(fetchedTasks)
      setError('')
    } catch (err) {
      setError(err.message || 'Failed to load deliveries')
    } finally {
      setLoading(false)
    }
  }, [admin?.email])

  React.useEffect(() => {
    loadAssignedTasks()
    const intervalId = window.setInterval(loadAssignedTasks, 20000)

    return () => window.clearInterval(intervalId)
  }, [loadAssignedTasks])

  const todayTasks = tasks.filter((task) => task.bucket === 'today')
  const futureTasks = tasks.filter((task) => task.bucket === 'future')
  const activeCount = todayTasks.length + futureTasks.length

  const handleMarkMilestone = async (bookingId, action) => {
    if (!bookingId || !action) return

    setMarking(true)
    setError('')

    try {
      await adminApi.markDeliveryMilestone(bookingId, action)
      await loadAssignedTasks()
      setActiveTask(null)
    } catch (err) {
      setError(err.message || 'Failed to update task milestone')
    } finally {
      setMarking(false)
    }
  }

  return (
    <div className="mx-auto max-w-280 bg-transparent">
      <div className="mb-8 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-5xl font-bold leading-none text-teal-950 sm:text-6xl">Deliveries & Tasks</h1>
          <p className="mt-2 text-stone-600">Your schedule for Colaba, Mumbai</p>
        </div>
        <span className="rounded-full bg-teal-900 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">{activeCount} Active</span>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="mb-4 rounded-lg border border-stone-300 bg-stone-100 px-4 py-3 text-sm font-semibold text-stone-700">
          Loading assigned tasks...
        </div>
      )}

      <div className="mb-4 inline-flex border-b-2 border-[#b59d4b] pb-1">
        <h2 className="font-serif text-4xl font-semibold leading-none text-zinc-800">Today's Tasks</h2>
      </div>

      <TodayTasksSubtab tasks={todayTasks} onTaskSelect={setActiveTask} />

      <div className="mt-8 rounded-xl bg-[#e9e8df] p-6">
        <h3 className="font-serif text-4xl font-semibold leading-none text-zinc-800">Upcoming Schedule</h3>
        <FutureTasksSubtab tasks={futureTasks} onTaskSelect={setActiveTask} />
      </div>

      <TaskDetailModalSubtab
        task={activeTask}
        onClose={() => setActiveTask(null)}
        onMarkMilestone={handleMarkMilestone}
        marking={marking}
      />
    </div>
  )
}

export default DeliveriesTab
