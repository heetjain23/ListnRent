import React from 'react'
import Button from '../ui/Button'
import ProtectedAction from '../ProtectedAction'

const BookingSection = ({ listing, startDate, onStartDateChange, endDate, onEndDateChange, onRentClick, available }) => {
  const calculateTotal = () => {
    if (!startDate || !endDate) return null
    const diff = new Date(endDate) - new Date(startDate)
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    if (days <= 0) return null
    return { days, rental: days * listing.pricePerDay, deposit: listing.deposit }
  }

  const total = calculateTotal()

  return (
    <div className="sticky top-24 bg-white rounded-2xl border border-[#E8E0D5] p-6 shadow-lg">
      <h3 className="text-lg font-bold text-[#1A1A1A] mb-4">Rental Details</h3>

      {/* Date Inputs */}
      <div className="space-y-3 mb-5">
        <div>
          <label className="block text-xs font-semibold text-[#1A1A1A] mb-2 uppercase">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-[#E8E0D5] rounded-lg text-sm
              focus:outline-none focus:border-[#C8622A]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#1A1A1A] mb-2 uppercase">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-[#E8E0D5] rounded-lg text-sm
              focus:outline-none focus:border-[#C8622A]"
          />
        </div>
      </div>

      {/* Pricing Breakdown */}
      {total && (
        <div className="space-y-2 border-t border-[#E8E0D5] pt-4 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-[#666]">₹{listing.pricePerDay} × {total.days} days</span>
            <span className="font-semibold text-[#1A1A1A]">₹{total.rental}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#666]">Deposit (refundable)</span>
            <span className="font-semibold text-[#1A1A1A]">₹{total.deposit}</span>
          </div>
          <div className="flex justify-between text-base font-bold border-t border-[#E8E0D5] pt-3 mt-3">
            <span>Total</span>
            <span className="text-[#C8622A]">₹{total.rental + total.deposit}</span>
          </div>
        </div>
      )}

      {/* Rent Button */}
      {!total && (
        <p className="text-xs text-[#999] text-center mb-3">
          Select dates to proceed
        </p>
      )}
      <ProtectedAction
        onConfirm={onRentClick}
        actionName="rent"
      >
        <Button
          disabled={!available || !total}
          variant="accent"
          size="lg"
          className="w-full"
        >
          {!available ? 'Unavailable' : total ? `Rent for ₹${total.rental + total.deposit}` : 'Select Dates'}
        </Button>
      </ProtectedAction>
    </div>
  )
}

export default BookingSection
