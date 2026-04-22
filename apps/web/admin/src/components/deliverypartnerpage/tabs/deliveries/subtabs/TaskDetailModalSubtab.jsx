import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const money = (value) => `Rs ${Number(value || 0).toLocaleString('en-IN')}`

const TaskDetailModalSubtab = ({ task, onClose }) => {
  const [frontImage, setFrontImage] = React.useState('')
  const [backImage, setBackImage] = React.useState('')

  if (!task) return null

  const handlePreview = (file, setter) => {
    if (!file) return
    setter(URL.createObjectURL(file))
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 14 }}
          transition={{ duration: 0.18 }}
          onClick={(event) => event.stopPropagation()}
          className="w-full max-w-4xl rounded-xl border border-stone-300 bg-stone-50 p-4 shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-3xl font-bold text-zinc-900">Task Detail</h3>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-stone-300 bg-stone-200 px-3 py-2 text-sm font-bold text-zinc-800"
            >
              Close
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Task Type</p>
              <p className="mt-1 font-semibold text-zinc-800">{task.badge || 'NA'}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Task ID</p>
              <p className="mt-1 font-semibold text-zinc-800">{task.id || 'NA'}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Seller</p>
              <p className="mt-1 font-semibold text-zinc-800">{task.seller || 'ListnRent Studio'}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Buyer</p>
              <p className="mt-1 font-semibold text-zinc-800">{task.buyer || task.customer || 'NA'}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Address Details</p>
              <p className="mt-1 font-semibold text-zinc-800">{task.address || task.location || 'NA'}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <div className="rounded-lg border border-stone-300 bg-stone-100 p-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Rent</p>
              <p className="mt-1 text-xl font-bold text-zinc-800">{money(task.rent)}</p>
            </div>
            <div className="rounded-lg border border-stone-300 bg-stone-100 p-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Deposit</p>
              <p className="mt-1 text-xl font-bold text-zinc-800">{money(task.deposit)}</p>
            </div>
            <div className="rounded-lg border border-stone-300 bg-stone-100 p-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-stone-500">Pending Amount</p>
              <p className="mt-1 text-xl font-bold text-zinc-800">{money(task.pending)}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <button type="button" className="rounded-lg bg-teal-900 px-3 py-2 text-sm font-bold text-white">Mark as Picked Up</button>
            <button type="button" className="rounded-lg bg-teal-900 px-3 py-2 text-sm font-bold text-white">Mark as Delivered</button>
            <button type="button" className="rounded-lg bg-teal-900 px-3 py-2 text-sm font-bold text-white">Mark as Returned</button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="grid gap-2 rounded-lg border border-dashed border-stone-400 bg-stone-100 p-3">
              <span className="text-xs font-bold uppercase text-stone-600">Front Image</span>
              <input
                type="file"
                accept="image/*"
                className="text-xs"
                onChange={(event) => handlePreview(event.target.files?.[0], setFrontImage)}
              />
              {frontImage && <img src={frontImage} alt="Front preview" className="h-40 w-full rounded-lg object-cover" />}
            </label>

            <label className="grid gap-2 rounded-lg border border-dashed border-stone-400 bg-stone-100 p-3">
              <span className="text-xs font-bold uppercase text-stone-600">Back Image</span>
              <input
                type="file"
                accept="image/*"
                className="text-xs"
                onChange={(event) => handlePreview(event.target.files?.[0], setBackImage)}
              />
              {backImage && <img src={backImage} alt="Back preview" className="h-40 w-full rounded-lg object-cover" />}
            </label>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default TaskDetailModalSubtab
