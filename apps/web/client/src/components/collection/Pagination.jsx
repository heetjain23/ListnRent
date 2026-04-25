import React from 'react'
import { motion } from 'motion/react'

const Pagination = ({ currentPage, totalPages, setCurrentPage }) => {
  if (totalPages <= 1) return null

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Build page list with ellipsis
  const pages = []
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      Math.abs(i - currentPage) <= 1
    ) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-center justify-center gap-2 mt-14 pt-8 border-t border-[rgba(212,175,55,0.2)]"
    >
      {/* Prev */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-10 h-10 rounded-xl border border-[#E8E0D5] flex items-center justify-center text-[#666] hover:border-[#D4AF37] hover:text-[#00342B] disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold text-lg"
      >
        ‹
      </button>

      {/* Pages */}
      {pages.map((page, i) =>
        page === '…' ? (
          <span
            key={`ellipsis-${i}`}
            className="w-10 h-10 flex items-center justify-center text-[#BBB] text-sm"
          >
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
              currentPage === page
                ? 'bg-[#00342B] text-white shadow-[0_4px_14px_rgba(0,52,43,0.25)]'
                : 'border border-[#E8E0D5] text-[#1A1A1A] hover:border-[#D4AF37] hover:text-[#00342B]'
            }`}
          >
            {page}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-10 h-10 rounded-xl border border-[#E8E0D5] flex items-center justify-center text-[#666] hover:border-[#D4AF37] hover:text-[#00342B] disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold text-lg"
      >
        ›
      </button>
    </motion.div>
  )
}

export default Pagination