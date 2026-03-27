import React from 'react'
import ListingCard from '../ui/ListingCard'

const ListingsGridSection = ({ listings, loading, error }) => {
  if (loading) {
    return (
      <div className="px-6 max-w-6xl mx-auto pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-[#F0EBE3] rounded-xl aspect-3/4 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-6 max-w-6xl mx-auto pb-20 text-center">
        <p className="text-[#C8622A]">Error loading listings. Please try again.</p>
      </div>
    )
  }

  if (!listings.length) {
    return (
      <div className="px-6 max-w-6xl mx-auto pb-20 text-center">
        <p className="text-[#666]">No listings found. Try adjusting your search.</p>
      </div>
    )
  }

  return (
    <div className="px-6 max-w-6xl mx-auto pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <ListingCard key={listing._id} listing={listing} />
        ))}
      </div>
    </div>
  )
}

export default ListingsGridSection
