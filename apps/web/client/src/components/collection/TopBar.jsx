import React from 'react'
import { motion, AnimatePresence } from 'motion/react'

// ── Active filter tags ──────────────────────────────────────────────────────
export const ActiveFilterTags = ({
  selectedCategories,
  toggleCategory,
  selectedOccasion,
  handleOccasionChange,
  selectedGender,
  handleGenderChange,
  selectedSize,
  setSelectedSize,
  setCurrentPage,
}) => {
  const tags = [
    ...selectedCategories.map((c) => ({
      label: c,
      onRemove: () => { toggleCategory(c); setCurrentPage(1) },
    })),
    ...(selectedOccasion
      ? [{ label: `Occasion: ${selectedOccasion}`, onRemove: () => { handleOccasionChange(''); setCurrentPage(1) } }]
      : []),
    ...(selectedGender
      ? [{ label: `Gender: ${selectedGender}`, onRemove: () => { handleGenderChange(''); setCurrentPage(1) } }]
      : []),
    ...(selectedSize !== 'All'
      ? [{ label: `Size: ${selectedSize}`, onRemove: () => { setSelectedSize('All'); setCurrentPage(1) } }]
      : []),
  ]

  if (!tags.length) return null

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="flex flex-wrap gap-2 mb-5 overflow-hidden"
    >
      {tags.map((tag, i) => (
        <motion.span
          key={tag.label}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={{ delay: i * 0.04 }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold text-[#00342B] border border-[rgba(0,52,43,0.2)] bg-[rgba(0,52,43,0.05)]"
        >
          {tag.label}
          <button
            onClick={tag.onRemove}
            className="hover:text-[#C8622A] transition-colors leading-none"
          >
            ✕
          </button>
        </motion.span>
      ))}
    </motion.div>
  )
}

// ── Main TopBar ─────────────────────────────────────────────────────────────
const TopBar = ({
  filteredCount,
  sortBy,
  setSortBy,
  setCurrentPage,
  searchQuery,
  setSearchQuery,
  // for active tags
  selectedCategories,
  toggleCategory,
  selectedOccasion,
  handleOccasionChange,
  selectedGender,
  handleGenderChange,
  selectedSize,
  setSelectedSize,
}) => {
  const handleSortChange = (e) => {
    setSortBy(e.target.value)
    setCurrentPage(1)
  }

  const hasActiveFilters =
    selectedCategories?.length ||
    selectedOccasion ||
    selectedGender ||
    (selectedSize && selectedSize !== 'All')

  return (
    <div className="mb-5">
      {/* Count + sort row */}
      <div className="flex items-center justify-between mb-4">
        {/* Search input */}
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#BBB] text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search the collection..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl border border-[#E8E0D5] text-sm placeholder-[#CCC] focus:outline-none focus:border-[#D4AF37] shadow-sm transition-colors"
          />
        </div>

        <div className="flex items-center gap-4 ml-4">
          <p className="text-sm text-[#888] whitespace-nowrap hidden lg:block">
            <span className="font-bold text-[#1A1A1A]">{filteredCount}</span> pieces
          </p>
          <select
            value={sortBy}
            onChange={handleSortChange}
            className="px-4 py-2.5 bg-white rounded-xl border border-[#E8E0D5] text-sm text-[#1A1A1A] focus:outline-none focus:border-[#D4AF37] cursor-pointer shadow-sm transition-colors whitespace-nowrap"
          >
            <option value="Relevance">Relevance</option>
            <option value="Price: Low to High">Price: Low to High</option>
            <option value="Price: High to Low">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Active filter tags */}
      <AnimatePresence>
        {hasActiveFilters && (
          <ActiveFilterTags
            selectedCategories={selectedCategories}
            toggleCategory={toggleCategory}
            selectedOccasion={selectedOccasion}
            handleOccasionChange={handleOccasionChange}
            selectedGender={selectedGender}
            handleGenderChange={handleGenderChange}
            selectedSize={selectedSize}
            setSelectedSize={setSelectedSize}
            setCurrentPage={setCurrentPage}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default TopBar