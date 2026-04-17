import React from 'react'

// ─── Host Card ─────────────────────────────────────────────────────────────────
export const HostCard = ({ ownerName, displayName }) => {
  // Use displayName if available, otherwise fall back to ownerName
  const name = displayName || ownerName || 'Host'
  
  return (
  <div
    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 md:p-4 rounded-2xl"
    style={{ backgroundColor: '#F5F2E8', border: `1px solid #E8E4D4` }}
  >
    <div className="flex items-center gap-3">
      <div
        className="w-10 md:w-11 h-10 md:h-11 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
        style={{ backgroundColor: '#004D40' }}
      >
        {name?.[0]?.toUpperCase() || 'A'}
      </div>
      <div>
        <p className="text-xs md:text-sm font-semibold" style={{ color: '#1A1A14' }}>
          Curated by
        </p>
        <p className="text-sm md:text-base font-semibold" style={{ color: '#1A1A14' }}>
          {name}
        </p>
      </div>
    </div>

    <button
      className="px-4 md:px-5 py-2 rounded-full text-xs md:text-sm font-semibold transition-all duration-200 hover:opacity-80 w-full sm:w-auto"
      style={{
        border: `1.5px solid #004D40`,
        color: '#004D40',
        backgroundColor: 'transparent',
      }}
    >
      Message
    </button>
  </div>
)}

// ─── Metadata Grid ─────────────────────────────────────────────────────────────
const MetaGrid = ({ listing }) => {
  const cells = [
    {
      label: 'Material',
      value: listing.material || '—',
    },
    {
      label: 'Fit ',
      value: listing.size ,
    },
    {
      label: 'Occasion',
      value: listing.occasion || '—',
    },
    {
      label: 'Condition',
      value: listing.condition || '—',
    },
  ]

  return (
    <div
      className="rounded-2xl overflow-hidden mt-4 md:mt-6"
      style={{ border: `1px solid #E8E4D4`, backgroundColor: '#FDFCF0' }}
    >
      <div className="grid grid-cols-2">
        {cells.map((cell, i) => {
          const isLastOdd = i === cells.length - 1 && cells.length % 2 !== 0
          return (
            <div
              key={i}
              className="p-3 md:p-5"
              style={{
                borderRight: i % 2 === 0 && !isLastOdd ? `1px solid #E8E4D4` : 'none',
                borderBottom: i < cells.length - 2 ? `1px solid #E8E4D4` : 'none',
                gridColumn: isLastOdd ? 'span 2' : 'span 1',
              }}
            >
              <p
                className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest mb-1.5"
                style={{ color: '#9E9E7A' }}
              >
                {cell.label}
              </p>
              <p
                className={`text-xs md:text-sm leading-relaxed ${cell.italic ? 'italic' : 'font-medium'}`}
                style={{
                  color: '#1A1A14',
                  fontFamily: cell.italic ? 'Georgia, serif' : 'inherit',
                }}
              >
                {cell.value}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Host Metadata Section ─────────────────────────────────────────────────────
const HostMetadataSection = ({ listing }) => {
  return (
    <div>
      {/* Metadata Grid */}
      <MetaGrid listing={listing} />
    </div>
  )
}

export default HostMetadataSection
