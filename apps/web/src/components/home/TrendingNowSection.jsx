import React from 'react'
import ListingCard from '../ui/ListingCard'

const TrendingNowSection = ({ listings, loading }) => {
  // Show only first 4 listings for trending section
  const trendingListings = listings.slice(0, 4)

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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#00342B]"
              style={{ fontFamily: "'Georgia', serif" }}>
              Trending Now
            </h2>
          </div>
        </div>

        <p className="text-[#666] mb-12 max-w-2xl">
          Most loved outfits on the platform
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingListings.map((listing) => (
            <ListingCard key={listing._id} listing={listing} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default TrendingNowSection
