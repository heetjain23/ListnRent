import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useListing } from '../hooks/useListings'
import ImageGallerySection from '../components/listing-detail/ImageGallerySection'
import ListingDetailsSection from '../components/listing-detail/ListingDetailsSection'
import BookingSection from '../components/listing-detail/BookingSection'
import PaymentCheckout from '../components/ui/PaymentCheckout'

const ListingDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { listing, loading, error } = useListing(id)
  const [activeImage, setActiveImage] = useState(0)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showPayment, setShowPayment] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  // Scroll to top when listing changes
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  // Loading skeleton
  if (loading) {
    return (
      <div className="pt-20 pb-20 max-w-5xl mx-auto px-6 animate-pulse">
        <div className="h-4 bg-[#F0EBE3] rounded w-48 mb-8" />
        <div className="grid md:grid-cols-2 gap-10">
          <div className="aspect-3/4 bg-[#F0EBE3] rounded-2xl" />
          <div className="space-y-4">
            <div className="h-6 bg-[#F0EBE3] rounded w-3/4" />
            <div className="h-4 bg-[#F0EBE3] rounded w-1/2" />
            <div className="h-20 bg-[#F0EBE3] rounded" />
          </div>
        </div>
      </div>
    )
  }

  // Error / Not found
  if (error || !listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 pt-16">
        <p className="text-6xl">🪭</p>
        <h2 className="text-xl font-semibold text-[#1A1A1A]">
          {error || 'Outfit not found'}
        </h2>
        <Link to="/" className="text-sm text-[#C8622A] underline">
          Back to Browse
        </Link>
      </div>
    )
  }

  const available = listing.isActive

  const handleRentClick = () => {
    console.log('Rent clicked - startDate:', startDate, 'endDate:', endDate)
    if (!startDate || !endDate) {
      alert('Please select both start and end dates')
      return
    }
    console.log('Setting showPayment to true')
    setShowPayment(true)
  }

  const handlePaymentSuccess = (booking) => {
    setBookingSuccess(true)
    setTimeout(() => {
      navigate('/dashboard', { state: { bookingSuccess: true, bookingId: booking._id, activeTab: 'orders' } })
    }, 2000)
  }

  const handlePaymentCancel = () => {
    setShowPayment(false)
  }

  // Show Success Message
  if (bookingSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 pt-16">
        <p className="text-7xl">✅</p>
        <h2 className="text-2xl font-bold text-[#1A1A1A]">Booking Confirmed!</h2>
        <p className="text-[#666]">Your rental booking has been successfully created</p>
        <p className="text-sm text-[#AAA]">Redirecting to dashboard...</p>
      </div>
    )
  }

  return (
    <div className="pt-20 pb-20 max-w-5xl mx-auto px-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#AAA] mb-8">
        <Link to="/collection" className="hover:text-[#C8622A] transition-colors">Browse</Link>
        <span>/</span>
        <span className="text-[#1A1A1A] truncate max-w-xs">{listing.title}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        {/* Image Gallery Section */}
        <ImageGallerySection
          images={listing.images}
          activeImage={activeImage}
          onImageChange={setActiveImage}
          title={listing.title}
        />

        {/* Details and Booking */}
        <div>
          {/* Listing Details Section */}
          <ListingDetailsSection listing={listing} />

          {/* Booking Section or Payment Checkout */}
          {showPayment ? (
            <PaymentCheckout
              listing={listing}
              renterId={listing.userId}
              startDate={startDate}
              endDate={endDate}
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            />
          ) : (
            <BookingSection
              listing={listing}
              startDate={startDate}
              onStartDateChange={setStartDate}
              endDate={endDate}
              onEndDateChange={setEndDate}
              onRentClick={handleRentClick}
              available={available}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default ListingDetail