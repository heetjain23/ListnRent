import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { getOptimizedImageUrl } from '../../services/cloudinary'

// ─── Status helpers ───────────────────────────────────────────────────────────

const getStatus = (listing) => {
  if (listing.isDraft) return 'Draft'
  if (!listing.isActive) return 'Inactive'
  return 'Available'
}

const STATUS_CONFIG = {
  Available: {
    dot: 'bg-emerald-400',
    badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  },
  Inactive: {
    dot: 'bg-[#C8C0B0]',
    badge: 'bg-[#F5F1EB] text-[#8B7E6E] border border-[#E0D8CD]',
  },
  Rented: {
    dot: 'bg-amber-400',
    badge: 'bg-amber-50 text-amber-700 border border-amber-200',
  },
  Draft: {
    dot: 'bg-blue-400',
    badge: 'bg-blue-50 text-blue-700 border border-blue-200',
  },
}

// ─── Confirm Delete Overlay ───────────────────────────────────────────────────

const DeleteConfirm = ({ title, onConfirm, onCancel, loading }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 8 }}
    transition={{ duration: 0.18 }}
    className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl p-6 text-center"
    style={{
      background: 'rgba(250,247,242,0.97)',
      backdropFilter: 'blur(4px)',
    }}
  >
    <div className="text-3xl mb-3">🗑️</div>
    <p className="text-sm font-bold text-[#1A1A1A] mb-1" style={{ fontFamily: "'Georgia', serif" }}>
      Delete this listing?
    </p>
    <p className="text-xs text-[#AAA] mb-5 max-w-45 leading-relaxed">
      "{title}" will be permanently removed.
    </p>
    <div className="flex gap-2 w-full max-w-50">
      <button
        onClick={onCancel}
        disabled={loading}
        className="flex-1 py-2 rounded-lg text-xs font-bold text-[#666] bg-[#F0EAE0] hover:bg-[#E8E0D5] transition-colors"
      >
        Cancel
      </button>
      <button
        onClick={onConfirm}
        disabled={loading}
        className="flex-1 py-2 rounded-lg text-xs font-bold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-60"
      >
        {loading ? '...' : 'Delete'}
      </button>
    </div>
  </motion.div>
)

// ─── Icon helpers ─────────────────────────────────────────────────────────────

const EditIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
)

const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
)

const ToggleOnIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <rect x="2" y="6" width="20" height="12" rx="6"/>
    <circle cx="16" cy="12" r="4" fill="currentColor" stroke="none"/>
  </svg>
)

const ToggleOffIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
    <rect x="2" y="6" width="20" height="12" rx="6"/>
    <circle cx="8" cy="12" r="4" fill="currentColor" stroke="none" opacity="0.4"/>
  </svg>
)

const SpinnerIcon = () => (
  <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="12" cy="12" r="9" strokeOpacity="0.2"/>
    <path d="M12 3a9 9 0 0 1 9 9" strokeLinecap="round"/>
  </svg>
)

// ─── Main Card ────────────────────────────────────────────────────────────────

