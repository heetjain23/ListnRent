import React from 'react'
import { Link } from 'react-router-dom'
import { getOptimizedImageUrl } from '../../services/cloudinary'

const ListingCard = ({ listing }) => {
  // Support both API shape (_id, location.area) and dummy data shape (id, location string)
  const id = listing._id || listing.id
  const locationDisplay = listing.location?.area
    ? `${listing.location.area}, ${listing.location.city || 'Mumbai'}`
    : listing.location || ''
  const available = listing.isActive !== undefined ? listing.isActive : listing.available
  const ownerName = listing.owner?.displayName || listing.owner?.name || 'Owner'
  const ownerRating = listing.owner?.rating || null

  // Optimize image URL for different screen sizes
  const imageUrl = listing.images?.[0]
  const optimizedImage = imageUrl ? getOptimizedImageUrl(imageUrl, { width: 500, height: 667 }) : null
  const optimizedImageMobile = imageUrl ? getOptimizedImageUrl(imageUrl, { width: 300, height: 400 }) : null
  const optimizedImageTablet = imageUrl ? getOptimizedImageUrl(imageUrl, { width: 400, height: 533 }) : null

  return (
    <Link
      to={`/listing/${id}`}
      className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-3/4">
        {imageUrl ? (
          <img
            src={optimizedImage}
            srcSet={`${optimizedImageMobile} 300w, ${optimizedImageTablet} 400w, ${optimizedImage} 500w`}
            sizes="(max-width: 640px) 300px, (max-width: 1024px) 400px, 500px"
            alt={listing.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-[#F0EBE3] flex items-center justify-center">
            <span className="text-4xl">🪭</span>
          </div>
        )}

        {/* Category Badge */}
        <span className="absolute top-3 left-3 text-xs font-medium bg-white/90 backdrop-blur-sm
          text-[#1A1A1A] px-3 py-1 rounded-full tracking-wide">
          {listing.category}
        </span>

        {/* Availability */}
        {!available && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-sm font-semibold tracking-widest uppercase
              bg-black/60 px-4 py-2 rounded-full">
              Rented Out
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-semibold text-[#1A1A1A] leading-snug line-clamp-2 flex-1"
            style={{ fontFamily: "'Georgia', serif" }}>
            {listing.title}
          </h3>
          {listing.size && (
            <span className="text-xs font-medium bg-[#F5F5F5] text-[#1A1A1A] px-2 py-1 rounded whitespace-nowrap">
              {listing.size}
            </span>
          )}
        </div>

        <p className="text-xs text-[#888] mb-3 flex items-center gap-1">
          <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate">{locationDisplay}</span>
        </p>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-[#C8622A]">₹{listing.pricePerDay}</span>
            <span className="text-xs text-[#888]"> / day</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-[#555]">
            {ownerRating && (
              <>
                <svg className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span>{ownerRating}</span>
                <span className="text-[#BBB]">·</span>
              </>
            )}
            <span className="truncate max-w-15">{ownerName}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ListingCard