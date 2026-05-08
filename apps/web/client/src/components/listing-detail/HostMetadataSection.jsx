import React, { useState } from 'react'
import { motion } from 'motion/react'
import QuickMessageDialog from '../messaging/QuickMessageDialog'

// ─── Host Card ─────────────────────────────────────────────────────────────────
export const HostCard = ({
  ownerName,
  displayName,
  ownerId,
  listingId,
  onMessageClick,
}) => {
  const [isMessagingDialogOpen, setIsMessagingDialogOpen] = useState(false)
  const name = displayName || ownerName || 'Host'

  const handleMessageClick = () => {
    if (onMessageClick) {
      console.log('onMessageClick')
      onMessageClick()
    } else {
      setIsMessagingDialogOpen(true)
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(0,77,64,0.05) 0%, rgba(212,175,55,0.05) 100%)',
          border: '1px solid rgba(0,77,64,0.12)',
        }}
      >
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm"
            style={{
              background: 'linear-gradient(135deg, #004D40, #00342B)',
              boxShadow: '0 4px 12px rgba(0,77,64,0.25)',
            }}
          >
            {name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em]" style={{ color: '#9E9E7A' }}>
              Curated by
            </p>
            <p className="text-sm font-bold" style={{ color: '#1A1A14' }}>
              {name}
            </p>
          </div>
        </div>

        <motion.button
          onClick={handleMessageClick}
          whileHover={{ y: -1, scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.2 }}
          className="px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-colors w-full sm:w-auto"
          style={{
            border: '1.5px solid rgba(0,77,64,0.4)',
            color: '#004D40',
            backgroundColor: 'rgba(0,77,64,0.05)',
          }}
        >
          Message Host
        </motion.button>
      </motion.div>

      {/* Messaging dialog */}
      {ownerId && listingId && (
        <QuickMessageDialog
          listingId={listingId}
          ownerId={ownerId}
          ownerName={name}
          isOpen={isMessagingDialogOpen}
          onClose={() => setIsMessagingDialogOpen(false)}
        />
      )}
    </>
  )
}

// ─── Metadata Cell ─────────────────────────────────────────────────────────────
const MetaCell = ({ label, value, icon, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay }}
    className="flex flex-col gap-1.5 p-3 md:p-4"
  >
    <p className="text-[9px] md:text-[10px] font-extrabold uppercase tracking-[0.18em]" style={{ color: '#9E9E7A' }}>
      {label}
    </p>
    <div className="flex items-center gap-1.5">
      {icon && <span className="text-sm">{icon}</span>}
      <p className="text-xs md:text-sm font-semibold" style={{ color: '#1A1A14' }}>
        {value || '—'}
      </p>
    </div>
  </motion.div>
)

// ─── Metadata Grid ─────────────────────────────────────────────────────────────
const MetaGrid = ({ listing }) => {
  const cells = [
    { label: 'Material',  value: listing.material,  icon: '🧵' },
    { label: 'Fit / Size', value: listing.size,     icon: '📐' },
    { label: 'Occasion',  value: listing.occasion,  icon: '🎊' },
    { label: 'Condition', value: listing.condition, icon: '✨' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl overflow-hidden"
      style={{
        border: '1px solid #E8E4D4',
        backgroundColor: '#FDFCF0',
        boxShadow: '0 4px 20px rgba(0,77,64,0.04)',
      }}
    >
      {/* Section header */}
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{
          borderBottom: '1px solid #E8E4D4',
          background: 'linear-gradient(90deg, rgba(0,77,64,0.04) 0%, transparent 100%)',
        }}
      >
        <div className="h-3 w-0.5 rounded-sm" style={{ background: 'linear-gradient(180deg, #D4AF37, #C8622A)' }} />
        <p className="text-[10px] font-extrabold uppercase tracking-[0.16em]" style={{ color: '#7D6B41' }}>
          Outfit Details
        </p>
      </div>

      <div className="grid grid-cols-2">
        {cells.map((cell, i) => {
          const isLastOdd = i === cells.length - 1 && cells.length % 2 !== 0
          return (
            <div
              key={i}
              style={{
                borderRight: i % 2 === 0 && !isLastOdd ? '1px solid #E8E4D4' : 'none',
                borderBottom: i < cells.length - 2 ? '1px solid #E8E4D4' : 'none',
                gridColumn: isLastOdd ? 'span 2' : 'span 1',
              }}
            >
              <MetaCell
                label={cell.label}
                value={cell.value}
                icon={cell.icon}
                delay={i * 0.06}
              />
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

// ─── Host Metadata Section ─────────────────────────────────────────────────────
const HostMetadataSection = ({ listing }) => {
  return (
    <div className="flex flex-col gap-4">
      <MetaGrid listing={listing} />
    </div>
  )
}

export default HostMetadataSection