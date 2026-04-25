import React from 'react'
import { motion } from 'motion/react'
import { CATEGORIES } from '../../constants'
import { FaFilter } from 'react-icons/fa6'

const Header = ({
  selectedCategories,
  toggleCategory,
  onFilterClick,
  searchQuery,
  setSearchQuery,
  selectedOccasion,
  hasActiveFilters,
}) => {
  const headlineMain = selectedOccasion
    ? selectedOccasion
    : "Mumbai's"
  const headlineAccent = selectedOccasion ? 'Wear' : 'Finest'

  return (
    <div className="mb-8 md:mb-10">

      {/* ── Eyebrow tag ── */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="inline-flex items-center gap-2 mb-3 rounded-full border border-[rgba(212,175,55,0.3)] bg-[rgba(212,175,55,0.08)] py-1 pl-2 pr-4"
      >
        <span className="rounded-full bg-[#D4AF37] px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#1A1A1A]">
          {selectedOccasion || (selectedCategories[0]) || 'All'}
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8B7340]">
          Curated Collections
        </span>
      </motion.div>

      {/* ── Headline ── */}
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-3xl md:text-5xl font-black text-[#1A1A1A] leading-[1.08] mb-2"
        style={{ fontFamily: "'Georgia', serif" }}
      >
        {headlineMain}{' '}
        <span className="text-[#00342B]">{headlineAccent}</span>
      </motion.h1>

      {/* ── Gold underline ── */}
      <motion.div
        initial={{ scaleX: 0, originX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="mb-3 h-0.5 max-w-50ded-sm bg-[linear-gradient(90deg,#D4AF37,#C8622A,transparent)]"
      />

      {/* ── Desktop subtitle ── */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-sm md:text-base text-[#888] hidden md:block"
      >
        Handpicked ensembles for every celebration — discover, rent, and celebrate sustainably.
      </motion.p>

      {/* ── Mobile: Search + Filter row ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex gap-3 mt-5 md:hidden"
      >
        <div className="flex-1 relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#BBB] text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search lehengas, sarees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-3 bg-white rounded-xl border border-[#E8E0D5] text-sm placeholder-[#CCC] focus:outline-none focus:border-[#D4AF37] shadow-sm transition-colors"
          />
        </div>
        <button
          onClick={onFilterClick}
          className={`px-4 py-3 rounded-xl border flex items-center gap-2 text-sm font-semibold transition-all ${
            hasActiveFilters
              ? 'bg-[#00342B] text-white border-[#00342B] shadow-[0_4px_14px_rgba(0,52,43,0.25)]'
              : 'bg-white border-[#E8E0D5] text-[#1A1A1A]'
          }`}
        >
          <FaFilter size={12} />
          {hasActiveFilters ? 'Active' : 'Filter'}
        </button>
      </motion.div>

      {/* ── Mobile: Category chip scroll ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="flex gap-2 overflow-x-auto pb-2 mt-4 md:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <button
          onClick={() => selectedCategories.forEach((c) => toggleCategory(c))}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widestwhitespace-nowrap border transition-all ${
            selectedCategories.length === 0
              ? 'bg-[#00342B] text-white border-[#00342B] shadow-[0_4px_12px_rgba(0,52,43,0.22)]'
              : 'bg-white text-[#555] border-[#E8E0D5] hover:border-[#D4AF37]'
          }`}
        >
          All
        </button>
        {CATEGORIES.filter((c) => c !== 'All').map((category) => (
          <button
            key={category}
            onClick={() => toggleCategory(category)}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap border transition-all ${
              selectedCategories.includes(category)
                ? 'bg-[#00342B] text-white border-[#00342B] shadow-[0_4px_12px_rgba(0,52,43,0.22)]'
                : 'bg-white text-[#555] border-[#E8E0D5] hover:border-[#D4AF37]'
            }`}
          >
            {category}
          </button>
        ))}
      </motion.div>
    </div>
  )
}

export default Header