import { useState, useCallback } from 'react'
import { paymentsApi } from '../services/api'

export const useEarnings = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchEarnings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await paymentsApi.getRenterBookings()
      setBookings(res.data?.bookings || [])
    } catch (err) {
      setError(err.message || 'Failed to load earnings')
    } finally {
      setLoading(false)
    }
  }, [])

  // Helper to get rental earnings (price * days, no deposit)
  const getEarningsFromBooking = (booking) => {
    return booking.rentalAmount || (booking.totalDays * booking.pricePerDay) || 0
  }

  // Calculate total earnings from all active bookings (partial or completed)
  // Includes full rental amount even if only 50% has been paid
  // Excludes cancelled and failed bookings, and does NOT include deposits
  const calculateTotalEarnings = useCallback(() => {
    const total = bookings
      .filter((b) => (b.paymentStatus === 'completed' || b.paymentStatus === 'partial') && b.bookingStatus !== 'cancelled')
      .reduce((sum, b) => sum + getEarningsFromBooking(b), 0)
    return total
  }, [bookings])

  // Calculate pending earnings - the remaining rental amount to be collected
  // For 'pending' status: 100% of rental is pending (nothing paid yet)
  // For 'partial' status: 50% of rental is pending (50% paid at booking, 50% pending at pickup)
  // For 'completed' status: 0% is pending (fully collected)
  const calculatePendingEarnings = useCallback(() => {
    return bookings
      .filter((b) => b.bookingStatus !== 'cancelled')
      .reduce((sum, b) => {
        const rentalAmount = getEarningsFromBooking(b)
        if (b.paymentStatus === 'pending') {
          // 100% still pending (no payment made yet)
          return sum + rentalAmount
        } else if (b.paymentStatus === 'partial') {
          // 50% still pending (50% paid upfront)
          return sum + rentalAmount / 2
        } else if (b.paymentStatus === 'completed') {
          // 0% pending (fully collected)
          return sum + 0
        }
        return sum
      }, 0)
  }, [bookings])

  // Get bookings by status
  const getBookingsByStatus = useCallback(
    (status) => {
      return bookings.filter((b) => b.bookingStatus === status)
    },
    [bookings]
  )

  // Get bookings by payment status
  const getBookingsByPaymentStatus = useCallback(
    (paymentStatus) => {
      return bookings.filter((b) => b.paymentStatus === paymentStatus)
    },
    [bookings]
  )

  return {
    bookings,
    loading,
    error,
    fetchEarnings,
    calculateTotalEarnings,
    calculatePendingEarnings,
    getBookingsByStatus,
    getBookingsByPaymentStatus,
  }
}
