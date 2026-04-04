import React, { useState, useEffect } from 'react'
import ProtectedAction from '../ProtectedAction'
import CustomCalendarPicker from './CustomCalendarPicker'
import { TrustBadge, ShieldIcon, SparkleIcon, ReturnIcon } from './TrustBadge'
import PricingRow from './PricingRow'
import { useDateAvailability } from '../../hooks/useDateAvailability'

const BookingSection = ({
  listing,
  eventDate,
  onEventDateChange,
  durationDays,
  onDurationChange,
  onRentClick,
  available,
}) => {
  useEffect(() => {
  }, [listing?.bookings])

  const { isDateRangeAvailable, getUnavailableDatesInPeriod } = useDateAvailability(
    listing?.bookings || []
  )
  // ── Calculate minimum date (day after tomorrow) ──────────────────────────────
  const getMinDate = () => {
    const today = new Date()
    const minDate = new Date(today)
    minDate.setDate(minDate.getDate() + 2) // Day after tomorrow
    // Format date as YYYY-MM-DD using local date (don't use toISOString as it converts to UTC)
    const year = minDate.getFullYear()
    const month = String(minDate.getMonth() + 1).padStart(2, '0')
    const day = String(minDate.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const minDate = getMinDate()

  // ── Calculate Take-Away and return dates ──────────────────────────────────────
  const getCalculatedDates = () => {
    if (!eventDate) return null
    const event = new Date(eventDate)
    
    // Take-Away = 1 day before event
    const TakeAway = new Date(event)
    TakeAway.setDate(TakeAway.getDate() - 1)
    
    // Return = event date + selected days
    const returnDate = new Date(event)
    returnDate.setDate(returnDate.getDate() + (durationDays || 1))
    
    // Format dates as YYYY-MM-DD using local date (don't use toISOString as it converts to UTC)
    const formatDateStr = (dateObj) => {
      const year = dateObj.getFullYear()
      const month = String(dateObj.getMonth() + 1).padStart(2, '0')
      const day = String(dateObj.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    
    return {
      TakeAway: formatDateStr(TakeAway),
      returnDate: formatDateStr(returnDate),
    }
  }

  const dates = getCalculatedDates()

  // ── Check if selected dates are available ────────────────────────────────────
  const datesAreAvailable = dates ? isDateRangeAvailable(
    new Date(dates.TakeAway),
    new Date(dates.returnDate)
  ) : true

  const unavailableDatesInPeriod = dates ? getUnavailableDatesInPeriod(
    new Date(dates.TakeAway),
    new Date(dates.returnDate)
  ) : []

  // ── Derived totals ──────────────────────────────────────────────────────────
  const calculateTotal = () => {
    if (!eventDate || !durationDays) return null
    // Charge only for selected duration days
    const rentalDays = durationDays || 1
    return {
      days: rentalDays,
      duration: durationDays,
      rental: rentalDays * listing.pricePerDay,
      deposit: listing.deposit,
    }
  }

  const total      = calculateTotal()
  const grandTotal = total ? total.rental + total.deposit : null

  // ── CTA label ───────────────────────────────────────────────────────────────
  const ctaLabel = (() => {
    if (!available)     return 'Currently Unavailable'
    if (!total)         return 'Select Event Date to Continue'
    if (!datesAreAvailable) return 'Dates Not Available'
    return `Reserve Now`
  })()

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div
      className="rounded-3xl p-4 md:p-6"
      style={{
        backgroundColor: '#FDFCF0',
        border: `1px solid #E8E4D4`,
        boxShadow: '0 8px 40px rgba(0,77,64,0.08)',
      }}
    >

      {/* 1 ── Rental Price Header */}
      <div className="mb-4 md:mb-5">
        <p
          className="text-[10px] font-bold uppercase tracking-widest mb-1"
          style={{ color: '#9E9E7A' }}
        >
          Rental Price
        </p>
        <div className="flex items-baseline gap-1">
          <span
            className="text-3xl md:text-4xl font-black"
            style={{ color: '#004D40', fontFamily: 'Georgia, serif' }}
          >
            ₹{listing.pricePerDay}
          </span>
          <span className="text-xs md:text-sm" style={{ color: '#9E9E7A' }}>/ day</span>
        </div>
      </div>

      {/* 2 ── Event Date Picker */}
      <div className="mb-4 md:mb-6">
        <p
          className="text-[10px] font-bold uppercase tracking-widest mb-3"
          style={{ color: '#004D40' }}
        >
          Event Date
        </p>
        <CustomCalendarPicker
          value={eventDate}
          onChange={onEventDateChange}
          minDate={minDate}
          unavailableDates={listing?.bookings || []}
        />
        <p className="text-xs mt-3" style={{ color: '#9E9E7A' }}>
          We'll prepare it a day before and collect after your event
        </p>
      </div>

      {/* 3 ── Duration Selector */}
      {eventDate && (
        <div className="mb-4 md:mb-6">
          <p
            className="text-[10px] font-bold uppercase tracking-widest mb-3"
            style={{ color: '#004D40' }}
          >
            For How Many Days?
          </p>
          <div className="grid grid-cols-6 gap-2">
            {[1, 2, 3, 4, 5, 6].map((day) => (
              <button
                key={day}
                onClick={() => onDurationChange(day)}
                className="py-2 md:py-2.5 rounded-lg font-semibold text-xs transition-all duration-200 active:scale-95"
                style={{
                  backgroundColor: durationDays === day ? '#004D40' : '#F5F2E8',
                  color: durationDays === day ? '#FDFCF0' : '#1A1A14',
                  border: `1px solid ${durationDays === day ? '#004D40' : '#E8E4D4'}`,
                }}
              >
                {day}D
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4 ── Calculated Dates Display */}
      {dates && (
        <div
          className="grid grid-cols-2 rounded-2xl overflow-hidden mb-4 p-3 gap-3"
          style={{ backgroundColor: '#F5F2E8', border: `1px solid #E8E4D4` }}
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#9E9E7A' }}>
              Take-Away
            </p>
            <p className="text-xs md:text-sm font-semibold" style={{ color: '#1A1A14' }}>
              {new Date(dates.TakeAway).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}(1:00 pm)
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#9E9E7A' }}>
              Return
            </p>
            <p className="text-xs md:text-sm font-semibold" style={{ color: '#1A1A14' }}>
              {new Date(dates.returnDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}(1:00 pm)
            </p>
          </div>
        </div>
      )}

      {/* 5 ── Pricing Breakdown */}
      {total && (
        <div
          className="space-y-2.5 mb-4 pb-4"
          style={{ borderBottom: `1px solid #E8E4D4` }}
        >
          <PricingRow
            label={`${total.days} day rental`}
            amount={total.rental}
            underline
          />
          <PricingRow
            label="Refundable Security"
            amount={total.deposit}
          />
        </div>
      )}

      {/* 6 ── Total Row */}
      {grandTotal && (
        <div className="flex justify-between items-center mb-4 md:mb-5">
          <span className="font-bold text-sm md:text-base" style={{ color: '#1A1A14' }}>
            Total
          </span>
          <span
            className="text-xl md:text-2xl font-black"
            style={{ color: '#004D40', fontFamily: 'Georgia, serif' }}
          >
            ₹{grandTotal}
          </span>
        </div>
      )}

      {/* Helper text when no dates selected */}
      {!total && (
        <p className="text-xs text-center mb-4" style={{ color: '#9E9E7A' }}>
          Select event date and duration to see pricing
        </p>
      )}

      {/* Unavailable Dates Warning */}
      {unavailableDatesInPeriod.length > 0 && (
        <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: '#FFE8E0', border: '1px solid #FFD4C4' }}>
          <p className="text-xs font-semibold" style={{ color: '#C8622A' }}>
            ⚠️ These dates are already booked:
          </p>
          <div className="mt-2 space-y-1">
            {unavailableDatesInPeriod.map((range, idx) => (
              <p key={idx} className="text-xs" style={{ color: '#9E6B4A' }}>
                {new Date(range.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - {new Date(range.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                {range.renterName && ` (${range.renterName})`}
              </p>
            ))}
          </div>
          <p className="text-xs mt-2" style={{ color: '#C8622A' }}>
            Please select different dates
          </p>
        </div>
      )}

      {/* 7 ── Reserve Now CTA */}
      <ProtectedAction onConfirm={onRentClick} actionName="rent">
        <button
          disabled={!available || !total || !datesAreAvailable}
          className="w-full py-3 md:py-4 rounded-2xl font-bold text-base tracking-wide transition-all duration-200
            disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.99]"
          style={{
            backgroundColor: available && total && datesAreAvailable ? '#004D40' : '#9E9E7A',
            color: '#FDFCF0',
            fontFamily: 'Georgia, serif',
            letterSpacing: '0.04em',
          }}
        >
          {ctaLabel}
        </button>
      </ProtectedAction>

      {grandTotal && (
        <p className="text-center text-xs mt-2" style={{ color: '#9E9E7A' }}>
          Secure checkout powered by RazorPay
        </p>
      )}

      {/* 8 ── Trust Badges */}
      <div
        className="grid grid-cols-3 gap-2 md:gap-3 mt-4 md:mt-5 pt-4 md:pt-5"
        style={{ borderTop: `1px solid #E8E4D4` }}
      >
        <TrustBadge icon={<ShieldIcon />}  label="Insured" />
        <TrustBadge icon={<SparkleIcon />} label={<>Sustainably<br />Cleaned</>} />
        <TrustBadge icon={<ReturnIcon />}  label="Flexible Returns" />
      </div>

    </div>
  )
}

export default BookingSection
