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

  // Calculate total earnings from completed bookings
  const calculateTotalEarnings = useCallback(() => {
    const total = bookings
      .filter((b) => b.paymentStatus === 'completed' && b.bookingStatus !== 'cancelled')
      .reduce((sum, b) => sum + getEarningsFromBooking(b), 0)
    return total
  }, [bookings])

  // Calculate pending earnings from non-completed payments
  const calculatePendingEarnings = useCallback(() => {
    return bookings
      .filter((b) => b.paymentStatus !== 'completed' && b.paymentStatus !== 'failed' && b.bookingStatus !== 'cancelled')
      .reduce((sum, b) => sum + getEarningsFromBooking(b), 0)
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
