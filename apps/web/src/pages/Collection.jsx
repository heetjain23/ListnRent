import React, { useState, useMemo } from 'react'
import { useListings } from '../hooks/useListings'
import ListingCard from '../components/ui/ListingCard'
import { CATEGORIES, SIZES, GENDER } from '../constants'

const Collection = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeSize, setActiveSize] = useState('All')
  const [activeGender, setActiveGender] = useState('All')
  const [sortBy, setSortBy] = useState('relevance') // relevance, price-low, price-high

  // Fetch listings with category filter
  const { listings, loading, error } = useListings(
    activeCategory !== 'All' ? { category: activeCategory } : {}
  )

  // Apply all filters and sorting
  const filtered = useMemo(() => {
    let result = listings

    // Search filter
    if (searchQuery.trim()) {
      result = result.filter((l) => {
        const title = l.title?.toLowerCase() || ''
        const category = l.category?.toLowerCase() || ''
        const area = l.location?.area?.toLowerCase() || ''
        const query = searchQuery.toLowerCase()
        return title.includes(query) || category.includes(query) || area.includes(query)
      })
    }

    // Size filter
    if (activeSize !== 'All') {
      result = result.filter((l) => {
        const listingSize = l.size?.toLowerCase() || ''
        const filterSize = activeSize.toLowerCase()
        // Match if the listing size contains the filter size
        return listingSize.includes(filterSize)
      })
    }

    // Gender filter
    if (activeGender !== 'All') {
      result = result.filter((l) => {
        const listingGender = l.gender?.toLowerCase() || ''
        const filterGender = activeGender.toLowerCase()
        return listingGender === filterGender
      })
    }

    // Sorting
    if (sortBy === 'price-low') {
      result = [...result].sort((a, b) => (a.pricePerDay || 0) - (b.pricePerDay || 0))
    } else if (sortBy === 'price-high') {
      result = [...result].sort((a, b) => (b.pricePerDay || 0) - (a.pricePerDay || 0))
    }

    return result
  }, [listings, searchQuery, activeSize, activeGender, sortBy])

  return (
    <div className="min-h-screen bg-[#FAF7F2] pt-24 pb-20">
      <div className="px-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-2"
            style={{ fontFamily: "'Georgia', serif" }}>
            Explore All Collections
          </h1>
          <p className="text-[#666] text-lg">
            Browse {listings.length} listings and find the perfect item for your occasion
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#AAA]"
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
              placeholder="Search by title, category, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white rounded-xl text-base text-[#1A1A1A]
                border border-[#E8E0D5] focus:outline-none focus:border-[#C8622A] focus:ring-2 focus:ring-[#C8622A]/20
                placeholder:text-[#BBB] transition-all"
            />
          </div>
        </div>

        {/* Filters & Sorting Row */}
        <div className="mb-8 flex flex-col lg:flex-row gap-6 items-start lg:items-end">
          {/* Category Filter */}
          <div className="w-full lg:w-48">
            <p className="text-sm font-semibold text-[#1A1A1A] mb-3">Category</p>
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="w-full px-4 py-2 bg-white rounded-lg border border-[#E8E0D5]
                text-[#1A1A1A] font-medium focus:outline-none focus:border-[#C8622A] focus:ring-2 focus:ring-[#C8622A]/20
                cursor-pointer transition-all"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Size Filter */}
          <div className="w-full lg:w-48">
            <p className="text-sm font-semibold text-[#1A1A1A] mb-3">Size</p>
            <select
              value={activeSize}
              onChange={(e) => setActiveSize(e.target.value)}
              className="w-full px-4 py-2 bg-white rounded-lg border border-[#E8E0D5]
                text-[#1A1A1A] font-medium focus:outline-none focus:border-[#C8622A] focus:ring-2 focus:ring-[#C8622A]/20
                cursor-pointer transition-all"
            >
              {SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          {/* Gender Filter */}
          <div className="w-full lg:w-48">
            <p className="text-sm font-semibold text-[#1A1A1A] mb-3">Gender</p>
            <select
              value={activeGender}
              onChange={(e) => setActiveGender(e.target.value)}
              className="w-full px-4 py-2 bg-white rounded-lg border border-[#E8E0D5]
                text-[#1A1A1A] font-medium focus:outline-none focus:border-[#C8622A] focus:ring-2 focus:ring-[#C8622A]/20
                cursor-pointer transition-all"
            >
              {GENDER.map((gender) => (
                <option key={gender} value={gender}>
                  {gender}
                </option>
              ))}
            </select>
          </div>

          {/* Sorting */}
          <div className="w-full lg:w-48">
            <p className="text-sm font-semibold text-[#1A1A1A] mb-3">Sort by</p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 bg-white rounded-lg border border-[#E8E0D5]
                text-[#1A1A1A] font-medium focus:outline-none focus:border-[#C8622A] focus:ring-2 focus:ring-[#C8622A]/20
                cursor-pointer transition-all"
            >
              <option value="relevance">Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-[#666]">
            Showing <span className="font-semibold text-[#1A1A1A]">{filtered.length}</span> results
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-[#F0EBE3] rounded-2xl aspect-3/4 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <p className="text-[#C8622A] text-lg">Error loading listings</p>
            <p className="text-[#666] text-sm mt-2">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">No listings found</h3>
            <p className="text-[#666] mb-6">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearchQuery('')
                setActiveCategory('All')
                setActiveSize('All')
                setActiveGender('All')
              }}
              className="px-6 py-2 bg-[#C8622A] text-white rounded-lg hover:bg-[#1A1A1A] transition-colors font-medium"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Listings Grid */}
        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((listing) => (
              <ListingCard key={listing._id || listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Collection
