import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import ListingCard from '../components/ui/ListingCard'
import { useListings } from '../hooks/useListings'
import { CATEGORIES } from '../constants'

const Home = () => {
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch from real API — pass category filter (skip 'All')
  const { listings, loading, error } = useListings(
    activeCategory !== 'All' ? { category: activeCategory } : {}
  )

  // Client-side search filter on top of API results
  const filtered = listings.filter((l) => {
    const matchesSearch =
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.location?.area?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  return (
    <div>
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 max-w-6xl mx-auto">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#C8622A] mb-4">
            Mumbai's Ethnic Wear Circle
          </p>
          <h1
            className="text-5xl md:text-6xl font-black text-[#1A1A1A] leading-tight mb-6"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            Wear it once.
            <br />
            <span className="text-[#C8622A]">Rent it forever.</span>
          </h1>
          <p className="text-[#666] text-lg leading-relaxed mb-8 max-w-lg">
            Rent stunning ethnic wear from people in your city. List your wardrobe, earn from it.
            No waste, just style.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/create"
              className="inline-flex items-center gap-2 px-7 py-3 bg-[#1A1A1A] text-[#FAF7F2]
                text-sm font-semibold rounded-full hover:bg-[#C8622A] transition-colors duration-200 tracking-wide"
            >
              + List Your Outfit
            </Link>
            <a
              href="#listings"
              className="inline-flex items-center gap-2 px-7 py-3 border border-[#CCC]
                text-[#1A1A1A] text-sm font-semibold rounded-full hover:border-[#1A1A1A] transition-colors tracking-wide"
            >
              Browse Rentals ↓
            </a>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mt-14 flex flex-wrap gap-8">
          {[
            { label: 'Outfits Listed', value: '120+' },
            { label: 'Happy Renters', value: '340+' },
            { label: 'Avg Savings', value: '₹4,200' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-black text-[#1A1A1A]" style={{ fontFamily: "'Georgia', serif" }}>
                {stat.value}
              </div>
              <div className="text-xs text-[#888] tracking-wide mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Listings Section */}
      <section id="listings" className="px-6 pb-20 max-w-6xl mx-auto">

        {/* Search */}
        <div className="mb-8">
          <div className="relative flex-1">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AAA]"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search sarees, lehengas, sherwanis…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white rounded-full text-sm text-[#1A1A1A]
                border border-[#E8E0D5] focus:outline-none focus:border-[#C8622A]
                placeholder:text-[#BBB] transition-colors"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs font-medium px-4 py-2 rounded-full border transition-all duration-150 tracking-wide ${
                activeCategory === cat
                  ? 'bg-[#1A1A1A] text-[#FAF7F2] border-[#1A1A1A]'
                  : 'bg-white text-[#555] border-[#E8E0D5] hover:border-[#1A1A1A] hover:text-[#1A1A1A]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="bg-[#F0EBE3] aspect-3/4" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-[#F0EBE3] rounded w-3/4" />
                  <div className="h-3 bg-[#F0EBE3] rounded w-1/2" />
                  <div className="h-4 bg-[#F0EBE3] rounded w-1/3 mt-2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">⚠️</p>
            <p className="text-[#999] text-sm">Could not load listings. Is the server running?</p>
            <p className="text-xs text-[#CCC] mt-1">{error}</p>
          </div>
        )}

        {/* Results */}
        {!loading && !error && (
          <>
            <p className="text-xs text-[#999] mb-6 tracking-wide">
              {filtered.length} outfit{filtered.length !== 1 ? 's' : ''} available
              {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
            </p>

            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filtered.map((listing) => (
                  <ListingCard key={listing._id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-4xl mb-3">🪭</p>
                <p className="text-[#999] text-sm">No outfits found. Try a different filter.</p>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}

export default Home