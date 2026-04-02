import React from 'react'
import { useNavigate } from 'react-router-dom'
import { getOptimizedImageUrl } from '../../services/cloudinary'

const RentalDetailsModal = ({ rental, isOpen, onClose }) => {
  const navigate = useNavigate()

  if (!isOpen || !rental) return null

  // Helper function to get payment field (check both locations)
  const getPaymentField = (fieldName) => {
    return rental.paymentDetails?.[fieldName] ?? rental[fieldName]
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

  const handleViewOutfit = () => {
    if (rental.listingId) {
      navigate(`/listing-detail/${rental.listingId}`)
      onClose()
    }
  }

  const calculateDaysRemaining = (endDate) => {
    const today = new Date()
    const end = new Date(endDate)
    today.setHours(0, 0, 0, 0)
    end.setHours(0, 0, 0, 0)
    const diffTime = end - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const isRentalCompleted = (endDate) => {
    const today = new Date()
    const end = new Date(endDate)
    today.setHours(0, 0, 0, 0)
    end.setHours(0, 0, 0, 0)
    return today > end
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
    if (!status) return 'Unknown'
    switch (status) {
      case 'completed':
        return '✓ Payment Confirmed'
      case 'failed':
        return '✗ Payment Failed'
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  const daysRemaining = calculateDaysRemaining(rental.rentalEndDate)
  const isCompleted = isRentalCompleted(rental.rentalEndDate)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#E8E0D5] p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#1A1A1A]">Rental Details</h2>
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
              {rental.listingImage && (
                <div className="w-32 h-40 shrink-0 rounded-lg overflow-hidden bg-[#F5F5F5]">
                  <img
                    src={getOptimizedImageUrl(rental.listingImage, { width: 128, height: 160, quality: 'auto' })}
                    alt={rental.listingTitle}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <p className="text-xl font-semibold text-[#1A1A1A] mb-2">{rental.listingTitle}</p>
                <div className="space-y-1 text-sm text-[#666] mb-4">
                  <div>
                    <span className="font-medium">Category:</span> {rental.listingCategory}
                  </div>
                  <div>
                    <span className="font-medium">Size:</span> {rental.listingSize}
                  </div>
                </div>
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
                <p className="text-[#1A1A1A] font-semibold">{formatDate(rental.rentalStartDate)}</p>
              </div>
              <div className="bg-[#F9F7F4] p-4 rounded-lg">
                <p className="text-[#999] text-sm mb-1">End Date</p>
                <p className="text-[#1A1A1A] font-semibold">{formatDate(rental.rentalEndDate)}</p>
              </div>
              <div className="bg-[#F9F7F4] p-4 rounded-lg">
                <p className="text-[#999] text-sm mb-1">Duration</p>
                <p className="text-[#1A1A1A] font-semibold">
                  {Math.ceil((new Date(rental.rentalEndDate) - new Date(rental.rentalStartDate)) / (1000 * 60 * 60 * 24))} days
                </p>
              </div>
              <div className="bg-[#F9F7F4] p-4 rounded-lg">
                <p className="text-[#999] text-sm mb-1">Status</p>
                <div>
                  {isCompleted ? (
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                      ✓ Completed
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
                      ⏱️ {daysRemaining > 0 ? `${daysRemaining} days left` : 'Ends today'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details Section */}
          {(getPaymentField('rentalAmount') !== undefined || getPaymentField('depositAmount') !== undefined || getPaymentField('totalAmount') !== undefined || getPaymentField('paymentStatus')) && (
            <div className="space-y-3 pb-6 border-b border-[#E8E0D5]">
              <h3 className="text-lg font-semibold text-[#1A1A1A]">Payment Details</h3>
              <div className="space-y-3">
                {getPaymentField('rentalAmount') !== undefined && (
                  <div className="flex justify-between items-center p-4 bg-[#F9F7F4] rounded-lg">
                    <span className="text-[#666]">Rental Amount</span>
                    <span className="font-semibold text-[#1A1A1A]">{formatCurrency(getPaymentField('rentalAmount'))}</span>
                  </div>
                )}
                {getPaymentField('depositAmount') !== undefined && (
                  <div className="flex justify-between items-center p-4 bg-[#F9F7F4] rounded-lg">
                    <span className="text-[#666]">Deposit Amount</span>
                    <span className="font-semibold text-[#1A1A1A]">{formatCurrency(getPaymentField('depositAmount'))}</span>
                  </div>
                )}
                {getPaymentField('totalAmount') !== undefined && (
                  <div className="flex justify-between items-center p-4 bg-[#FFFAF5] border border-[#E8E0D5] rounded-lg">
                    <span className="text-[#666] font-semibold">Total Amount</span>
                    <span className="text-2xl font-bold text-[#C8622A]">{formatCurrency(getPaymentField('totalAmount'))}</span>
                  </div>
                )}
                {getPaymentField('paidAmount') !== undefined && (
                  <div className="flex justify-between items-center p-4 bg-[#F0F8F5] border border-[#C8E6C9] rounded-lg">
                    <span className="text-[#2E7D32] font-semibold">Paid Amount</span>
                    <span className="text-lg font-bold text-[#2E7D32]">{formatCurrency(getPaymentField('paidAmount'))}</span>
                  </div>
                )}
                {getPaymentField('pendingAmount') !== undefined && getPaymentField('pendingAmount') > 0 && (
                  <div className="flex justify-between items-center p-4 bg-[#FFF3E0] border border-[#FFE0B2] rounded-lg">
                    <span className="text-[#E65100] font-semibold">Pending Amount</span>
                    <span className="text-lg font-bold text-[#E65100]">{formatCurrency(getPaymentField('pendingAmount'))}</span>
                  </div>
                )}
                {getPaymentField('paymentStatus') && (
                  <div className="flex justify-between items-center p-4 bg-[#F9F7F4] rounded-lg">
                    <span className="text-[#666]">Payment Status</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeColor(getPaymentField('paymentStatus'))}`}>
                      {getStatusLabel(getPaymentField('paymentStatus'))}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Delivery Details Section */}
          {rental.deliveryDetails && Object.keys(rental.deliveryDetails).length > 0 && (
            <div className="space-y-3 pb-6 border-b border-[#E8E0D5]">
              <h3 className="text-lg font-semibold text-[#1A1A1A]">Delivery Details</h3>
              <div className="space-y-3">
                {rental.deliveryDetails.mobileNumber && (
                  <div className="p-4 bg-[#F9F7F4] rounded-lg">
                    <p className="text-[#999] text-sm mb-1">Mobile Number</p>
                    <p className="text-[#1A1A1A] font-semibold">{rental.deliveryDetails.mobileNumber}</p>
                  </div>
                )}
                {rental.deliveryDetails.deliveryAddress && (
                  <div className="p-4 bg-[#F9F7F4] rounded-lg">
                    <p className="text-[#999] text-sm mb-1">Delivery Address</p>
                    <p className="text-[#1A1A1A] font-semibold">{rental.deliveryDetails.deliveryAddress}</p>
                  </div>
                )}
                {rental.deliveryDetails.landmark && (
                  <div className="p-4 bg-[#F9F7F4] rounded-lg">
                    <p className="text-[#999] text-sm mb-1">Landmark</p>
                    <p className="text-[#1A1A1A] font-semibold">{rental.deliveryDetails.landmark}</p>
                  </div>
                )}
                {rental.deliveryDetails.pincode && (
                  <div className="p-4 bg-[#F9F7F4] rounded-lg">
                    <p className="text-[#999] text-sm mb-1">Pincode</p>
                    <p className="text-[#1A1A1A] font-semibold">{rental.deliveryDetails.pincode}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order ID */}
          {rental.bookingId && (
            <div className="p-4 bg-[#F9F7F4] rounded-lg">
              <p className="text-[#999] text-sm mb-1">Order ID</p>
              <p className="text-[#1A1A1A] font-semibold text-sm font-mono">{rental.bookingId}</p>
            </div>
          )}

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

export default RentalDetailsModal
