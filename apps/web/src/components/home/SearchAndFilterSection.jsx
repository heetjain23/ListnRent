import React from 'react'
import { CATEGORIES } from '../../constants'

const SearchAndFilterSection = ({
  searchQuery,
  onSearchChange,
  activeCategory,
  onCategoryChange,
}) => {
  return (
    <section id="listings" className="px-6 pb-20 max-w-6xl mx-auto">
      {/* Search */}
      <div className="mb-8">
        <div className="relative flex-1">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAA]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search sarees, lehengas, sherwanis…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white rounded-full text-sm text-[#1A1A1A]
              border border-[#E8E0D5] focus:outline-none focus:border-[#C8622A]
              placeholder:text-[#BBB] transition-colors"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-8 flex gap-2 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => onCategoryChange(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-[#C8622A] text-white'
                : 'bg-white text-[#1A1A1A] border border-[#E8E0D5] hover:border-[#C8622A]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </section>
  )
}

export default SearchAndFilterSection
