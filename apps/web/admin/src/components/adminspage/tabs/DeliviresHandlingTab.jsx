import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import PageHeader from '../../shared/PageHeader'
import { adminApi } from '../../../services/api'

const formatDateLabel = (value) => {
  if (!value) return 'Unknown date'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown date'
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

const getTaskTimeLabel = (task) => {
  const startDate = task?.deliveryDate || task?.startDate
  const date = new Date(startDate)
  if (Number.isNaN(date.getTime())) return 'Scheduled'
  return date.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })
}

const TaskCard = ({ task, onAssign, onOpen }) => {
  const isUnassigned = task.deliveryStatus === 'unassigned'

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
                task.bucket === 'today' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {task.bucket === 'today' ? 'Today' : 'Future'}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${
                isUnassigned ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {isUnassigned ? 'Unassigned' : 'Assigned'}
            </span>
          </div>
          <h3 className="text-xl font-bold text-gray-900">{task.listingTitle}</h3>
          <p className="text-sm text-gray-600">
            {task.customerName} · {task.customerEmail || 'No email'}
          </p>
          <p className="text-sm text-gray-600">{task.address || 'Delivery address missing'}</p>
          <p className="text-sm text-gray-600">
            {formatDateLabel(task.deliveryDate)} at {getTaskTimeLabel(task)}
          </p>
          <p className="text-sm text-gray-500">
            Partner: {task.deliveryPartnerName || 'Not assigned yet'}
          </p>
        </div>

        <div className="flex flex-col gap-2 lg:items-end">
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Order Value</p>
            <p className="text-xl font-bold text-slate-900">Rs {Number(task.totalAmount || 0).toLocaleString('en-IN')}</p>
            <p className="text-xs text-slate-500">Pending Rs {Number(task.pendingAmount || 0).toLocaleString('en-IN')}</p>
          </div>
          <button
            type="button"
            onClick={onOpen}
            className="rounded-full border border-teal-900 px-4 py-2 text-sm font-bold text-teal-900 transition hover:bg-teal-900 hover:text-white"
          >
            View details
          </button>
          <button
            type="button"
            onClick={onAssign}
            className="rounded-full bg-teal-900 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800"
          >
            {isUnassigned ? 'Assign partner' : 'Reassign partner'}
          </button>
        </div>
      </div>
    </div>
  )
}

