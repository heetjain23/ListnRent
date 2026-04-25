import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'

const CustomCalendarPicker = ({ value, onChange, minDate, unavailableDates = [] }) => {
  const [currentMonth, setCurrentMonth] = useState(() => value ? new Date(value) : new Date())
  const [showCalendar,  setShowCalendar] = useState(false)
  const calendarRef = useRef(null)
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendar(false)
      }
    }
    if (showCalendar) {
      document.addEventListener('mousedown', handleClick)
      document.addEventListener('touchstart', handleClick)
    }
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('touchstart', handleClick)
    }
  }, [showCalendar])

  const daysInMonth   = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1).getDay()

  const isDateUnavailable = (day) => {
    const y = currentMonth.getFullYear()
    const m = String(currentMonth.getMonth() + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    const check = new Date(`${y}-${m}-${d}`)
    check.setHours(0, 0, 0, 0)
    return unavailableDates.some((range) => {
      const s = new Date(range.startDate); s.setHours(0,0,0,0)
      const e = new Date(range.endDate);   e.setHours(0,0,0,0)
      // Do not mark dates red for bookings that are already fully in the past.
      if (e < todayStart) return false
      return check >= s && check <= e
    })
  }

  const isDateDisabled = (day) => {
    const y = currentMonth.getFullYear()
    const m = String(currentMonth.getMonth() + 1).padStart(2, '0')
    const d = String(day).padStart(2, '0')
    return `${y}-${m}-${d}` < minDate || isDateUnavailable(day)
  }

  const isDateSelected = (day) => {
    if (!value) return false
    const sel = new Date(value)
    return day === sel.getDate() && currentMonth.getMonth() === sel.getMonth() && currentMonth.getFullYear() === sel.getFullYear()
  }

  const isToday = (day) => {
    const now = new Date()
    return day === now.getDate() && currentMonth.getMonth() === now.getMonth() && currentMonth.getFullYear() === now.getFullYear()
  }

  const handleDateClick = (day) => {
    if (!isDateDisabled(day)) {
      const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      const str = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
      onChange(str)
      setShowCalendar(false)
    }
  }

  const totalDays     = daysInMonth(currentMonth)
  const startDay      = firstDayOfMonth(currentMonth)
  const days          = [...Array(startDay).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)]

  const formatDisplay = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  return (
    <div className="relative" ref={calendarRef}>
      {/* Trigger */}
      <motion.div
        onClick={() => setShowCalendar(!showCalendar)}
        whileHover={{ scale: 1.005 }}
        whileTap={{ scale: 0.998 }}
        transition={{ duration: 0.15 }}
        className="w-full px-4 py-3 rounded-xl text-sm font-semibold cursor-pointer flex items-center justify-between transition-all duration-200"
        style={{
          border: value
            ? '1.5px solid #004D40'
            : showCalendar
            ? '1.5px solid #D4AF37'
            : '1.5px solid #E8E4D4',
          backgroundColor: value ? 'rgba(0,77,64,0.03)' : 'white',
          color: value ? '#1A1A14' : '#9E9E7A',
          boxShadow: showCalendar ? '0 0 0 3px rgba(212,175,55,0.1)' : 'none',
        }}
      >
        <div className="flex items-center gap-2">
          <span style={{ color: value ? '#004D40' : '#C9C9A8' }}>📅</span>
          <span>{value ? formatDisplay(value) : 'Select event date'}</span>
        </div>
        <motion.span
          animate={{ rotate: showCalendar ? 180 : 0 }}
          transition={{ duration: 0.22 }}
          style={{ color: '#9E9E7A', fontSize: 11 }}
        >
          ▼
        </motion.span>
      </motion.div>

      {/* Calendar dropdown */}
      <AnimatePresence>
        {showCalendar && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full left-0 mt-2 p-4 rounded-2xl z-50"
            style={{
              backgroundColor: '#FDFCF0',
              border: '1px solid #E8E4D4',
              width: 'min(320px, calc(100vw - 2.5rem))',
              boxShadow: '0 16px 50px rgba(0,52,43,0.14)',
            }}
          >
            {/* Calendar top accent */}
            <div className="h-0.5 -mx-4 -mt-4 mb-4 rounded-t-2xl" style={{ background: 'linear-gradient(90deg, #D4AF37, #C8622A, transparent)' }} />

            {/* Month/year nav */}
            <div className="flex items-center gap-2 mb-4">
              <motion.button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                type="button"
                className="p-2 rounded-lg transition-colors"
                style={{ backgroundColor: '#F5F2E8' }}
              >
                <svg width="14" height="14" fill="none" stroke="#004D40" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </motion.button>

              <div className="flex items-center gap-1.5 flex-1">
                <select
                  value={currentMonth.getMonth()}
                  onChange={(e) => setCurrentMonth(new Date(currentMonth.getFullYear(), parseInt(e.target.value), 1))}
                  className="flex-1 px-2.5 py-1.5 rounded-lg text-xs font-bold focus:outline-none"
                  style={{ backgroundColor: '#F5F2E8', border: '1px solid #E8E4D4', color: '#004D40' }}
                >
                  {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
                    <option key={i} value={i}>{m}</option>
                  ))}
                </select>
                <select
                  value={currentMonth.getFullYear()}
                  onChange={(e) => setCurrentMonth(new Date(parseInt(e.target.value), currentMonth.getMonth(), 1))}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold focus:outline-none"
                  style={{ backgroundColor: '#F5F2E8', border: '1px solid #E8E4D4', color: '#004D40' }}
                >
                  {[2024,2025,2026,2027,2028].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <motion.button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                type="button"
                className="p-2 rounded-lg transition-colors"
                style={{ backgroundColor: '#F5F2E8' }}
              >
                <svg width="14" height="14" fill="none" stroke="#004D40" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d) => (
                <div key={d} className="text-center text-[10px] font-extrabold py-1.5 uppercase tracking-wider" style={{ color: '#9E9E7A' }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {days.map((day, idx) => {
                const isNull     = day === null
                const isBusy     = !isNull && isDateUnavailable(day)
                const isDisabled = isNull || (!isNull && isDateDisabled(day))
                const isSelected = !isNull && isDateSelected(day)
                const isTodayDay = !isNull && isToday(day)

                return (
                  <motion.button
                    key={idx}
                    onClick={() => day !== null && !isDisabled && handleDateClick(day)}
                    disabled={isDisabled}
                    type="button"
                    whileHover={!isNull && !isDisabled ? { scale: 1.1 } : {}}
                    whileTap={!isNull && !isDisabled ? { scale: 0.9 } : {}}
                    transition={{ duration: 0.15 }}
                    className="relative p-0 aspect-square text-[11px] font-semibold rounded-lg transition-all duration-150 disabled:cursor-not-allowed flex items-center justify-center"
                    style={{
                      backgroundColor:
                        isNull ? 'transparent'
                        : isSelected ? '#004D40'
                        : isBusy ? '#FFE8DC'
                        : isDisabled ? '#F5F2E8'
                        : isTodayDay ? 'rgba(212,175,55,0.12)'
                        : '#FDFCF0',
                      color:
                        isNull ? 'transparent'
                        : isSelected ? '#FDFCF0'
                        : isBusy ? '#C8622A'
                        : isDisabled ? '#C9C9A8'
                        : isTodayDay ? '#D4AF37'
                        : '#1A1A14',
                      border:
                        isNull ? 'none'
                        : isSelected ? '1.5px solid #004D40'
                        : isBusy ? '1px solid #FFB894'
                        : isTodayDay ? '1px solid rgba(212,175,55,0.4)'
                        : isDisabled ? '1px solid transparent'
                        : '1px solid #E8E4D4',
                      opacity: isDisabled && !isBusy ? 0.45 : 1,
                      boxShadow: isSelected ? '0 4px 10px rgba(0,77,64,0.2)' : 'none',
                    }}
                    title={isBusy ? 'Not available' : ''}
                  >
                    {day}
                    {isTodayDay && !isSelected && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ backgroundColor: '#D4AF37' }} />
                    )}
                  </motion.button>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between px-1 mb-3">
              {[
                { color: '#004D40', border: '#004D40', label: 'Selected' },
                { color: '#FFE8DC', border: '#FFB894', label: 'Booked' },
                { color: 'rgba(212,175,55,0.12)', border: 'rgba(212,175,55,0.4)', label: 'Today' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color, border: `1px solid ${item.border}` }} />
                  <span className="text-[10px]" style={{ color: '#9E9E7A' }}>{item.label}</span>
                </div>
              ))}
            </div>

            {/* Done button */}
            <motion.button
              onClick={() => setShowCalendar(false)}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              className="w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
              style={{
                border: '1.5px solid #004D40',
                color: '#004D40',
                backgroundColor: 'rgba(0,77,64,0.05)',
              }}
            >
              Done
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CustomCalendarPicker