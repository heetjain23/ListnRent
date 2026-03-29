import React, { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useListings } from '../hooks/useListings'
import { CATEGORIES, OCCASIONS } from '../constants'
import Header from '../components/collection/Header'
import Sidebar from '../components/collection/Sidebar'
import FilterModal from '../components/collection/FilterModal'
import TopBar from '../components/collection/TopBar'
import Grid from '../components/collection/Grid'
import Pagination from '../components/collection/Pagination'

const Collection = () => {
  const [searchParams] = useSearchParams()
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Initialize filters from URL params on first render
  const [selectedCategories, setSelectedCategories] = useState(() => {
    const param = searchParams.get('category')
    return param && CATEGORIES.includes(param) ? [param] : []
  })

  const [selectedOccasion, setSelectedOccasion] = useState(() => {
    const param = searchParams.get('occasion')
    return param && OCCASIONS.includes(param) ? param : ''
  })

  const [selectedSize, setSelectedSize] = useState('All')
  const [priceRange, setPriceRange] = useState(null)
  const [sortBy, setSortBy] = useState('Relevance')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  // Update filters if URL params change
  useEffect(() => {
    const occasionParam = searchParams.get('occasion')
    const categoryParam = searchParams.get('category')

    if (occasionParam && OCCASIONS.includes(occasionParam)) {
      setSelectedOccasion(occasionParam)
    } else {
      setSelectedOccasion('')
    }

    if (categoryParam && CATEGORIES.includes(categoryParam)) {
      setSelectedCategories([categoryParam])
    } else {
      setSelectedCategories([])
    }
  }, [searchParams])

  // Fetch listings with category and occasion filters
  const filters = {}
  if (selectedCategories.length > 0) filters.category = selectedCategories
  if (selectedOccasion) filters.occasion = [selectedOccasion]
  const { listings, loading, error } = useListings(filters)

  // Calculate dynamic price range from listings
  const minMaxPrice = useMemo(() => {
    const prices = listings.map((l) => l.pricePerDay || 0).filter((p) => p > 0)
    const min = Math.floor(Math.min(...prices) / 100) * 100
    const max = Math.ceil(Math.max(...prices) / 100) * 100
    return [min, max]
  }, [listings])

  // Initialize price range when listings load
  useEffect(() => {
    if (listings.length > 0 && priceRange === null) {
      setPriceRange(minMaxPrice)
    }
  }, [listings, minMaxPrice, priceRange])

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Apply all filters and sorting
  const filtered = useMemo(() => {
    let result = listings

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (l) =>
          l.title?.toLowerCase().includes(query) ||
          l.category?.toLowerCase().includes(query) ||
          l.occasion?.toLowerCase().includes(query)
      )
    }

    // Size filter
    if (selectedSize !== 'All') {
      result = result.filter((l) => {
        const listingSize = l.size?.toLowerCase() || ''
        const filterSize = selectedSize.toLowerCase()
        return listingSize.includes(filterSize)
      })
    }

    // Price filter - only apply if priceRange is set
    if (priceRange) {
      result = result.filter((l) => {
        const price = l.pricePerDay || 0
        return price >= priceRange[0] && price <= priceRange[1]
      })
    }

    // Sorting
    if (sortBy === 'Price: Low to High') {
      result = [...result].sort((a, b) => (a.pricePerDay || 0) - (b.pricePerDay || 0))
    } else if (sortBy === 'Price: High to Low') {
      result = [...result].sort((a, b) => (b.pricePerDay || 0) - (a.pricePerDay || 0))
    }

    return result
  }, [listings, selectedSize, priceRange, sortBy, searchQuery])

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const startIdx = (currentPage - 1) * itemsPerPage
  const paginatedItems = filtered.slice(startIdx, startIdx + itemsPerPage)

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    )
    setCurrentPage(1)
  }

  const handleOccasionChange = (occasion) => {
    setSelectedOccasion(occasion)
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] pt-24 pb-20 overflow-x-hidden">
      <div className="px-4 md:px-6 max-w-7xl mx-auto">
        {/* Header Component */}
        <Header
          selectedCategories={selectedCategories}
          toggleCategory={toggleCategory}
          onFilterClick={() => setShowFilterModal(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Main Layout */}
        <div className="flex gap-6 md:gap-8">
          {/* Sidebar Filters Component - Desktop Only */}
          <div className="hidden md:block md:w-64 shrink-0">
            <Sidebar
              selectedCategories={selectedCategories}
              toggleCategory={toggleCategory}
              selectedSize={selectedSize}
              setSelectedSize={setSelectedSize}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              selectedOccasion={selectedOccasion}
              handleOccasionChange={handleOccasionChange}
              setCurrentPage={setCurrentPage}
              minMaxPrice={minMaxPrice}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Top Bar Component - Desktop Only */}
            <div className="hidden md:block">
              <TopBar
                filteredCount={filtered.length}
                sortBy={sortBy}
                setSortBy={setSortBy}
                setCurrentPage={setCurrentPage}
              />
            </div>

            {/* Grid Component (handles all states: loading, error, empty, listings) */}
            <Grid
              paginatedItems={paginatedItems}
              loading={loading}
              error={error}
              filteredCount={filtered.length}
            />

            {/* Pagination Component */}
            {!loading && !error && filtered.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
              />
            )}
          </div>
        </div>

        {/* Filter Modal - Mobile Only */}
        <FilterModal
          isOpen={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          selectedCategories={selectedCategories}
          toggleCategory={toggleCategory}
          selectedSize={selectedSize}
          setSelectedSize={setSelectedSize}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          selectedOccasion={selectedOccasion}
          handleOccasionChange={handleOccasionChange}
          minMaxPrice={minMaxPrice}
        />
      </div>
    </div>
  )
}

export default Collection
