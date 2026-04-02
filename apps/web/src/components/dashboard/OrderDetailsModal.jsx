import React from 'react'
import { useNavigate } from 'react-router-dom'
import { getOptimizedImageUrl } from '../../services/cloudinary'

const OrderDetailsModal = ({ booking, isOpen, onClose }) => {
  const navigate = useNavigate()

  if (!isOpen || !booking) return null

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

  const handleViewOutfit = () => {
    if (booking.listingId?._id) {
      navigate(`/listing-detail/${booking.listingId._id}`)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#E8E0D5] p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#1A1A1A]">Order Details</h2>
          <button
            onClick={onClose}
            className="text-[#999] hover:text-[#1A1A1A] text-2xl font-bold transition-colors"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Outfit Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#1A1A1A]">Outfit</h3>
            <div className="flex gap-4">
              {booking.listingId?.images?.[0] && (
                <div className="w-32 h-40 shrink-0 rounded-lg overflow-hidden bg-[#F5F5F5]">
                  <img
                    src={getOptimizedImageUrl(booking.listingId.images[0], { width: 128, height: 160, quality: 'auto' })}
                    alt={booking.listingId.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <p className="text-xl font-semibold text-[#1A1A1A] mb-4">
                  {booking.listingId?.title || 'Outfit Bundle'}
                </p>
                <button
                  onClick={handleViewOutfit}
                  className="px-6 py-2 bg-[#C8622A] text-white font-semibold rounded-lg hover:bg-opacity-90 transition-all inline-block"
                >
                  View Outfit
                </button>
              </div>
            </div>
          </div>

          {/* Rental Period Section */}
          <div className="space-y-3 pb-6 border-b border-[#E8E0D5]">
            <h3 className="text-lg font-semibold text-[#1A1A1A]">Rental Period</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#F9F7F4] p-4 rounded-lg">
                <p className="text-[#999] text-sm mb-1">Start Date</p>
                <p className="text-[#1A1A1A] font-semibold">{formatDate(booking.startDate)}</p>
              </div>
              <div className="bg-[#F9F7F4] p-4 rounded-lg">
                <p className="text-[#999] text-sm mb-1">End Date</p>
                <p className="text-[#1A1A1A] font-semibold">{formatDate(booking.endDate)}</p>
              </div>
              <div className="bg-[#F9F7F4] p-4 rounded-lg">
                <p className="text-[#999] text-sm mb-1">Duration</p>
                <p className="text-[#1A1A1A] font-semibold">{booking.totalDays} days</p>
              </div>
              <div className="bg-[#F9F7F4] p-4 rounded-lg">
                <p className="text-[#999] text-sm mb-1">Booking Status</p>
                <p className="text-[#1A1A1A] font-semibold capitalize">{booking.bookingStatus}</p>
              </div>
            </div>
          </div>

          {/* Payment Details Section */}
          <div className="space-y-3 pb-6 border-b border-[#E8E0D5]">
            <h3 className="text-lg font-semibold text-[#1A1A1A]">Payment Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 bg-[#F9F7F4] rounded-lg">
                <span className="text-[#666]">Rental Amount</span>
                <span className="font-semibold text-[#1A1A1A]">{formatCurrency(booking.rentalAmount)}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-[#F9F7F4] rounded-lg">
                <span className="text-[#666]">Deposit Amount</span>
                <span className="font-semibold text-[#1A1A1A]">{formatCurrency(booking.depositAmount)}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-[#FFFAF5] border border-[#E8E0D5] rounded-lg">
                <span className="text-[#666] font-semibold">Total Amount</span>
                <span className="text-2xl font-bold text-[#C8622A]">{formatCurrency(booking.totalAmount)}</span>
              </div>
              {booking.paidAmount !== undefined && (
                <div className="flex justify-between items-center p-4 bg-[#F0F8F5] border border-[#C8E6C9] rounded-lg">
                  <span className="text-[#2E7D32] font-semibold">Paid Amount</span>
                  <span className="text-lg font-bold text-[#2E7D32]">{formatCurrency(booking.paidAmount)}</span>
                </div>
              )}
              {booking.pendingAmount !== undefined && booking.pendingAmount > 0 && (
                <div className="flex justify-between items-center p-4 bg-[#FFF3E0] border border-[#FFE0B2] rounded-lg">
                  <span className="text-[#E65100] font-semibold">Pending Amount</span>
                  <span className="text-lg font-bold text-[#E65100]">{formatCurrency(booking.pendingAmount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center p-4 bg-[#F9F7F4] rounded-lg">
                <span className="text-[#666]">Payment Status</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeColor(booking.paymentStatus)}`}>
                  {getStatusLabel(booking.paymentStatus)}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Details Section */}
          {booking.deliveryDetails && (
            <div className="space-y-3 pb-6 border-b border-[#E8E0D5]">
              <h3 className="text-lg font-semibold text-[#1A1A1A]">Delivery Details</h3>
              <div className="space-y-3">
                {booking.deliveryDetails.mobileNumber && (
                  <div className="p-4 bg-[#F9F7F4] rounded-lg">
                    <p className="text-[#999] text-sm mb-1">Mobile Number</p>
                    <p className="text-[#1A1A1A] font-semibold">{booking.deliveryDetails.mobileNumber}</p>
                  </div>
                )}
                {booking.deliveryDetails.deliveryAddress && (
                  <div className="p-4 bg-[#F9F7F4] rounded-lg">
                    <p className="text-[#999] text-sm mb-1">Delivery Address</p>
                    <p className="text-[#1A1A1A] font-semibold">{booking.deliveryDetails.deliveryAddress}</p>
                  </div>
                )}
                {booking.deliveryDetails.landmark && (
                  <div className="p-4 bg-[#F9F7F4] rounded-lg">
                    <p className="text-[#999] text-sm mb-1">Landmark</p>
                    <p className="text-[#1A1A1A] font-semibold">{booking.deliveryDetails.landmark}</p>
                  </div>
                )}
                {booking.deliveryDetails.pincode && (
                  <div className="p-4 bg-[#F9F7F4] rounded-lg">
                    <p className="text-[#999] text-sm mb-1">Pincode</p>
                    <p className="text-[#1A1A1A] font-semibold">{booking.deliveryDetails.pincode}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order ID */}
          <div className="p-4 bg-[#F9F7F4] rounded-lg">
            <p className="text-[#999] text-sm mb-1">Order ID</p>
            <p className="text-[#1A1A1A] font-semibold text-sm font-mono">{booking.razorpayOrderId || booking._id}</p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-100 text-[#1A1A1A] font-semibold rounded-lg hover:bg-gray-200 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrderDetailsModal
