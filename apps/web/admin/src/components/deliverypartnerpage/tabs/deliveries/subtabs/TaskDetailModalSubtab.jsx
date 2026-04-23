import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const money = (value) => `Rs ${Number(value || 0).toLocaleString('en-IN')}`

const hasDateReached = (dateValue) => {
  if (!dateValue) return false
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return false
  date.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date.getTime() <= today.getTime()
}

const prettyDate = (dateValue) => {
  if (!dateValue) return 'scheduled date'
  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return 'scheduled date'
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const TaskDetailModalSubtab = ({ task, onClose, onMarkMilestone, marking = false }) => {
  const [frontImage, setFrontImage] = React.useState('')
  const [backImage, setBackImage] = React.useState('')

  if (!task) return null

  const handlePreview = (file, setter) => {
    if (!file) return
    setter(URL.createObjectURL(file))
  }

  const milestones = task.milestones || {}
  const isPickupDone = !!milestones.sellerPickupCompletedAt
  const isPaymentDone = task.paymentStatus === 'completed' || !!milestones.restPaymentCompletedAt
  const isBuyerDeliveryDone = !!milestones.buyerDeliveryCompletedAt
  const isBuyerPickupDone = !!milestones.buyerPickupCompletedAt
  const isSellerReturnDone = !!milestones.sellerReturnCompletedAt
  const isDepositReturned = !!milestones.depositReturnedAt

  const pickupDate = task.sellerPickupDate || task.deliveryDate || null
  const deliveryDate = task.eventDate || null
  const buyerPickupDate = task.customerPickupDate || task.sellerReturnDate || null
  const sellerReturnDate = task.sellerReturnDate || task.customerPickupDate || null

  const canPickupNow = hasDateReached(pickupDate)
  const canDeliverNow = hasDateReached(deliveryDate)
  const canBuyerPickupNow = hasDateReached(buyerPickupDate)
  const canSellerReturnNow = hasDateReached(sellerReturnDate)

  let nextAction = null
  let waitingMessage = ''
  if (!isPickupDone) {
    if (canPickupNow) {
      nextAction = { label: 'Pick Up Completed', key: 'seller_pickup_completed' }
    } else {
      waitingMessage = `Pickup can be marked on or after ${prettyDate(pickupDate)}.`
    }
  } else if (!isPaymentDone) {
    nextAction = { label: 'Payment Done', key: 'rest_payment_completed' }
  } else if (!isBuyerDeliveryDone) {
    if (canDeliverNow) {
      nextAction = { label: 'Delivery Completed', key: 'buyer_delivery_completed' }
    } else {
      waitingMessage = `Delivery can be marked on or after ${prettyDate(deliveryDate)}.`
    }
  } else if (!isBuyerPickupDone) {
    if (canBuyerPickupNow) {
      nextAction = { label: 'Payment Completed', key: 'buyer_pickup_completed' }
    } else {
      waitingMessage = `Buyer pickup can be marked on or after ${prettyDate(buyerPickupDate)}.`
    }
  } else if (!isSellerReturnDone) {
    if (canSellerReturnNow) {
      nextAction = { label: 'Seller Delivery Done', key: 'seller_return_completed' }
    } else {
      waitingMessage = `Return can be marked on or after ${prettyDate(sellerReturnDate)}.`
    }
  } else if (!isDepositReturned) {
    nextAction = { label: 'Deposit Returned', key: 'deposit_returned' }
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

          <div className="mt-4">
            {nextAction ? (
              <button
                type="button"
                onClick={() => onMarkMilestone?.(task.bookingId, nextAction.key)}
                disabled={marking}
                className="rounded-lg bg-teal-900 px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {nextAction.label}
              </button>
            ) : waitingMessage ? (
              <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">
                {waitingMessage}
              </p>
            ) : (
              <p className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">
                All delivery milestones are completed for this task.
              </p>
            )}
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
