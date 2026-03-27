import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useListing } from '../hooks/useListings'
import ImageGallerySection from '../components/listing-detail/ImageGallerySection'
import ListingDetailsSection from '../components/listing-detail/ListingDetailsSection'
import BookingSection from '../components/listing-detail/BookingSection'

const ListingDetail = () => {
  const { id } = useParams()
  const { listing, loading, error } = useListing(id)
  const [activeImage, setActiveImage] = useState(0)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

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

  return (
    <div className="pt-20 pb-20 max-w-5xl mx-auto px-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#AAA] mb-8">
        <Link to="/" className="hover:text-[#C8622A] transition-colors">Browse</Link>
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

          {/* Booking Section */}
          <BookingSection
            listing={listing}
            startDate={startDate}
            onStartDateChange={setStartDate}
            endDate={endDate}
            onEndDateChange={setEndDate}
            onRentClick={() => console.log('Rent clicked')}
            available={available}
          />
        </div>
      </div>
    </div>
  )
}

export default ListingDetail