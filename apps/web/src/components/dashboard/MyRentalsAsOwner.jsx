import React, { useEffect, useState } from 'react'
import { useRentedListings } from '../../hooks/useRentedListings'
import { getOptimizedImageUrl } from '../../services/cloudinary'
import RentalDetailsModal from './RentalDetailsModal'

const MyRentalsAsOwner = () => {
  const { rentedListings, loading, error, fetchRentedListings } = useRentedListings()
  const [selectedRental, setSelectedRental] = useState(null)

  useEffect(() => {
    fetchRentedListings()
  }, [fetchRentedListings])

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
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

  // Transform flat listing+rental data for display
  const getRentalData = () => {
    const rentals = []
    
    rentedListings.forEach((listing) => {
      if (listing.bookings && listing.bookings.length > 0) {
        listing.bookings.forEach((booking) => {
          const isCompleted = isRentalCompleted(booking.endDate)
          const daysRemaining = calculateDaysRemaining(booking.endDate)
          
          rentals.push({
            _id: `${listing._id}-${booking.bookingId}`,
            listingId: listing._id,
            listingTitle: listing.title,
            listingCategory: listing.category,
            listingSize: listing.size,
            listingImage: listing.images?.[0],
            rentalStartDate: booking.startDate,
            rentalEndDate: booking.endDate,
            renterName: booking.renterName || 'Renter',
            renterEmail: booking.renterEmail,
            userId: booking.userId,
            bookingId: booking.bookingId,
            isCompleted,
            daysRemaining,
            paidAmount: booking.paidAmount,
            pendingAmount: booking.pendingAmount,
            paymentDetails: booking.paymentDetails || {
              rentalAmount: booking.rentalAmount,
              depositAmount: booking.depositAmount,
              totalAmount: booking.totalAmount,
              paidAmount: booking.paidAmount,
              pendingAmount: booking.pendingAmount,
              paymentStatus: booking.paymentStatus,
            },
            deliveryDetails: booking.deliveryDetails || {},
          })
        })
      }
    })
    
    return rentals
  }

  const rentals = getRentalData()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-4xl animate-spin mb-4">⏳</div>
          <p className="text-[#666]">Loading rented outfits...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-medium">Error loading rented outfits</p>
        <p className="text-red-600 text-sm mt-2">{error}</p>
        <button
          onClick={fetchRentedListings}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">My Rentals (As Owner)</h2>
        <p className="text-[#666]">Track who's renting your outfits and their rental periods</p>
      </div>

      {rentals.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-[#E8E0D5]">
          <div className="text-4xl mb-3">🎉</div>
          <p className="text-[#666] font-medium">No active rentals</p>
          <p className="text-[#999] text-sm mt-2">Once someone rents your outfit, it will appear here</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {rentals.map((rental) => (
            <div
              key={rental._id}
              onClick={() => setSelectedRental(rental)}
              className="bg-white rounded-lg border border-[#E8E0D5] overflow-hidden hover:shadow-md hover:cursor-pointer transition-all hover:border-[#C8622A]"
            >
              <div className="flex flex-col md:flex-row">
                {/* Image Section */}
                <div className="w-full md:w-40 h-40 shrink-0 bg-[#F5F5F5]">
                  {rental.listingImage && (
                    <img
                      src={getOptimizedImageUrl(rental.listingImage, { width: 160, height: 160, quality: 'auto' })}
                      alt={rental.listingTitle}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                {/* Content Section */}
                <div className="flex-1 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Outfit Details */}
                    <div>
                      <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">{rental.listingTitle}</h3>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-[#999] mb-1">Category</p>
                          <p className="text-sm font-medium text-[#555]">{rental.listingCategory}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#999] mb-1">Size</p>
                          <p className="text-sm font-medium text-[#555]">{rental.listingSize}</p>
                        </div>
                      </div>
                    </div>

                    {/* Rental Period */}
                    <div>
                      <h4 className="text-sm font-semibold text-[#1A1A1A] mb-4">Rental Period</h4>
                      <div className="space-y-2 text-sm text-[#666]">
                        <div>
                          <span className="block text-xs text-[#999] mb-1">From</span>
                          <span className="font-medium">{formatDate(rental.rentalStartDate)}</span>
                        </div>
                        <div>
                          <span className="block text-xs text-[#999] mb-1">To</span>
                          <span className="font-medium">{formatDate(rental.rentalEndDate)}</span>
                        </div>
                        <div className="pt-2 border-t border-[#E8E0D5]">
                          <span className="block text-xs text-[#999] mb-1">Duration</span>
                          <span className="font-medium">
                            {Math.ceil((new Date(rental.rentalEndDate) - new Date(rental.rentalStartDate)) / (1000 * 60 * 60 * 24))} days
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Renter Info & Status */}
                    <div>
                      <h4 className="text-sm font-semibold text-[#1A1A1A] mb-4">Renter & Status</h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-[#999] mb-1">Rented to</p>
                          <p className="text-sm font-medium text-[#555]">{rental.renterName}</p>
                        </div>

                        {!rental.isCompleted ? (
                          <div className="bg-blue-50 border border-blue-200 rounded p-2">
                            <p className="text-xs text-blue-700 font-medium">
                              ⏱️ {rental.daysRemaining > 0 ? `${rental.daysRemaining} days remaining` : 'Ends today'}
                            </p>
                          </div>
                        ) : (
                          <div className="bg-green-50 border border-green-200 rounded p-2">
                            <p className="text-xs text-green-700 font-medium">
                              ✓ Rental Complete
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rental Details Modal */}
      <RentalDetailsModal
        rental={selectedRental}
        isOpen={!!selectedRental}
        onClose={() => setSelectedRental(null)}
      />
    </div>
  )
}

export default MyRentalsAsOwner
