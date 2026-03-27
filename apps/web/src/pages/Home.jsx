import React, { useState } from 'react'
import HeroSection from '../components/home/HeroSection'
import SearchAndFilterSection from '../components/home/SearchAndFilterSection'
import ListingsGridSection from '../components/home/ListingsGridSection'
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
    </div>
  )
}

export default Home