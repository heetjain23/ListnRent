import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { CATEGORIES, SIZES, OCCASIONS, GENDER } from '../../constants'

// ── Collapsible section wrapper ─────────────────────────────────────────────
const SidebarSection = ({ title, children }) => {
  const [open, setOpen] = useState(true)

  return (
    <div className="px-5 py-4 border-b border-[#F5EFE6] last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between mb-3 group"
      >
        <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#1A1A1A]">
          {title}
        </span>
        <motion.span
          animate={{ rotate: open ? 0 : -90 }}
          transition={{ duration: 0.22 }}
          className="text-[#BBB] text-xs"
        >
          ▾
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Custom radio option ─────────────────────────────────────────────────────
const RadioOption = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-3 cursor-pointer group py-0.5">
    <div
      onClick={onChange}
      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0sition-all cursor-pointer ${
        checked
          ? 'border-[#00342B] bg-[#00342B]'
          : 'border-[#D0C8BE] group-hover:border-[#00342B]'
      }`}
    >
      {checked && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
    </div>
    <span
      onClick={onChange}
      className={`text-sm cursor-pointer transition-colors ${
        checked ? 'font-semibold text-[#00342B]' : 'text-[#666] group-hover:text-[#1A1A1A]'
      }`}
    >
      {label}
    </span>
  </label>
)

// ── Custom checkbox option ──────────────────────────────────────────────────
const CheckboxOption = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-3 cursor-pointer group py-0.5">
    <div
      onClick={onChange}
      className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer ${
        checked
          ? 'border-[#00342B] bg-[#00342B]'
          : 'border-[#D0C8BE] group-hover:border-[#00342B]'
      }`}
    >
      {checked && (
        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </div>
    <span
      onClick={onChange}
      className={`text-sm cursor-pointer transition-colors ${
        checked ? 'font-semibold text-[#00342B]' : 'text-[#666] group-hover:text-[#1A1A1A]'
      }`}
    >
      {label}
    </span>
  </label>
)

const Sidebar = ({
  selectedCategories,
  toggleCategory,
  onClearAll,
  selectedSize,
  setSelectedSize,
  priceRange,
  setPriceRange,
  selectedOccasion,
  handleOccasionChange,
  selectedGender,
  handleGenderChange,
  setCurrentPage,
  minMaxPrice,
}) => {
  const handleSizeChange = (size) => {
    setSelectedSize(selectedSize === size ? 'All' : size)
    setCurrentPage(1)
  }

  const handlePriceChange = (e) => {
    const newMax = Math.max(parseInt(e.target.value), priceRange[0])
    setPriceRange([priceRange[0], newMax])
    setCurrentPage(1)
  }

  return (
    <div className="w-full md:w-64 shrink-0 hidden md:block">
      <div
        className="sticky top-24 rounded-2xl overflow-hidden"
        style={{
          background: 'white',
          boxShadow: '0 4px 24px rgba(0,0,0,0.07), 0 0 0 1px rgba(232,224,213,0.8)',
          maxHeight: 'calc(100vh - 8rem)',
          overflowY: 'auto',
        }}
      >
        {/* Sidebar header */}
        <div
          className="px-5 py-4 border-b border-[#F5EFE6]"
          style={{ background: 'linear-gradient(135deg, rgba(0,52,43,0.025), rgba(212,175,55,0.04))' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#D4AF37]">
                Filters
              </span>
            </div>
            <button
              onClick={onClearAll}
              className="text-[10px] font-semibold uppercase tracking-wider text-[#AAA] hover:text-[#C8622A] transition-colors"
            >
              Clear all
            </button>
          </div>
        </div>

        {/* Gender */}
        <SidebarSection title="Gender">
          <div className="flex flex-col gap-2">
            <RadioOption
              label="All"
              checked={selectedGender === ''}
              onChange={() => { handleGenderChange(''); setCurrentPage(1) }}
            />
            {GENDER.filter((g) => g !== 'All').map((gender) => (
              <RadioOption
                key={gender}
                label={gender}
                checked={selectedGender === gender}
                onChange={() => { handleGenderChange(gender); setCurrentPage(1) }}
              />
            ))}
          </div>
        </SidebarSection>

        {/* Category */}
        <SidebarSection title="Category">
          <div className="flex flex-col gap-2">
            {CATEGORIES.filter((c) => c !== 'All').map((category) => (
              <CheckboxOption
                key={category}
                label={category}
                checked={selectedCategories.includes(category)}
                onChange={() => { toggleCategory(category); setCurrentPage(1) }}
              />
            ))}
          </div>
        </SidebarSection>

        {/* Size */}
        <SidebarSection title="Size">
          <div className="flex gap-2 flex-wrap">
            {SIZES.filter((s) => s !== 'All').map((size) => (
              <button
                key={size}
                onClick={() => handleSizeChange(size)}
                className={`w-10 h-10 rounded-lg text-xs font-bold transition-all ${
                  selectedSize === size
                    ? 'bg-[#00342B] text-white shadow-[0_4px_12px_rgba(0,52,43,0.25)]'
                    : 'bg-[#F5F0E8] text-[#1A1A1A] hover:bg-[#E8E0D5]'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </SidebarSection>

        {/* Price Range */}
        <SidebarSection title="Price / Day">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#1A1A1A]">
                ₹{priceRange ? priceRange[0] : minMaxPrice[0]}
              </span>
              <span className="text-xs text-[#AAA]">—</span>
              <span className="text-sm font-semibold text-[#1A1A1A]">
                ₹{priceRange ? priceRange[1] : minMaxPrice[1]}+
              </span>
            </div>
            {priceRange && (
              <input
                type="range"
                min={minMaxPrice[0]}
                max={minMaxPrice[1]}
                step={100}
                value={priceRange[1]}
                onChange={handlePriceChange}
                className="w-full accent-[#00342B]"
              />
            )}
          </div>
        </SidebarSection>

        {/* Occasion */}
        <SidebarSection title="Occasion">
          <div className="flex flex-col gap-2">
            <RadioOption
              label="All"
              checked={selectedOccasion === ''}
              onChange={() => { handleOccasionChange(''); setCurrentPage(1) }}
            />
            {OCCASIONS.filter((o) => o !== 'All').map((occasion) => (
              <RadioOption
                key={occasion}
                label={occasion}
                checked={selectedOccasion === occasion}
                onChange={() => { handleOccasionChange(occasion); setCurrentPage(1) }}
              />
            ))}
          </div>
        </SidebarSection>
      </div>
    </div>
  )
}

export default Sidebar