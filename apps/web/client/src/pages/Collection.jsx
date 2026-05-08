import React, { useState, useMemo, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { useListings } from '../hooks/useListings'
import { CATEGORIES, OCCASIONS, GENDER } from '@listnrent/shared/constants'
import Header from '../components/collection/Header'
import Sidebar from '../components/collection/Sidebar'
import FilterModal from '../components/collection/FilterModal'
import TopBar from '../components/collection/TopBar'
import Grid from '../components/collection/Grid'
import Pagination from '../components/collection/Pagination'
import { useSEO } from '../hooks/useSEO'

// ── Ambient background (mirrors homepage sections) ──────────────────────────
const AmbientAccents = () => (
  <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
    <motion.div
      animate={{ x: [0, 22, -10, 0], y: [0, 16, 6, 0], opacity: [0.22, 0.36, 0.27, 0.22] }}
      transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute -top-[12%] -left-[8%] rounded-full blur-3xl"
      style={{
        width: 'min(42vw, 520px)',
        height: 'min(42vw, 520px)',
        background:
          'radial-gradient(circle, rgba(0,52,43,0.12) 0%, rgba(0,52,43,0.05) 44%, rgba(0,52,43,0) 72%)',
      }}
    />
    <motion.div
      animate={{ x: [0, -18, 8, 0], y: [0, -14, -4, 0], opacity: [0.18, 0.32, 0.22, 0.18] }}
      transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute -bottom-[10%] -right-[6%] rounded-full blur-3xl"
      style={{
        width: 'min(36vw, 460px)',
        height: 'min(36vw, 460px)',
        background:
          'radial-gradient(circle, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.06) 40%, rgba(212,175,55,0) 70%)',
      }}
    />
    <div
      className="absolute inset-0 opacity-[0.022]"
      style={{
        backgroundImage:
          'linear-gradient(rgba(0,52,43,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,52,43,1) 1px, transparent 1px)',
        backgroundSize: '56px 56px',
        maskImage:
          'linear-gradient(180deg, transparent 0%, black 10%, black 90%, transparent 100%)',
        WebkitMaskImage:
          'linear-gradient(180deg, transparent 0%, black 10%, black 90%, transparent 100%)',
      }}
    />
  </div>
)

const Collection = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // ── Filter state (URL-driven) ──────────────────────────────────────────────
  const [selectedCategories, setSelectedCategories] = useState(() => {
    const param = searchParams.get('category')
    return param && CATEGORIES.includes(param) ? [param] : []
  })
  const [selectedOccasion, setSelectedOccasion] = useState(() => {
    const param = searchParams.get('occasion')
    return param && OCCASIONS.includes(param) ? param : ''
  })
  const [selectedGender, setSelectedGender] = useState(() => {
    const param = searchParams.get('gender')
    return param && GENDER.includes(param) ? param : ''
  })
  const [selectedSize, setSelectedSize] = useState('All')
  const [priceRange, setPriceRange] = useState(null)
  const [sortBy, setSortBy] = useState('Relevance')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  // ── SEO ───────────────────────────────────────────────────────────────────
  const seoTitle = selectedOccasion
    ? `${selectedOccasion} Outfit Collection`
    : selectedGender
      ? `${selectedGender} Outfit Collection`
      : 'Outfit Collection'

  useSEO({
    title: seoTitle,
    description:
      'Browse rental outfits by category, occasion, and style. Discover designer lehengas, sarees, and party wear available for rent on ListnRent.',
    keywords:
      'outfit collection, rent outfits, clothing rental collection, lehenga rental, saree rental, occasion wear rental, fashion rental India, ListnRent collection',
    canonicalPath: '/collection',
  })

  // ── Sync URL → state ──────────────────────────────────────────────────────
  useEffect(() => {
    const occasionParam = searchParams.get('occasion')
    const categoryParam = searchParams.get('category')
    const genderParam = searchParams.get('gender')

    setSelectedOccasion(occasionParam && OCCASIONS.includes(occasionParam) ? occasionParam : '')
    setSelectedCategories(categoryParam && CATEGORIES.includes(categoryParam) ? [categoryParam] : [])
    setSelectedGender(genderParam && GENDER.includes(genderParam) ? genderParam : '')
  }, [searchParams])

  useEffect(() => { window.scrollTo(0, 0) }, [])

  // ── Fetch listings ────────────────────────────────────────────────────────
  const filters = {}
  if (selectedCategories.length > 0) filters.category = selectedCategories
  if (selectedOccasion) filters.occasion = [selectedOccasion]
  if (selectedGender) filters.gender = [selectedGender]
  const { listings, loading, error } = useListings(filters)

  // ── Dynamic price range ───────────────────────────────────────────────────
  const minMaxPrice = useMemo(() => {
    const prices = listings.map((l) => l.pricePerDay || 0).filter((p) => p > 0)
    if (!prices.length) return [0, 5000]
    const min = Math.floor(Math.min(...prices) / 100) * 100
    const max = Math.ceil(Math.max(...prices) / 100) * 100
    return [min, max]
  }, [listings])

  useEffect(() => { setPriceRange(null) }, [selectedCategories, selectedOccasion, selectedGender])

  useEffect(() => {
    if (listings.length > 0) {
      const prices = listings.map((l) => l.pricePerDay || 0).filter((p) => p > 0)
      if (prices.length > 0) {
        const min = Math.floor(Math.min(...prices) / 100) * 100
        const max = Math.ceil(Math.max(...prices) / 100) * 100
        setPriceRange([min, max])
      }
    }
  }, [listings])

  // ── Client-side filters + sort ────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = listings

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (l) =>
          l.title?.toLowerCase().includes(query) ||
          l.category?.toLowerCase().includes(query) ||
          l.occasion?.toLowerCase().includes(query)
      )
    }

    if (selectedSize !== 'All') {
      result = result.filter((l) =>
        l.size?.toLowerCase().includes(selectedSize.toLowerCase())
      )
    }

    if (priceRange) {
      result = result.filter((l) => {
        const price = l.pricePerDay || 0
        return price >= priceRange[0] && price <= priceRange[1]
      })
    }

    if (sortBy === 'Price: Low to High')
      result = [...result].sort((a, b) => (a.pricePerDay || 0) - (b.pricePerDay || 0))
    if (sortBy === 'Price: High to Low')
      result = [...result].sort((a, b) => (b.pricePerDay || 0) - (a.pricePerDay || 0))

    return result
  }, [listings, selectedSize, priceRange, sortBy, searchQuery])

  // ── Pagination ────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const startIdx = (currentPage - 1) * itemsPerPage
  const paginatedItems = filtered.slice(startIdx, startIdx + itemsPerPage)

  // ── URL helpers ───────────────────────────────────────────────────────────
  const updateUrlParams = (categories, occasion, gender) => {
    const params = new URLSearchParams()
    if (categories.length > 0) params.set('category', categories[0])
    if (occasion) params.set('occasion', occasion)
    if (gender) params.set('gender', gender)
    navigate(`/collection${params.toString() ? '?' + params.toString() : ''}`)
  }

  const toggleCategory = (category) => {
    // Single-select behavior: selecting a new category replaces the old one.
    const updated = selectedCategories.includes(category) ? [] : [category]
    updateUrlParams(updated, selectedOccasion, selectedGender)
    setCurrentPage(1)
  }

  const handleOccasionChange = (occasion) => {
    updateUrlParams(selectedCategories, occasion, selectedGender)
    setCurrentPage(1)
  }

  const handleGenderChange = (gender) => {
    updateUrlParams(selectedCategories, selectedOccasion, gender)
    setCurrentPage(1)
  }

  const clearAllFilters = () => {
    setSelectedCategories([])
    setSelectedOccasion('')
    setSelectedGender('')
    updateUrlParams([], '', '')
    setSelectedSize('All')
    setPriceRange(minMaxPrice)
    setCurrentPage(1)
  }

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    !!selectedOccasion ||
    !!selectedGender ||
    selectedSize !== 'All'

  // Key for grid animation on page/filter change
  const gridKey = `${currentPage}-${sortBy}-${JSON.stringify(selectedCategories)}-${selectedOccasion}-${selectedGender}-${selectedSize}`

  return (
    <div className="min-h-screen bg-[#FAF7F2] pt-24 pb-20 relative overflow-x-hidden">
      <AmbientAccents />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6">

        {/* ── Page Header ── */}
        <Header
          selectedCategories={selectedCategories}
          toggleCategory={toggleCategory}
          onFilterClick={() => setShowFilterModal(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedOccasion={selectedOccasion}
          hasActiveFilters={hasActiveFilters}
        />

        {/* ── Main layout ── */}
        <div className="flex gap-6 md:gap-8">

          {/* Sidebar — desktop only */}
          <Sidebar
            selectedCategories={selectedCategories}
            toggleCategory={toggleCategory}
            onClearAll={clearAllFilters}
            selectedSize={selectedSize}
            setSelectedSize={setSelectedSize}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            selectedOccasion={selectedOccasion}
            handleOccasionChange={handleOccasionChange}
            selectedGender={selectedGender}
            handleGenderChange={handleGenderChange}
            setCurrentPage={setCurrentPage}
            minMaxPrice={minMaxPrice}
          />

          {/* Main content */}
          <div className="flex-1 min-w-0">

            {/* TopBar — desktop only */}
            <div className="hidden md:block">
              <TopBar
                filteredCount={filtered.length}
                sortBy={sortBy}
                setSortBy={setSortBy}
                setCurrentPage={setCurrentPage}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategories={selectedCategories}
                toggleCategory={toggleCategory}
                selectedOccasion={selectedOccasion}
                handleOccasionChange={handleOccasionChange}
                selectedGender={selectedGender}
                handleGenderChange={handleGenderChange}
                selectedSize={selectedSize}
                setSelectedSize={setSelectedSize}
              />
            </div>

            {/* Grid */}
            <Grid
              paginatedItems={paginatedItems}
              loading={loading}
              error={error}
              filteredCount={filtered.length}
              pageKey={gridKey}
            />

            {/* Pagination */}
            {!loading && !error && filtered.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                setCurrentPage={setCurrentPage}
              />
            )}

            {/* Bottom trust strip */}
            {!loading && filtered.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-10 flex flex-wrap justify-center gap-6 md:gap-10"
              >
                {[
                  { icon: '🔥', label: 'Updated Daily' },
                  { icon: '⭐', label: 'Top Rated Picks' },
                  { icon: '🌿', label: '100% Sustainable' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[#D4AF37] text-sm">{item.icon}</span>
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-[#AAA]">
                      {item.label}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        <FilterModal
          isOpen={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          onClearAll={clearAllFilters}
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