import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'motion/react'
import { CATEGORIES, SIZES, OCCASIONS } from '../../constants'

// ── Filter chip button ──────────────────────────────────────────────────────
const FilterChip = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap border transition-all ${
      active
        ? 'bg-[#00342B] text-white border-[#00342B] shadow-[0_4px_12px_rgba(0,52,43,0.22)]'
        : 'bg-white text-[#555] border-[#E8E0D5] hover:border-[#D4AF37] hover:text-[#00342B]'
    }`}
  >
    {label}
  </button>
)

const FilterModal = ({
  isOpen,
  onClose,
  onClearAll,
  selectedCategories,
  toggleCategory,
  selectedSize,
  setSelectedSize,
  priceRange,
  setPriceRange,
  selectedOccasion,
  handleOccasionChange,
  minMaxPrice,
}) => {
  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  const handleSizeChange = (size) => {
    setSelectedSize(selectedSize === size ? 'All' : size)
  }

  const handlePriceChange = (e) => {
    const newMax = Math.max(parseInt(e.target.value), priceRange[0])
    setPriceRange([priceRange[0], newMax])
  }

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedOccasion !== '' ||
    selectedSize !== 'All' ||
    (priceRange && (priceRange[0] !== minMaxPrice[0] || priceRange[1] !== minMaxPrice[1]))

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Bottom drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-[#E8E0D5]" />
            </div>

            {/* Gold accent line */}
            <div className="h-0.5 mx-6 mt-3 rounded-full bg-[linear-gradient(90deg,#D4AF37,#C8622A,transparent)]" />

            <div className="px-6 pt-5 pb-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2
                  className="text-lg font-black text-[#1A1A1A]"
                  style={{ fontFamily: "'Georgia', serif" }}
                >
                  Refine Results
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onClearAll()
                      onClose()
                    }}
                    disabled={!hasActiveFilters}
                    className="px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-[0.12em] border border-[#E8E0D5] text-[#666] enabled:hover:text-[#C8622A] enabled:hover:border-[#D4AF37] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Clear all
                  </button>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-[#F5F0E8] flex items-center justify-center text-[#666] hover:text-[#1A1A1A] text-sm font-bold"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Category */}
              <div className="mb-6">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#D4AF37] mb-3">
                  Category
                </p>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.filter((cat) => cat !== 'All').map((category) => (
                    <FilterChip
                      key={category}
                      label={category}
                      active={selectedCategories.includes(category)}
                      onClick={() => toggleCategory(category)}
                    />
                  ))}
                </div>
              </div>

              {/* Size */}
              <div className="mb-6">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#D4AF37] mb-3">
                  Size
                </p>
                <div className="flex flex-wrap gap-2">
                  {SIZES.filter((s) => s !== 'All').map((size) => (
                    <button
                      key={size}
                      onClick={() => handleSizeChange(size)}
                      className={`w-10 h-10 rounded-lg text-xs font-bold transition-all ${
                        selectedSize === size
                          ? 'bg-[#00342B] text-white shadow-[0_4px_12px_rgba(0,52,43,0.22)]'
                          : 'bg-[#F5F0E8] text-[#1A1A1A] hover:bg-[#E8E0D5]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              {priceRange && (
                <div className="mb-6">
                  <div className="flex justify-between mb-3">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#D4AF37]">
                      Price / Day
                    </p>
                    <span className="text-xs font-semibold text-[#666]">
                      ₹{priceRange[0]} — ₹{priceRange[1]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={minMaxPrice[0]}
                    max={minMaxPrice[1]}
                    step={100}
                    value={priceRange[1]}
                    onChange={handlePriceChange}
                    className="w-full accent-[#00342B]"
                  />
                </div>
              )}

              {/* Occasion */}
              <div className="mb-8">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#D4AF37] mb-3">
                  Occasion
                </p>
                <div className="flex flex-wrap gap-2">
                  <FilterChip
                    label="All"
                    active={selectedOccasion === ''}
                    onClick={() => handleOccasionChange('')}
                  />
                  {OCCASIONS.filter((o) => o !== 'All').map((occasion) => (
                    <FilterChip
                      key={occasion}
                      label={occasion}
                      active={selectedOccasion === occasion}
                      onClick={() => handleOccasionChange(occasion)}
                    />
                  ))}
                </div>
              </div>

              {/* Apply button */}
              <button
                onClick={onClose}
                className="w-full py-4 rounded-xl bg-[#00342B] text-white font-bold text-sm tracking-[0.08em] shadow-[0_8px_24px_rgba(0,52,43,0.28)] relative overflow-hidden"
              >
                <span className="relative z-10">Apply Filters</span>
                {/* Shimmer */}
                <motion.div
                  className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(212,175,55,0.18),transparent)]"
                  style={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    ,
    document.body
  )
}

export default FilterModal