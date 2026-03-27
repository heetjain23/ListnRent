import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useListing } from '../hooks/useListings'
import Button from '../components/ui/Button'
import ProtectedAction from '../components/ProtectedAction'

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

  const calculateTotal = () => {
    if (!startDate || !endDate) return null
    const diff = new Date(endDate) - new Date(startDate)
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    if (days <= 0) return null
    return { days, rental: days * listing.pricePerDay, deposit: listing.deposit }
  }

  const total = calculateTotal()
  const locationDisplay = listing.location?.area
    ? `${listing.location.area}, ${listing.location.city || 'Mumbai'}`
    : ''
  const ownerName = listing.userId?.name || 'Owner'
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
        {/* Image Gallery */}
        <div>
          <div className="aspect-3/4 rounded-2xl overflow-hidden bg-[#F0EBE3] mb-3">
            {listing.images?.[activeImage] ? (
              <img
                src={listing.images[activeImage]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">🪭</div>
            )}
          </div>
          {listing.images?.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {listing.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    activeImage === i ? 'border-[#C8622A]' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-[#C8622A] tracking-widest uppercase">
              {listing.category}
            </span>
            <span className="text-[#DDD]">·</span>
            <span className="text-xs text-[#888]">{listing.occasion}</span>
          </div>

          <h1
            className="text-2xl md:text-3xl font-black text-[#1A1A1A] mb-4 leading-tight"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            {listing.title}
          </h1>

          {/* Owner */}
          <div className="flex items-center gap-3 mb-5 pb-5 border-b border-[#E8E0D5]">
            <div className="w-9 h-9 rounded-full bg-[#C8622A]/20 flex items-center justify-center
              text-[#C8622A] font-bold text-sm">
              {ownerName[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1A1A1A]">{ownerName}</p>
              <p className="text-xs text-[#888]">{locationDisplay}</p>
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-[#F5F0EA] rounded-xl p-4">
              <p className="text-xs text-[#888] mb-1">Rental</p>
              <p className="text-xl font-black text-[#C8622A]">₹{listing.pricePerDay}</p>
              <p className="text-xs text-[#AAA]">per day</p>
            </div>
            <div className="bg-[#F5F0EA] rounded-xl p-4">
              <p className="text-xs text-[#888] mb-1">Deposit</p>
              <p className="text-xl font-black text-[#1A1A1A]">₹{listing.deposit}</p>
              <p className="text-xs text-[#AAA]">refundable</p>
            </div>
          </div>

          {/* Detail chips */}
          <div className="flex flex-wrap gap-2 mb-5">
            <span className="text-xs bg-white border border-[#E8E0D5] text-[#555] px-3 py-1.5 rounded-full">
              Size: {listing.size}
            </span>
            <span className="text-xs bg-white border border-[#E8E0D5] text-[#555] px-3 py-1.5 rounded-full">
              {listing.condition}
            </span>
            <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
              available
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-600 border border-red-200'
            }`}>
              {available ? '✓ Available' : '✗ Rented Out'}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-[#666] leading-relaxed mb-6">{listing.description}</p>

          {/* Booking widget */}
          {available && (
            <div className="bg-[#F5F0EA] rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">Book this outfit</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs text-[#888] mb-1.5">From</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E8E0D5]
                      rounded-lg focus:outline-none focus:border-[#C8622A] text-[#1A1A1A]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#888] mb-1.5">To</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E8E0D5]
                      rounded-lg focus:outline-none focus:border-[#C8622A] text-[#1A1A1A]"
                  />
                </div>
              </div>

              {total && (
                <div className="bg-white rounded-xl p-4 mb-4 text-sm space-y-2">
                  <div className="flex justify-between text-[#555]">
                    <span>₹{listing.pricePerDay} × {total.days} day{total.days > 1 ? 's' : ''}</span>
                    <span>₹{total.rental}</span>
                  </div>
                  <div className="flex justify-between text-[#555]">
                    <span>Refundable deposit</span>
                    <span>₹{total.deposit}</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#1A1A1A] pt-2 border-t border-[#F0EBE3]">
                    <span>Total (incl. deposit)</span>
                    <span>₹{total.rental + total.deposit}</span>
                  </div>
                </div>
              )}

              <ProtectedAction
                actionName="booking"
                onConfirm={() => {
                  console.log('[Booking] Request initiated:', {
                    listingId: listing._id,
                    startDate,
                    endDate,
                  })
                  // Future: Show booking confirmation modal or redirect to payment
                }}
              >
                <Button variant="accent" fullWidth>
                  Request to Book
                </Button>
              </ProtectedAction>
              <p className="text-xs text-center text-[#AAA] mt-3">
                You won't be charged yet — booking pending owner approval
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ListingDetail