import React, { useState } from 'react'

const CustomCalendarPicker = ({ value, onChange, minDate }) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (value) return new Date(value)
    return new Date()
  })
  const [showCalendar, setShowCalendar] = useState(false)

  const daysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const firstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const isDateDisabled = (day) => {
    // Create date string for the day being checked
    const checkYear = currentMonth.getFullYear()
    const checkMonth = String(currentMonth.getMonth() + 1).padStart(2, '0')
    const checkDay = String(day).padStart(2, '0')
    const checkDateStr = `${checkYear}-${checkMonth}-${checkDay}`
    
    // Compare as strings (YYYY-MM-DD format ensures correct alphabetical comparison)
    return checkDateStr < minDate
  }

  const isDateSelected = (day) => {
    if (!value) return false
    const selectedDate = new Date(value)
    return (
      day === selectedDate.getDate() &&
      currentMonth.getMonth() === selectedDate.getMonth() &&
      currentMonth.getFullYear() === selectedDate.getFullYear()
    )
  }

  const handleDateClick = (day) => {
    if (!isDateDisabled(day)) {
      const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      // Format date as YYYY-MM-DD using local date (don't use toISOString as it converts to UTC)
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
      const dateDay = String(selectedDate.getDate()).padStart(2, '0')
      const dateStr = `${year}-${month}-${dateDay}`
      onChange(dateStr)
      setShowCalendar(false)
    }
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long' })
  const year = currentMonth.getFullYear()

  const days = []
  const totalDays = daysInMonth(currentMonth)
  const startingDayOfWeek = firstDayOfMonth(currentMonth)

  // Empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }

  // Days of the month
  for (let day = 1; day <= totalDays; day++) {
    days.push(day)
  }

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="relative">
      {/* Input field */}
      <div
        onClick={() => setShowCalendar(!showCalendar)}
        className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-lg text-xs md:text-sm font-semibold bg-white cursor-pointer flex items-center justify-between transition-all"
        style={{
          border: value ? `1.5px solid #004D40` : `1.5px solid #D4AF37`,
          color: '#1A1A14',
        }}
      >
        <span>{value ? formatDateDisplay(value) : 'Select a date'}</span>
        <svg
          style={{ color: '#004D40', width: '18px', height: '18px' }}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>

      {/* Calendar popup */}
      {showCalendar && (
        <div
          className="absolute top-full left-0 mt-2 p-4 rounded-2xl shadow-lg z-50"
          style={{
            backgroundColor: '#FDFCF0',
            border: `1px solid #E8E4D4`,
            width: '320px',
          }}
        >
          {/* Month/Year header with dropdowns */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <select
              value={currentMonth.getMonth()}
              onChange={(e) => {
                const newMonth = parseInt(e.target.value)
                setCurrentMonth(new Date(currentMonth.getFullYear(), newMonth, 1))
              }}
              className="px-3 py-2 rounded-lg text-sm font-semibold focus:outline-none transition-all"
              style={{
                backgroundColor: '#F5F2E8',
                border: `1px solid #E8E4D4`,
                color: '#004D40',
              }}
            >
              {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, idx) => (
                <option key={idx} value={idx}>{m}</option>
              ))}
            </select>
            <select
              value={currentMonth.getFullYear()}
              onChange={(e) => {
                const newYear = parseInt(e.target.value)
                setCurrentMonth(new Date(newYear, currentMonth.getMonth(), 1))
              }}
              className="px-3 py-2 rounded-lg text-sm font-semibold focus:outline-none transition-all"
              style={{
                backgroundColor: '#F5F2E8',
                border: `1px solid #E8E4D4`,
                color: '#004D40',
              }}
            >
              {[2024, 2025, 2026, 2027, 2028].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold py-2"
                style={{ color: '#9E9E7A' }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {days.map((day, idx) => {
              const isNull = day === null
              const isDisabled = isNull || (day !== null && isDateDisabled(day))
              const isSelected = day !== null && isDateSelected(day)
              
              return (
                <button
                  key={idx}
                  onClick={() => day !== null && !isDisabled && handleDateClick(day)}
                  disabled={isDisabled}
                  type="button"
                  className="p-2 text-xs font-medium rounded-lg transition-all active:scale-95 disabled:cursor-not-allowed hover:bg-opacity-80"
                  style={{
                    backgroundColor:
                      isNull
                        ? 'transparent'
                        : isSelected
                        ? '#004D40'
                        : isDisabled
                        ? '#F5F2E8'
                        : '#FDFCF0',
                    color:
                      isNull
                        ? 'transparent'
                        : isSelected
                        ? '#FDFCF0'
                        : isDisabled
                        ? '#C9C9A8'
                        : '#1A1A14',
                    border:
                      isNull
                        ? 'none'
                        : isDisabled
                        ? '1px solid transparent'
                        : '1px solid #E8E4D4',
                    opacity: isDisabled ? 0.5 : 1,
                    cursor: isNull || isDisabled ? 'default' : 'pointer',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isNull && !isDisabled && !isSelected) {
                      e.target.style.backgroundColor = '#F0EEE8'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isNull && !isDisabled && !isSelected) {
                      e.target.style.backgroundColor = '#FDFCF0'
                    }
                  }}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* Close button */}
          <button
            onClick={() => setShowCalendar(false)}
            className="w-full py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              border: `1px solid #E8E4D4`,
              color: '#004D40',
              backgroundColor: '#F5F2E8',
            }}
          >
            Done
          </button>
        </div>
      )}
    </div>
  )
}

export default CustomCalendarPicker
