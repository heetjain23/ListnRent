import React, { useState } from 'react'
import ListingCard from '../collection/ListingCard'

const TrendingNowSection = ({ listings, loading }) => {
  const [carouselIndex, setCarouselIndex] = useState(0)
  // Show only first 4 listings for trending section
  const trendingListings = listings.slice(0, 4)

  const handlePrev = () => {
    setCarouselIndex((prev) => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setCarouselIndex((prev) =>
      Math.min(trendingListings.length - 1, prev + 1)
    )
  }

  if (loading) {
    return (
      <section className="py-16 px-6 bg-[#FDFAF7]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4 text-center"
            style={{ fontFamily: "'Georgia', serif" }}>
            Trending Now
          </h2>
          <p className="text-center text-[#666] mb-12 max-w-2xl mx-auto">
            Most loved outfits on the platform
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl aspect-3/4 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!trendingListings.length) {
    return null
  }

  return (
    <section className="py-16 px-6 bg-[#FDFAF7]">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#00342B]"
              style={{ fontFamily: "'Georgia', serif" }}>
              Trending Now
            </h2>
          </div>
          
          {/* Navigation Arrows - Mobile Only */}
          <div className="md:hidden flex gap-2">
            <button
              onClick={handlePrev}
              disabled={carouselIndex === 0}
              className="w-10 h-10 rounded-full border border-[#D4AF37] text-[#00342B] 
                flex items-center justify-center hover:bg-[#D4AF37]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ‹
            </button>
            <button
              onClick={handleNext}
              disabled={carouselIndex === trendingListings.length - 1}
              className="w-10 h-10 rounded-full border border-[#D4AF37] text-[#00342B] 
                flex items-center justify-center hover:bg-[#D4AF37]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              ›
            </button>
          </div>
        </div>

        <p className="text-[#666] mb-12 max-w-2xl hidden md:block">
          Most loved outfits on the platform
        </p>

        {/* Mobile Carousel */}
        <div className="md:hidden mb-8">
          <div className="flex gap-4 overflow-hidden">
            {trendingListings.map((listing, index) => (
              <div
                key={listing._id}
                className="flex-shrink-0 w-full transition-transform duration-300"
                style={{
                  transform: `translateX(${-carouselIndex * 100}%)`,
                }}
              >
                <ListingCard listing={listing} />
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingListings.map((listing) => (
            <ListingCard key={listing._id} listing={listing} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default TrendingNowSection
