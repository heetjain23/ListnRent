import React, { useState } from 'react'
import HeroSection from '../components/home/HeroSection'
import CuratedOccasionsSection from '../components/home/CuratedOccasionsSection'
import SearchAndFilterSection from '../components/home/SearchAndFilterSection'
import SeamlessJourneySection from '../components/home/SeamlessJourneySection'
import ListingsGridSection from '../components/home/ListingsGridSection'
import TrendingNowSection from '../components/home/TrendingNowSection'
import { useListings } from '../hooks/useListings'

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
      <HeroSection />
      <CuratedOccasionsSection />
      <SearchAndFilterSection
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />
      <ListingsGridSection
        listings={filtered}
        loading={loading}
        error={error}
      />
      <SeamlessJourneySection />
      <TrendingNowSection listings={listings} loading={loading} />
    </div>
  )
}

export default Home