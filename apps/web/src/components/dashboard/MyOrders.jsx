import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserBookings } from '../../hooks/useUserBookings'
import { getOptimizedImageUrl } from '../../services/cloudinary'
import PaymentCheckout from '../ui/PaymentCheckout'

const MyOrders = () => {
  const navigate = useNavigate()
  const { bookings, loading, error, fetchUserBookings } = useUserBookings()
  const [retryingBookingId, setRetryingBookingId] = useState(null)

  useEffect(() => {
    fetchUserBookings()
  }, [fetchUserBookings])

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return '✓ Payment Confirmed'
      case 'failed':
        return '✗ Payment Failed'
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  const handlePaymentSuccess = (booking) => {
    // Refresh bookings to reflect the payment success
    fetchUserBookings()
    setRetryingBookingId(null)
  }

  const handlePaymentCancel = () => {
    setRetryingBookingId(null)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-4xl animate-spin mb-4">⏳</div>
          <p className="text-[#666]">Loading your orders...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-medium">Error loading orders</p>
        <p className="text-red-600 text-sm mt-2">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">My Orders</h2>
        <p className="text-[#666]">Track your rental bookings and status</p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-[#E8E0D5]">
          <div className="text-4xl mb-3">📦</div>
          <p className="text-[#666] font-medium">No orders yet</p>
          <p className="text-[#999] text-sm mt-2">Start by browsing and renting outfits from our collection</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white rounded-lg border border-[#E8E0D5] p-6 hover:shadow-md transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                {/* Left: Image and Details */}
                <div className="flex gap-4 flex-1">
                  {booking.listingId?.images?.[0] && (
                    <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-[#F5F5F5]">
                      <img
                        src={getOptimizedImageUrl(booking.listingId.images[0], { width: 96, height: 96, quality: 'auto' })}
                        alt={booking.listingId.title}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
                      {booking.listingId?.title || 'Outfit Bundle'}
                    </h3>
                    <div className="space-y-1 text-sm text-[#666]">
                      <div>
                        <span className="font-medium">Rental Period:</span> {formatDate(booking.startDate)} to{' '}
                        {formatDate(booking.endDate)}
                      </div>
                      <div>
                        <span className="font-medium">Duration:</span> {booking.totalDays} days
                      </div>
                      <div>
                        <span className="font-medium">Rental Amount:</span> {formatCurrency(booking.rentalAmount)}
                      </div>
                      <div>
                        <span className="font-medium">Deposit:</span> {formatCurrency(booking.depositAmount)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Status and Amount */}
                <div className="flex flex-col items-end gap-3">
                  <div className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadgeColor(booking.paymentStatus)}`}>
                    {getStatusLabel(booking.paymentStatus)}
                  </div>
                  <div className="text-right">
                    <p className="text-[#999] text-xs mb-1">Total Amount</p>
                    <p className="text-2xl font-bold text-[#C8622A]">{formatCurrency(booking.totalAmount)}</p>
                  </div>
                  {booking.paymentStatus === 'failed' && (
                    <button
                      onClick={() => setRetryingBookingId(booking._id)}
                      className="mt-2 px-4 py-2 bg-[#C8622A] text-white text-sm font-semibold rounded-lg hover:bg-opacity-90 transition-all"
                    >
                      Pay Now ₹{formatCurrency(booking.totalAmount)}
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/order/${booking._id}`, { state: { booking } })}
                    className="mt-2 px-4 py-2 border-2 border-[#C8622A] text-[#C8622A] text-sm font-semibold rounded-lg hover:bg-[#FFE8E0] transition-all"
                  >
                    View Details
                  </button>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-4 pt-4 border-t border-[#E8E0D5] flex flex-wrap gap-4 justify-between items-center">
                <div className="text-xs text-[#999]">Order ID: {booking.razorpayOrderId}</div>
                {booking.bookingStatus === 'active' && new Date(booking.endDate) > new Date() && (
                  <div className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full">
                    Active Rental
                  </div>
                )}
                {booking.bookingStatus === 'completed' || new Date(booking.endDate) <= new Date() ? (
                  <div className="text-xs bg-gray-50 text-gray-700 px-3 py-1 rounded-full">
                    Completed
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment Checkout Modal for Retry */}
      {retryingBookingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-[#1A1A1A]">Retry Payment</h3>
                <button
                  onClick={handlePaymentCancel}
                  className="text-[#999] hover:text-[#1A1A1A] text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              {bookings
                .filter((b) => b._id === retryingBookingId)
                .map((booking) => (
                  <PaymentCheckout
                    key={booking._id}
                    listing={booking.listingId}
                    renterId={booking.renterId}
                    startDate={booking.startDate}
                    endDate={booking.endDate}
                    existingBookingId={booking._id}
                    onSuccess={handlePaymentSuccess}
                    onCancel={handlePaymentCancel}
                  />
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyOrders
