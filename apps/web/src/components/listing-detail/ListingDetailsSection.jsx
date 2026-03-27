import React from 'react'

const ListingDetailsSection = ({ listing }) => {
  const locationDisplay = listing.location?.area
    ? `${listing.location.area}, ${listing.location.city || 'Mumbai'}`
    : ''
  const ownerName = listing.userId?.name || 'Owner'

  return (
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
        <span className="text-xs bg-white border border-[#E8E0D5] text-[#555] px-3 py-1.5 rounded-full">
          {listing.isActive ? '✓ Available' : 'Unavailable'}
        </span>
      </div>

      {/* Description */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-[#1A1A1A] mb-2">About this outfit</h3>
        <p className="text-[#666] text-sm leading-relaxed">{listing.description}</p>
      </div>
    </div>
  )
}

export default ListingDetailsSection