const AssignmentModal = ({ task, partners, onClose, onAssign, onUpdateStatus, loading }) => {
  const [selectedPartnerId, setSelectedPartnerId] = React.useState(task?.deliveryPartnerId || '')

  React.useEffect(() => {
    setSelectedPartnerId(task?.deliveryPartnerId || '')
  }, [task])

  if (!task) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 12 }}
          transition={{ duration: 0.18 }}
          onClick={(event) => event.stopPropagation()}
          className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">Delivery assignment</p>
              <h3 className="mt-1 text-3xl font-bold text-slate-900">{task.listingTitle}</h3>
              <p className="mt-2 text-sm text-slate-600">{task.customerName}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"
            >
              Close
            </button>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Delivery date</p>
              <p className="mt-1 text-lg font-bold text-slate-900">{formatDateLabel(task.deliveryDate)}</p>
              <p className="mt-3 text-xs font-bold uppercase tracking-wide text-slate-500">Address</p>
              <p className="mt-1 text-sm text-slate-700">{task.address || 'No delivery address on file'}</p>
              <p className="mt-3 text-xs font-bold uppercase tracking-wide text-slate-500">Current partner</p>
              <p className="mt-1 text-sm text-slate-700">{task.deliveryPartnerName || 'Not assigned'}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Assign delivery partner
                <select
                  value={selectedPartnerId}
                  onChange={(event) => setSelectedPartnerId(event.target.value)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-700"
                >
                  <option value="">Select partner</option>
                  {partners.map((partner) => (
                    <option key={partner.id} value={partner.id}>
                      {partner.name} {partner.phone ? `· ${partner.phone}` : ''}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={() => onAssign(task.bookingId, selectedPartnerId)}
                disabled={loading || !selectedPartnerId}
                className="mt-4 w-full rounded-full bg-teal-900 px-4 py-3 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Assigning...' : 'Confirm assignment'}
              </button>

              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => onUpdateStatus(task.bookingId, 'unassigned')}
                  className="rounded-full border border-slate-300 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-700 hover:bg-slate-100"
                >
                  Unassigned
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateStatus(task.bookingId, 'assigned')}
                  className="rounded-full border border-slate-300 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-700 hover:bg-slate-100"
                >
                  Assigned
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateStatus(task.bookingId, 'delivered')}
                  className="rounded-full border border-slate-300 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-700 hover:bg-slate-100"
                >
                  Completed
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

const DeliviresHandlingTab = () => {
  const [tasks, setTasks] = React.useState([])
  const [partners, setPartners] = React.useState([])
  const [activeSubTab, setActiveSubTab] = React.useState('unassigned')
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [assigning, setAssigning] = React.useState(false)
  const [activeTask, setActiveTask] = React.useState(null)
  const seenTaskIdsRef = React.useRef(new Set())

  const loadTasks = React.useCallback(async () => {
    try {
      const [tasksResponse, partnersResponse] = await Promise.all([
        adminApi.getDeliveryHandlingTasks(),
        adminApi.getDeliveryPartners(),
      ])

      const fetchedTasks = tasksResponse.tasks || []
      const fetchedPartners = partnersResponse.deliveryPartners || []

      const unassignedTasks = fetchedTasks.filter((task) => task.deliveryStatus === 'unassigned')
      const unseenTask = unassignedTasks.find((task) => !seenTaskIdsRef.current.has(task.bookingId))

      setTasks(fetchedTasks)
      setPartners(fetchedPartners)
      setError('')

      if (unseenTask) {
        setActiveTask(unseenTask)
      }

      unassignedTasks.forEach((task) => seenTaskIdsRef.current.add(task.bookingId))
    } catch (err) {
      setError(err.message || 'Failed to load delivery tasks')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadTasks()
    const intervalId = window.setInterval(loadTasks, 20000)

    return () => window.clearInterval(intervalId)
  }, [loadTasks])

  const handleAssign = async (bookingId, deliveryPartnerId) => {
    if (!bookingId || !deliveryPartnerId) return

    setAssigning(true)
    setError('')

    try {
      await adminApi.assignDeliveryPartnerToBooking(bookingId, deliveryPartnerId)
      await loadTasks()
      setActiveTask(null)
    } catch (err) {
      setError(err.message || 'Failed to assign delivery partner')
    } finally {
      setAssigning(false)
    }
  }

  const handleUpdateStatus = async (bookingId, deliveryStatus) => {
    if (!bookingId || !deliveryStatus) return

    setAssigning(true)
    setError('')

    try {
      await adminApi.updateDeliveryTaskStatus(bookingId, deliveryStatus)
      await loadTasks()
      setActiveTask(null)
    } catch (err) {
      setError(err.message || 'Failed to update delivery status')
    } finally {
      setAssigning(false)
    }
  }

  const visibleTasks = tasks.filter((task) => task.bucket === 'today' || task.bucket === 'future')
  const unassignedTasks = visibleTasks.filter((task) => task.statusGroup === 'unassigned')
  const assignedTasks = visibleTasks.filter((task) => task.statusGroup === 'assigned')
  const completedTasks = visibleTasks.filter((task) => task.statusGroup === 'completed')

  const activeTasks =
    activeSubTab === 'unassigned'
      ? unassignedTasks
      : activeSubTab === 'assigned'
        ? assignedTasks
        : completedTasks

  return (
    <>
      <PageHeader
        title="Delivery Handling"
        subtitle="Assign every paid booking to a delivery partner and track tasks by delivery date."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Today / future</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{visibleTasks.length}</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-amber-700">Unassigned</p>
            <p className="mt-1 text-3xl font-bold text-amber-900">{unassignedTasks.length}</p>
          </div>
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-red-700">Completed</p>
            <p className="mt-1 text-3xl font-bold text-red-900">{completedTasks.length}</p>
          </div>
        </div>
      </PageHeader>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-600 shadow-sm">Loading delivery tasks...</div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'unassigned', label: `Unassigned (${unassignedTasks.length})` },
              { key: 'assigned', label: `Assigned (${assignedTasks.length})` },
              { key: 'completed', label: `Delivery Completed (${completedTasks.length})` },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveSubTab(tab.key)}
                className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                  activeSubTab === tab.key
                    ? 'bg-teal-900 text-white'
                    : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-2xl font-bold text-slate-900 capitalize">{activeSubTab} Tasks</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-700">
                {activeTasks.length} items
              </span>
            </div>

            <div className="grid gap-4">
              {activeTasks.length > 0 ? (
                activeTasks.map((task) => (
                  <TaskCard
                    key={task.bookingId}
                    task={task}
                    onAssign={() => setActiveTask(task)}
                    onOpen={() => setActiveTask(task)}
                  />
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600">
                  No tasks found in this category.
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      <AssignmentModal
        task={activeTask}
        partners={partners}
        onClose={() => setActiveTask(null)}
        onAssign={handleAssign}
        onUpdateStatus={handleUpdateStatus}
        loading={assigning}
      />
    </>
  )
}

export default DeliviresHandlingTab