const MobileListingCard = ({ listing, onEdit, onDelete, onToggleActive }) => {
  const [toggling, setToggling] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const status = getStatus(listing)
  const cfg = STATUS_CONFIG[status]
  const imageUrl = listing.images?.[0]
  const optimizedImage = imageUrl
    ? getOptimizedImageUrl(imageUrl, { width: 480, height: 220, quality: 'auto' })
    : null

  const handleToggle = async () => {
    try {
      setToggling(true)
      await onToggleActive(listing._id, listing.isActive)
    } finally {
      setToggling(false)
    }
  }

  const handleDelete = async () => {
    try {
      setDeleting(true)
      await onDelete(listing._id)
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: 'white',
        border: '1px solid rgba(232,224,213,0.8)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05), 0 0 0 1px rgba(212,175,55,0)',
      }}
    >
      {/* ── Delete confirm overlay ── */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <DeleteConfirm
            title={listing.title}
            onConfirm={handleDelete}
            onCancel={() => setShowDeleteConfirm(false)}
            loading={deleting}
          />
        )}
      </AnimatePresence>

      {/* ── Hero image ── */}
      <div className="relative overflow-hidden" style={{ height: 180 }}>
        {/* Skeleton shimmer */}
        {!imageLoaded && (
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, #EFE8DE 0%, #E8E0D5 50%, #EFE8DE 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
            }}
          />
        )}

        {optimizedImage ? (
          <img
            src={optimizedImage}
            alt={listing.title}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-5xl"
            style={{
              background: 'linear-gradient(135deg, #EFE8DE, #E0D4C6)',
            }}
          >
            👗
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_50%,rgba(0,0,0,0.35)_100%)]" />

        {/* Status badge — top left */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold px-2.5 py-1 rounded-full backdrop-blur-sm ${cfg.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {status}
          </span>
        </div>

        {/* Price pill — top right */}
        <div className="absolute top-3 right-3">
          <div
            className="px-3 py-1.5 rounded-full text-xs font-black text-[#1A1A1A]"
            style={{
              background: 'linear-gradient(135deg, #D4AF37, #E5C158)',
              boxShadow: '0 2px 8px rgba(212,175,55,0.4)',
            }}
          >
            ₹{listing.pricePerDay?.toLocaleString('en-IN')}/day
          </div>
        </div>

        {/* Title — bottom overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p
            className="text-white text-sm font-bold leading-tight line-clamp-1"
            style={{ textShadow: '0 1px 6px rgba(0,0,0,0.3)', fontFamily: "'Georgia', serif" }}
          >
            {listing.title}
          </p>
        </div>
      </div>

      {/* ── Details strip ── */}
      <div className="px-4 pt-3 pb-2 flex items-center gap-2 border-b border-[#F5EFE6]">
        <span className="text-xs font-semibold text-[#8B7E6E] bg-[#F5EFE6] px-2.5 py-1 rounded-full">
          {listing.category}
        </span>
        {listing.size && (
          <span className="text-xs font-semibold text-[#8B7E6E] bg-[#F5EFE6] px-2.5 py-1 rounded-full">
            {listing.size}
          </span>
        )}
        <span className="ml-auto text-xs text-[#C8C0B0]">
          {new Date(listing.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </span>
      </div>

      {/* ── Pricing detail row ── */}
      <div className="px-4 py-2.5 flex items-center justify-between border-b border-[#F5EFE6]">
        <div className="flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#AAA" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span className="text-xs text-[#AAA]">Deposit</span>
          <span className="text-xs font-bold text-[#666]">
            ₹{(listing.pricePerDay * 2)?.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#AAA" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span className="text-xs text-[#AAA]">
            {listing.location?.area || 'Mumbai'}
          </span>
        </div>
      </div>

      {/* ── Action buttons ── */}
      <div className="p-3 grid grid-cols-3 gap-2">
        {/* Edit */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onEdit(listing._id)}
          className="flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-xl text-[#004D40] transition-colors"
          style={{
            background: 'linear-gradient(135deg, rgba(0,77,64,0.07) 0%, rgba(0,52,43,0.05) 100%)',
            border: '1px solid rgba(0,77,64,0.12)',
          }}
        >
          <EditIcon />
          <span className="text-[10px] font-extrabold tracking-wide uppercase">Edit</span>
        </motion.button>

        {/* Toggle */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleToggle}
          disabled={toggling}
          className={`flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-xl transition-colors disabled:opacity-50 ${
            listing.isActive
              ? 'text-blue-600'
              : 'text-purple-600'
          }`}
          style={{
            background: listing.isActive
              ? 'linear-gradient(135deg, rgba(37,99,235,0.07), rgba(37,99,235,0.04))'
              : 'linear-gradient(135deg, rgba(147,51,234,0.07), rgba(147,51,234,0.04))',
            border: listing.isActive
              ? '1px solid rgba(37,99,235,0.14)'
              : '1px solid rgba(147,51,234,0.14)',
          }}
        >
          {toggling ? <SpinnerIcon /> : listing.isActive ? <ToggleOnIcon /> : <ToggleOffIcon />}
          <span className="text-[10px] font-extrabold tracking-wide uppercase">
            {toggling ? '...' : listing.isActive ? 'Pause' : 'Publish'}
          </span>
        </motion.button>

        {/* Delete */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowDeleteConfirm(true)}
          className="flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-xl text-red-500 transition-colors"
          style={{
            background: 'linear-gradient(135deg, rgba(239,68,68,0.06), rgba(239,68,68,0.04))',
            border: '1px solid rgba(239,68,68,0.12)',
          }}
        >
          <TrashIcon />
          <span className="text-[10px] font-extrabold tracking-wide uppercase">Delete</span>
        </motion.button>
      </div>

      {/* ── Gold accent bottom line ── */}
      <div
        className="h-0.5 mx-3 mb-3 rounded-full opacity-40"
        style={{
          background: 'linear-gradient(90deg, transparent, #D4AF37, #C8622A, transparent)',
        }}
      />

      {/* Shimmer keyframe */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </motion.div>
  )
}

export default MobileListingCard