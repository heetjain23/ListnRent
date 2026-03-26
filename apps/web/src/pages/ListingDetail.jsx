import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { DUMMY_LISTINGS } from '../constants'
import Button from '../components/ui/Button'

const ListingDetail = () => {
  const { id } = useParams()
  const listing = DUMMY_LISTINGS.find((l) => l.id === id)
  const [activeImage, setActiveImage] = useState(0)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 pt-16">
        <p className="text-6xl">🪭</p>
        <h2 className="text-xl font-semibold text-[#1A1A1A]">Outfit not found</h2>
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

  return (
    <div className="pt-20 pb-20 max-w-5xl mx-auto px-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#AAA] mb-8">
        <Link to="/" className="hover:text-[#C8622A] transition-colors">Browse</Link>
        <span>/</span>
        <span className="text-[#1A1A1A]">{listing.title}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        {/* Image Gallery */}
        <div>
          <div className="aspect-3/4 rounded-2xl overflow-hidden bg-[#F0EBE3] mb-3">
            <img
              src={listing.images[activeImage]}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          </div>
          {listing.images.length > 1 && (
            <div className="flex gap-2">
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
          <span className="text-xs font-medium text-[#C8622A] tracking-widest uppercase">
            {listing.category}
          </span>
          <h1
            className="text-2xl md:text-3xl font-black text-[#1A1A1A] mt-2 mb-4 leading-tight"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            {listing.title}
          </h1>

          {/* Owner */}
          <div className="flex items-center gap-3 mb-5 pb-5 border-b border-[#E8E0D5]">
            <div className="w-9 h-9 rounded-full bg-[#C8622A]/20 flex items-center justify-center
              text-[#C8622A] font-bold text-sm">
              {listing.owner.name[0]}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1A1A1A]">{listing.owner.name}</p>
              <div className="flex items-center gap-1 text-xs text-[#888]">
                <svg className="w-3 h-3 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                {listing.owner.rating} · {listing.location}
              </div>
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

          {/* Details chips */}
          <div className="flex flex-wrap gap-2 mb-5">
            <span className="text-xs bg-white border border-[#E8E0D5] text-[#555] px-3 py-1.5 rounded-full">
              Size: {listing.size}
            </span>
            <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
              listing.available
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-600 border border-red-200'
            }`}>
              {listing.available ? '✓ Available' : '✗ Rented Out'}
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-[#666] leading-relaxed mb-6">{listing.description}</p>

          {/* Booking widget */}
          {listing.available && (
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

              {/* Price summary */}
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

              <Button variant="accent" fullWidth>
                Request to Book
              </Button>
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