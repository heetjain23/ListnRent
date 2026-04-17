import React from 'react'

const Pagination = ({ currentPage, totalPages, setCurrentPage }) => {
  if (totalPages <= 1) return null

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1)
    }
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <button
        onClick={handlePrevious}
        className="px-3 py-2 text-[#666] hover:text-[#1A1A1A] transition-colors"
        disabled={currentPage === 1}
      >
        ‹
      </button>
      {[...Array(totalPages)].map((_, i) => {
        const page = i + 1
        const showPage =
          page === currentPage || page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)

        if (!showPage && page > 1 && page < totalPages) {
          return null
        }

        return (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`w-8 h-8 rounded-md font-medium transition-all ${
              currentPage === page
                ? 'bg-[#1A1A1A] text-white'
                : 'text-[#1A1A1A] hover:bg-[#E8E0D5]'
            }`}
          >
            {page}
          </button>
        )
      })}
      <button
        onClick={handleNext}
        className="px-3 py-2 text-[#666] hover:text-[#1A1A1A] transition-colors"
        disabled={currentPage === totalPages}
      >
        ›
      </button>
    </div>
  )
}

export default Pagination
