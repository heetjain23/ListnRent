import React from 'react'
import ListingCard from './ListingCard'

const Grid = ({ paginatedItems, loading, error, filteredCount }) => {
  {
    /* Loading State */
  }
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-[#F0EBE3] rounded-2xl aspect-3/4 animate-pulse"
          />
        ))}
      </div>
    )
  }

  {
    /* Error State */
  }
  if (error && !loading) {
    return (
      <div className="text-center py-12">
        <p className="text-[#C8622A] text-lg">Error loading listings</p>
        <p className="text-[#666] text-sm mt-2">{error}</p>
      </div>
    )
  }

  {
    /* Empty State */
  }
  if (!loading && !error && filteredCount === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-[#1A1A1A] mb-2">No pieces found</h3>
        <p className="text-[#666] mb-6">Try adjusting your filters</p>
      </div>
    )
  }

  {
    /* Listings Grid */
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {paginatedItems.map((listing) => (
        <ListingCard key={listing._id || listing.id} listing={listing} />
      ))}
    </div>
  )
}

export default Grid
