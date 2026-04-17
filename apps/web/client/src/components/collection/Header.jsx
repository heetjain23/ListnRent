import React, { useState } from 'react'
import { CATEGORIES } from '../../constants'
import { FaFilter } from "react-icons/fa6";

const Header = ({
  selectedCategories,
  toggleCategory,
  onFilterClick,
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <div className="mb-8 md:mb-12">
      <h1
        className="text-3xl md:text-5xl font-bold text-[#1A1A1A] mb-2"
        style={{ fontFamily: "'Georgia', serif" }}
      >
        Curated Collections
      </h1>
      <p className="text-sm md:text-lg text-[#666] mb-6">
        Handpicked ensembles for Mumbai's social season.
      </p>

      {/* Mobile Search and Filter Row */}
      <div className="flex gap-3 mb-4 md:mb-0 md:hidden">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search silk sarees, jewelry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-10 bg-white rounded-lg border border-[#E8E0D5]
              text-sm placeholder-[#999] focus:outline-none focus:border-[#C8622A]"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#999]">
            🔍
          </span>
        </div>
        <button
          onClick={onFilterClick}
          className="px-4 py-3 bg-white rounded-lg border border-[#E8E0D5] text-[#1A1A1A] hover:bg-[#F5F5F5] transition-colors"
        >
          <FaFilter />
        </button>
      </div>

      {/* Category Filters - Horizontal Scroll on Mobile */}
      <div className="md:hidden flex gap-2 overflow-x-auto pb-2 md:pb-0">
        <button
          onClick={() => {
            selectedCategories.forEach((cat) => toggleCategory(cat))
          }}
          className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${
            selectedCategories.length === 0
              ? 'bg-[#00342B] text-white'
              : 'bg-[#E8E0D5] text-[#1A1A1A] hover:bg-[#D4C4B0]'
          }`}
        >
          ALL ITEMS
        </button>
        {CATEGORIES.filter((cat) => cat !== 'All').map((category) => (
          <button
            key={category}
            onClick={() => toggleCategory(category)}
            className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${
              selectedCategories.includes(category)
                ? 'bg-[#00342B] text-white'
                : 'bg-[#E8E0D5] text-[#1A1A1A] hover:bg-[#D4C4B0]'
            }`}
          >
            {category.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Desktop Search and Description */}
      <div className="hidden md:block">
        <p className="text-[#666] text-lg">
          Discover Mumbai's most exclusive heritage wardrobes. Curated for the discerning, tailored for the modern.
        </p>
      </div>
    </div>
  )
}

export default Header
