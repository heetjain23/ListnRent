import React from 'react'

// ─── Category Badge ────────────────────────────────────────────────────────────
const CategoryBadge = ({ category = 'Category' }) => (
  <span
    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase"
    style={{
      backgroundColor: '#FFF8E1',
      color: '#7D6B41',
      border: `1px solid #D4AF37`,
    }}
  >
    <span style={{ color: '#D4AF37' }}>◆</span>
    {category}
  </span>
)

const ListingDetailsSection = ({ listing }) => {
  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-4">
      {/* Left — Title and description */}
      <div className="flex-1">
        {/* Title */}
        <h1
          className="text-3xl md:text-4xl font-black leading-tight mb-4"
          style={{ color: '#1A1A14', fontFamily: 'Georgia, serif' }}
        >
          {listing.title}
        </h1>

        {/* Description */}
        <p
          className="text-sm leading-relaxed"
          style={{ color: '#6A6A56', maxWidth: '440px' }}
        >
          {listing.description}
        </p>
      </div>

      {/* Right — Category Badge */}
      <div className="flex items-start justify-start lg:justify-end">
        <CategoryBadge category={listing.category} />
      </div>
    </div>
  )
}

export default ListingDetailsSection