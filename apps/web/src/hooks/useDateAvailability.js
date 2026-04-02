import { useMemo } from 'react'

export const useDateAvailability = (bookings = []) => {
  // Check if a specific date is available
  const isDateAvailable = (date) => {
    if (!date) return true
    return !bookings.some((booking) => {
      const start = new Date(booking.startDate)
      const end = new Date(booking.endDate)
      const checkDate = new Date(date)
      
      // Set time to 0 for consistent comparison
      start.setHours(0, 0, 0, 0)
      end.setHours(0, 0, 0, 0)
      checkDate.setHours(0, 0, 0, 0)
      
      return checkDate >= start && checkDate <= end
    })
  }

  // Check if a date range is available
  const isDateRangeAvailable = (startDate, endDate) => {
    if (!startDate || !endDate) return true
    
    const start = new Date(startDate)
    const end = new Date(endDate)
    start.setHours(0, 0, 0, 0)
    end.setHours(0, 0, 0, 0)
    
    return !bookings.some((booking) => {
      const rangeStart = new Date(booking.startDate)
      const rangeEnd = new Date(booking.endDate)
      rangeStart.setHours(0, 0, 0, 0)
      rangeEnd.setHours(0, 0, 0, 0)
      
      // Check if there's any overlap
      return !(end < rangeStart || start > rangeEnd)
    })
  }

  // Get available dates (returns array of all available dates in a given range)
  const getAvailableDates = (periodStart, periodEnd) => {
    if (!periodStart || !periodEnd) return []
    
    const available = []
    const current = new Date(periodStart)
    const end = new Date(periodEnd)
    
    current.setHours(0, 0, 0, 0)
    end.setHours(0, 0, 0, 0)
    
    while (current <= end) {
      if (isDateAvailable(current)) {
        available.push(new Date(current))
      }
      current.setDate(current.getDate() + 1)
    }
    
    return available
  }

  // Get unavailable dates in a period
  const getUnavailableDatesInPeriod = (periodStart, periodEnd) => {
    if (!periodStart || !periodEnd) return []
    
    const unavailable = []
    bookings.forEach((booking) => {
      const rangeStart = new Date(booking.startDate)
      const rangeEnd = new Date(booking.endDate)
      const start = new Date(periodStart)
      const end = new Date(periodEnd)
      
      rangeStart.setHours(0, 0, 0, 0)
      rangeEnd.setHours(0, 0, 0, 0)
      start.setHours(0, 0, 0, 0)
      end.setHours(0, 0, 0, 0)
      
      // Find overlap
      const overlapStart = rangeStart > start ? rangeStart : start
      const overlapEnd = rangeEnd < end ? rangeEnd : end
      
      if (overlapStart <= overlapEnd) {
        unavailable.push({
          startDate: overlapStart,
          endDate: overlapEnd,
          bookingId: booking.bookingId,
          renterName: booking.renterName,
        })
      }
    })
    
    return unavailable
  }

  return {
    isDateAvailable,
    isDateRangeAvailable,
    getAvailableDates,
    getUnavailableDatesInPeriod,
    bookings,
  }
}
