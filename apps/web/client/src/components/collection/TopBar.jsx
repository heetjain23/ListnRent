import React from 'react'

const TopBar = ({ filteredCount, sortBy, setSortBy, setCurrentPage }) => {
  const handleSortChange = (e) => {
    setSortBy(e.target.value)
    setCurrentPage(1)
  }

  return (
    <div className="mb-6 flex items-center justify-between">
      <p className="text-sm text-[#666]">
        Showing <span className="font-semibold text-[#1A1A1A]">{filteredCount}</span> curated pieces in Mumbai
      </p>
      <select
        value={sortBy}
        onChange={handleSortChange}
        className="px-4 py-2 bg-white rounded-lg border border-[#E8E0D5]
          text-[#1A1A1A] text-sm cursor-pointer focus:outline-none focus:border-[#C8622A]"
      >
        <option value="Relevance">Relevance</option>
        <option value="Price: Low to High">Price: Low to High</option>
        <option value="Price: High to Low">Price: High to Low</option>
      </select>
    </div>
  )
}

export default TopBar
