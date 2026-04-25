import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import ListingCard from './ListingCard'

// ── Skeleton card matching the new card design ──────────────────────────────
const SkeletonCard = ({ index }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: index * 0.05 }}
    className="rounded-2xl overflow-hidden"
    style={{ background: '#F0EBE3' }}
  >
    <div className="aspect-3/4 relative overflow-hidden">
      <motion.div
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: index * 0.15 }}
        className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(212,175,55,0.12),rgba(255,255,255,0.25),transparent)] -skew-x-12 w-[60%]"
      />
    </div>
    <div className="p-4 space-y-2.5">
      <div className="h-4 w-3/4 rounded-full bg-[rgba(0,0,0,0.08)]" />
      <div className="h-3 w-1/2 rounded-full bg-[rgba(0,0,0,0.05)]" />
    </div>
  </motion.div>
)

// ── Empty state ─────────────────────────────────────────────────────────────
const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="col-span-full flex flex-col items-center justify-center py-24 text-center"
  >
    <div className="text-6xl mb-6">🔍</div>
    <h3
      className="text-2xl font-black text-[#1A1A1A] mb-3"
      style={{ fontFamily: "'Georgia', serif" }}
    >
      No pieces found
    </h3>
    <p className="text-[#888] text-sm max-w-xs mb-6 leading-relaxed">
      Try adjusting your filters or broadening your search to discover more curated looks.
    </p>
    <div className="h-0.5 w-24 rounded-full bg-[linear-gradient(90deg,#D4AF37,#C8622A,transparent)]" />
  </motion.div>
)

const Grid = ({ paginatedItems, loading, error, filteredCount, pageKey }) => {
  // Loading skeleton
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} index={i} />
        ))}
      </div>
    )
  }

  // Error state
  if (error && !loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="text-5xl mb-4">⚠️</div>
        <p className="text-[#C8622A] font-semibold text-lg">Error loading listings</p>
        <p className="text-[#888] text-sm mt-1">{error}</p>
      </motion.div>
    )
  }

  // Empty state
  if (!loading && !error && filteredCount === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        <EmptyState />
      </div>
    )
  }

  // Listings grid — animate on page/filter changes via pageKey
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pageKey}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5"
      >
        {paginatedItems.map((listing, i) => (
          <motion.div
            key={listing._id || listing.id}
            initial={{ opacity: 0, y: 24, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: i * 0.055, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <ListingCard listing={listing} />
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  )
}

export default Grid