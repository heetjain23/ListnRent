import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
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
  const { isDateRangeAvailable, getUnavailableDatesInPeriod } = useDateAvailability(
    listing?.bookings || []
  )

  const getMinDate = () => {
    const today = new Date()
    const minDate = new Date(today)
    minDate.setDate(minDate.getDate() + 2)
    const year = minDate.getFullYear()
    const month = String(minDate.getMonth() + 1).padStart(2, '0')
    const day = String(minDate.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const minDate = getMinDate()

  const getCalculatedDates = () => {
    if (!eventDate) return null
    const event = new Date(eventDate)
    const TakeAway = new Date(event)
    TakeAway.setDate(TakeAway.getDate() - 1)
    const returnDate = new Date(event)
    returnDate.setDate(returnDate.getDate() + (durationDays || 1))
    const formatDateStr = (dateObj) => {
      const year = dateObj.getFullYear()
      const month = String(dateObj.getMonth() + 1).padStart(2, '0')
      const day = String(dateObj.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    return { TakeAway: formatDateStr(TakeAway), returnDate: formatDateStr(returnDate) }
  }

  const dates = getCalculatedDates()

  const datesAreAvailable = dates ? isDateRangeAvailable(
    new Date(dates.TakeAway), new Date(dates.returnDate)
  ) : true

  const unavailableDatesInPeriod = dates ? getUnavailableDatesInPeriod(
    new Date(dates.TakeAway), new Date(dates.returnDate)
  ) : []

  const calculateTotal = () => {
    if (!eventDate || !durationDays) return null
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

  const ctaLabel = (() => {
    if (!available)         return 'Currently Unavailable'
    if (!total)             return 'Select Event Date to Continue'
    if (!datesAreAvailable) return 'Dates Not Available'
    return 'Reserve Now'
  })()

  const canBook = available && total && datesAreAvailable

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      className="rounded-3xl overflow-visible"
      style={{
        backgroundColor: '#FDFCF0',
        border: '1px solid #E8E4D4',
        boxShadow: '0 8px 40px rgba(0,77,64,0.08)',
      }}
    >
      {/* Top accent bar */}
      <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #D4AF37, #C8622A, rgba(200,98,42,0.2), transparent)' }} />

      <div className="p-4 md:p-6">

        {/* ── 1. Price Header ── */}
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] mb-1" style={{ color: '#9E9E7A' }}>
              Rental Price
            </p>
            <div className="flex items-baseline gap-1.5">
              <span
                className="text-3xl md:text-4xl font-black"
                style={{ color: '#004D40', fontFamily: 'Georgia, serif' }}
              >
                ₹{listing.pricePerDay}
              </span>
              <span className="text-xs md:text-sm font-medium" style={{ color: '#9E9E7A' }}>/ day</span>
            </div>
          </div>
          {/* Deposit pill */}
          <div
            className="px-3 py-1.5 rounded-full text-[10px] font-bold"
            style={{
              backgroundColor: 'rgba(0,77,64,0.07)',
              color: '#004D40',
              border: '1px solid rgba(0,77,64,0.15)',
            }}
          >
            ₹{listing.deposit} deposit
          </div>
        </div>

        {/* Divider */}
        <div className="mb-5 h-px" style={{ background: 'linear-gradient(90deg, #E8E4D4, transparent)' }} />

        {/* ── 2. Event Date Picker ── */}
        <div className="mb-5 relative z-30">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] mb-3 flex items-center gap-2" style={{ color: '#004D40' }}>
            <span className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-white" style={{ backgroundColor: '#004D40' }}>1</span>
            Event Date
          </p>
          <CustomCalendarPicker
            value={eventDate}
            onChange={onEventDateChange}
            minDate={minDate}
            unavailableDates={listing?.bookings || []}
          />
          <p className="text-[11px] mt-2.5 flex items-center gap-1.5" style={{ color: '#9E9E7A' }}>
            <span>📦</span>
            We'll prepare it a day before and collect after your event
          </p>
        </div>

        {/* ── 3. Duration Selector ── */}
        <AnimatePresence>
          {eventDate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="mb-5 overflow-hidden"
            >
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] mb-3 flex items-center gap-2" style={{ color: '#004D40' }}>
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-white" style={{ backgroundColor: '#004D40' }}>2</span>
                For How Many Days?
              </p>
              <div className="grid grid-cols-6 gap-2">
                {[1, 2, 3, 4, 5, 6].map((day) => (
                  <motion.button
                    key={day}
                    onClick={() => onDurationChange(day)}
                    whileHover={{ y: -1, scale: 1.04 }}
                    whileTap={{ scale: 0.94 }}
                    transition={{ duration: 0.18 }}
                    className="py-2 md:py-2.5 rounded-xl font-bold text-xs transition-all duration-200"
                    style={{
                      backgroundColor: durationDays === day ? '#004D40' : '#F5F2E8',
                      color: durationDays === day ? '#FDFCF0' : '#1A1A14',
                      border: `1.5px solid ${durationDays === day ? '#004D40' : '#E8E4D4'}`,
                      boxShadow: durationDays === day ? '0 4px 12px rgba(0,77,64,0.2)' : 'none',
                    }}
                  >
                    {day}D
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── 4. Calculated Dates ── */}
        <AnimatePresence>
          {dates && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 rounded-2xl overflow-hidden mb-5"
              style={{ backgroundColor: '#F5F2E8', border: '1px solid #E8E4D4' }}
            >
              {[
                { label: 'Take-Away', date: dates.TakeAway, icon: '📤' },
                { label: 'Return',    date: dates.returnDate, icon: '📥' },
              ].map((item, i) => (
                <div
                  key={item.label}
                  className="p-3"
                  style={{ borderRight: i === 0 ? '1px solid #E8E4D4' : 'none' }}
                >
                  <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] mb-1.5 flex items-center gap-1" style={{ color: '#9E9E7A' }}>
                    <span>{item.icon}</span>
                    {item.label}
                  </p>
                  <p className="text-xs md:text-sm font-bold" style={{ color: '#1A1A14' }}>
                    {new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-[10px]" style={{ color: '#9E9E7A' }}>1:00 pm</p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── 5. Pricing Breakdown ── */}
        <AnimatePresence>
          {total && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-4"
            >
              <div
                className="space-y-2.5 mb-3 pb-3"
                style={{ borderBottom: '1px dashed #E8E4D4' }}
              >
                <PricingRow label={`${total.days} day rental`} amount={total.rental} underline />
                <PricingRow label="Refundable Security" amount={total.deposit} />
              </div>

              {/* Grand total */}
              <div
                className="flex justify-between items-center px-3 py-2.5 rounded-xl"
                style={{ backgroundColor: 'rgba(0,77,64,0.05)', border: '1px solid rgba(0,77,64,0.1)' }}
              >
                <span className="font-bold text-sm" style={{ color: '#1A1A14' }}>Total</span>
                <span className="text-xl md:text-2xl font-black" style={{ color: '#004D40', fontFamily: 'Georgia, serif' }}>
                  ₹{grandTotal}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Helper text when no dates */}
        {!total && (
          <p className="text-xs text-center mb-4" style={{ color: '#9E9E7A' }}>
            Select an event date and duration to see pricing
          </p>
        )}

        {/* Unavailable warning */}
        <AnimatePresence>
          {unavailableDatesInPeriod.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="mb-4 p-3 rounded-xl"
              style={{ backgroundColor: '#FFE8E0', border: '1px solid #FFD4C4' }}
            >
              <p className="text-xs font-bold mb-2" style={{ color: '#C8622A' }}>
                ⚠️ These dates are already booked:
              </p>
              <div className="space-y-1">
                {unavailableDatesInPeriod.map((range, idx) => (
                  <p key={idx} className="text-xs" style={{ color: '#9E6B4A' }}>
                    {new Date(range.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} –{' '}
                    {new Date(range.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    {range.renterName && ` (${range.renterName})`}
                  </p>
                ))}
              </div>
              <p className="text-xs mt-1.5 font-semibold" style={{ color: '#C8622A' }}>Please select different dates</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── 6. CTA Button ── */}
        <ProtectedAction onConfirm={onRentClick} actionName="rent">
          <motion.button
            disabled={!canBook}
            whileHover={canBook ? { y: -2, scale: 1.005 } : {}}
            whileTap={canBook ? { scale: 0.98 } : {}}
            transition={{ duration: 0.2 }}
            className="relative w-full py-3.5 md:py-4 rounded-2xl font-bold text-sm md:text-base tracking-wide overflow-hidden transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: canBook
                ? 'linear-gradient(135deg, #004D40 0%, #00342B 60%, #00261F 100%)'
                : 'linear-gradient(135deg, #9E9E7A, #8A8A6A)',
              color: '#FDFCF0',
              fontFamily: 'Georgia, serif',
              letterSpacing: '0.05em',
              boxShadow: canBook ? '0 8px 28px rgba(0,77,64,0.3)' : 'none',
            }}
          >
            {/* Shimmer on hover */}
            {canBook && (
              <motion.div
                className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent"
                style={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
            )}
            <span className="relative z-10 flex items-center justify-center gap-2">
              {canBook && <span>🎊</span>}
              {ctaLabel}
            </span>
          </motion.button>
        </ProtectedAction>

        {grandTotal && (
          <p className="text-center text-[11px] mt-2.5 flex items-center justify-center gap-1.5" style={{ color: '#9E9E7A' }}>
            <span>🔒</span>
            Secure checkout powered by RazorPay
          </p>
        )}

        {/* ── 7. Trust Badges ── */}
        <div
          className="grid grid-cols-3 gap-2 mt-5 pt-4"
          style={{ borderTop: '1px solid #E8E4D4' }}
        >
          <TrustBadge icon={<ShieldIcon />}  label="Insured" />
          <TrustBadge icon={<SparkleIcon />} label={<>Sustainably<br />Cleaned</>} />
          <TrustBadge icon={<ReturnIcon />}  label="Flexible Returns" />
        </div>
      </div>
    </motion.div>
  )
}

export default BookingSection