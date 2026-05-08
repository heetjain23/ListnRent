import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { getOptimizedImageUrl } from '../../services/cloudinary'

const ListingCard = ({ listing }) => {
  const [hovered, setHovered] = useState(false)

  const id = listing._id || listing.id
  const locationDisplay = listing.location?.area
    ? `${listing.location.area}, ${listing.location.city || 'Mumbai'}`
    : listing.location || ''
  const available = listing.isActive !== undefined ? listing.isActive : listing.available
  const ownerName = listing.owner?.displayName || listing.owner?.name || 'Owner'
  const ownerRating = listing.owner?.rating || null
  const categoryLabel = listing.category || 'Uncategorized'
  const isLongCategory = categoryLabel.length > 16

  const imageUrl = listing.images?.[0]
  const optimizedImage = imageUrl
    ? getOptimizedImageUrl(imageUrl, { width: 500, height: 667 })
    : null
  const optimizedImageMobile = imageUrl
    ? getOptimizedImageUrl(imageUrl, { width: 300, height: 400 })
    : null

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <Link
        to={`/listing/${id}`}
        className="group block relative overflow-hidden rounded-2xl bg-white"
        style={{
          boxShadow: hovered
            ? '0 20px 60px rgba(0,52,43,0.14), 0 0 0 1px rgba(212,175,55,0.28)'
            : '0 4px 20px rgba(0,0,0,0.07), 0 0 0 1px rgba(232,224,213,0.8)',
          transition: 'box-shadow 0.35s ease',
        }}
      >
        {/* Image */}
        <div className="relative overflow-hidden aspect-3/4">
          {imageUrl ? (
            <motion.img
              src={optimizedImage}
              srcSet={`${optimizedImageMobile} 300w, ${optimizedImage} 500w`}
              sizes="(max-width: 640px) 300px, 500px"
              alt={listing.title}
              loading="lazy"
              animate={{ scale: hovered ? 1.07 : 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: 'linear-gradient(145deg, #F0EBE3, #E8DDD1)' }}
            >
              <span className="text-5xl opacity-40">🪭</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_48%,rgba(0,0,0,0.58)_100%)]" />

          {/* Gold shimmer on hover */}
          <motion.div
            animate={{ x: hovered ? '200%' : '-100%' }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 -skew-x-12 bg-[linear-gradient(90deg,transparent,rgba(212,175,55,0.15),transparent)] w-[60%] pointer-events-none"
          />

          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <span
              className={`inline-block text-[10px] font-extrabold uppercase tracking-[0.14em] bg-white/90 backdrop-blur-sm text-[#1A1A1A] border border-white/60 text-center leading-[1.2] whitespace-normal wrap-break-word max-w-42 ${
                isLongCategory ? 'px-2.5 py-1.5 rounded-xl' : 'px-3 py-1 rounded-full'
              }`}
              style={{ textWrap: 'balance' }}
            >
              {categoryLabel}
            </span>
          </div>

          {/* Rating badge */}
          {ownerRating && (
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2.5 py-1">
              <svg className="w-3 h-3 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="text-[10px] font-bold text-white">{ownerRating}</span>
            </div>
          )}

          {/* Price + size overlay at bottom of image */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-xl font-black text-white" style={{ fontFamily: "'Georgia', serif" }}>
                  ₹{listing.pricePerDay}
                </span>
                <span className="text-[11px] text-white/70 font-medium ml-1">/day</span>
              </div>
              {listing.size && (
                <span className="text-[10px] font-bold bg-[rgba(212,175,55,0.92)] text-[#1A1A1A] px-2.5 py-1 rounded-full uppercase tracking-wide">
                  {listing.size}
                </span>
              )}
            </div>
          </div>

          {/* Hover arrow */}
          <motion.div
            animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : 6 }}
            transition={{ duration: 0.25 }}
            className="absolute bottom-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/50 bg-white/20 text-white backdrop-blur-sm text-sm font-bold"
          >
            →
          </motion.div>
        </div>

        {/* Card footer */}
        <div className="p-4">
          <h3
            className="text-sm font-bold text-[#1A1A1A] leading-snug line-clamp-1 mb-1.5"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            {listing.title}
          </h3>

          <div className="flex items-center justify-between">
            <p className="text-[11px] text-[#888] flex items-center gap-1 truncate">
              <svg className="w-3 h-3 shrink-0 text-[#C8622A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{locationDisplay}</span>
            </p>
            <span className="text-[10px] text-[#AAA] font-medium truncate max-w-202 shrink-0">
              {ownerName}
            </span>
          </div>

          {/* Gold accent line on hover */}
          <motion.div
            animate={{ scaleX: hovered ? 1 : 0, originX: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-3 h-0.5 rounded-full bg-[linear-gradient(90deg,#D4AF37,#C8622A,transparent)]"
          />
        </div>
      </Link>
    </motion.div>
  )
}

export default ListingCard