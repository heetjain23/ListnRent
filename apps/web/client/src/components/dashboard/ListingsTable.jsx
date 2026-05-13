import React, { useState } from 'react'
import { getOptimizedImageUrl } from '../../services/cloudinary'
import ConfirmationModal from '../ui/ConfirmationModal'

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  Available: {
    dot: 'bg-emerald-400',
    badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    label: 'Available',
  },
  Inactive: {
    dot: 'bg-[#C8C0B0]',
    badge: 'bg-[#F5F1EB] text-[#8B7E6E] border border-[#E0D8CD]',
    label: 'Inactive',
  },
  Rented: {
    dot: 'bg-amber-400',
    badge: 'bg-amber-50 text-amber-700 border border-amber-200',
    label: 'Rented',
  },
  Draft: {
    dot: 'bg-blue-400',
    badge: 'bg-blue-50 text-blue-700 border border-blue-200',
    label: 'Draft',
  },
  AdminHidden: {
    dot: 'bg-rose-400',
    badge: 'bg-rose-50 text-rose-700 border border-rose-200',
    label: 'Hidden by admin',
  },
}

const getStatus = (listing) => {
  if (listing.adminHidden) return 'AdminHidden'
  if (listing.isDraft) return 'Draft'
  if (!listing.isActive) return 'Inactive'
  return 'Available'
}

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = ({ onCreateNew }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div
      className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5 text-3xl"
      style={{
        background: 'linear-gradient(135deg, rgba(0,52,43,0.08) 0%, rgba(212,175,55,0.12) 100%)',
        border: '1px solid rgba(212,175,55,0.2)',
      }}
    >
      👗
    </div>
    <h4
      className="text-lg font-black text-[#1A1A1A] mb-2"
      style={{ fontFamily: "'Georgia', serif" }}
    >
      Your atelier awaits
    </h4>
    <p className="text-sm text-[#999] mb-7 max-w-xs leading-relaxed">
      Start listing your curated outfits and earn from every rental.
    </p>
    <button
      onClick={onCreateNew}
      className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#004D40] text-white text-sm font-bold tracking-wide hover:bg-[#003830] transition-colors shadow-[0_4px_18px_rgba(0,52,43,0.28)]"
    >
      <span className="text-base leading-none">+</span> Add Your First Item
    </button>
  </div>
)

// ─── Skeleton row ─────────────────────────────────────────────────────────────

const SkeletonRow = ({ index }) => (
  <tr
    className="border-b border-[#F0EAE0] animate-pulse"
    style={{ animationDelay: `${index * 80}ms` }}
  >
    <td className="py-4 px-5">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-[#EFE8DE]" />
        <div className="space-y-2">
          <div className="h-3.5 w-36 rounded-full bg-[#EFE8DE]" />
          <div className="h-2.5 w-24 rounded-full bg-[#EFE8DE]" />
        </div>
      </div>
    </td>
    {[1, 2, 3, 4].map((i) => (
      <td key={i} className="py-4 px-5">
        <div className="h-3 w-20 rounded-full bg-[#EFE8DE]" />
      </td>
    ))}
  </tr>
)

// ─── Action Button ────────────────────────────────────────────────────────────

const ActionBtn = ({ onClick, disabled, variant = 'default', children, title }) => {
  const styles = {
    default:
      'text-[#666] hover:text-[#004D40] hover:bg-[#004D40]/6',
    danger:
      'text-[#999] hover:text-red-600 hover:bg-red-50',
    toggle:
      'text-[#999] hover:text-blue-600 hover:bg-blue-50',
    activate:
      'text-[#999] hover:text-purple-600 hover:bg-purple-50',
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
        transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed
        ${styles[variant]}
      `}
    >
      {children}
    </button>
  )
}

// ─── Table Row ────────────────────────────────────────────────────────────────

const ListingRow = ({ listing, onEdit, onDelete, onToggleActive, index }) => {
  const [togglingId, setTogglingId] = useState(null)
  const [rowHovered, setRowHovered] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const status = getStatus(listing)
  const cfg = STATUS_CONFIG[status]

  const handleToggle = async () => {
    if (listing.adminHidden) return

    try {
      setTogglingId(listing._id)
      await onToggleActive(listing._id, listing.isActive)
    } finally {
      setTogglingId(null)
    }
  }

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true)
      await onDelete(listing._id)
      setShowDeleteConfirm(false)
    } finally {
      setIsDeleting(false)
    }
  }

  const imageUrl = listing.images?.[0]

  return (
    <tr
      onMouseEnter={() => setRowHovered(true)}
      onMouseLeave={() => setRowHovered(false)}
      className="border-b border-[#F0EAE0] transition-colors duration-150"
      style={{
        background: rowHovered
          ? 'linear-gradient(90deg, rgba(0,52,43,0.02) 0%, rgba(212,175,55,0.03) 100%)'
          : 'transparent',
      }}
    >
      {/* Item */}
      <td className="py-4 px-5">
        <div className="flex items-center gap-4">
          {/* Image */}
          <div
            className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0"
            style={{ border: '1.5px solid rgba(0,52,43,0.1)' }}
          >
            {imageUrl ? (
              <img
                src={getOptimizedImageUrl(imageUrl, { width: 56, height: 56, quality: 'auto' })}
                alt={listing.title}
                loading="lazy"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl"
                style={{ background: 'linear-gradient(135deg, #E8E0D5, #F5EFE6)' }}>
                👗
              </div>
            )}
            {/* Active indicator */}
            <div
              className={`absolute top-1 right-1 w-2 h-2 rounded-full ${cfg.dot} shadow-sm`}
              style={{ boxShadow: '0 0 0 2px white' }}
            />
          </div>

          {/* Info */}
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#1A1A1A] truncate max-w-50">
              {listing.title}
            </p>
            <p className="text-xs text-[#AAA] mt-0.5">
              Added {new Date(listing.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
            </p>
          </div>
        </div>
      </td>

      {/* Category */}
      <td className="py-4 px-5">
        <span className="text-xs font-semibold text-[#5B5149] bg-[#F5EFE6] px-2.5 py-1 rounded-full">
          {listing.category}
        </span>
      </td>

      {/* Status */}
      <td className="py-4 px-5">
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${cfg.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
      </td>

      {/* Price */}
      <td className="py-4 px-5">
        <div>
          <span className="text-sm font-black text-[#004D40]">
            ₹{listing.pricePerDay?.toLocaleString('en-IN')}
          </span>
          <span className="text-xs text-[#AAA] ml-1">/day</span>
        </div>
        <p className="text-xs text-[#BBA] mt-0.5">
          ₹{(listing.pricePerDay * 2)?.toLocaleString('en-IN')} deposit
        </p>
      </td>

      {/* Actions */}
      <td className="py-4 px-5">
        <div className="flex items-center gap-1">
          {/* Edit */}
          <ActionBtn
            onClick={() => onEdit(listing._id)}
            title="Edit listing"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit
          </ActionBtn>

          {/* Toggle active (hidden for drafts since toggle does nothing for drafts) */}
          {!listing.isDraft && (
            <ActionBtn
              onClick={handleToggle}
              disabled={!!togglingId || listing.adminHidden}
              variant={listing.adminHidden ? 'default' : listing.isActive ? 'toggle' : 'activate'}
              title={listing.adminHidden ? 'Hidden by admin' : listing.isActive ? 'Deactivate listing' : 'Activate listing'}
            >
              {togglingId === listing._id ? (
                <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
                  <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
                </svg>
              ) : listing.adminHidden ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M3 3l18 18" />
                  <path d="M10.58 10.58A2 2 0 0 0 12 16a2 2 0 0 0 1.42-.58" />
                  <path d="M9.88 5.09A10.94 10.94 0 0 1 12 5c5 0 9 7 9 7a21.76 21.76 0 0 1-2.68 3.88" />
                </svg>
              ) : listing.isActive ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/>
                  <line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
              )}
              {togglingId === listing._id ? '…' : listing.adminHidden ? 'Hidden by admin' : listing.isActive ? 'Deactivate' : 'Activate'}
            </ActionBtn>
          )}

          {/* Delete */}
          <ActionBtn
            onClick={() => setShowDeleteConfirm(true)}
            variant="danger"
            title="Delete listing"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
            Delete
          </ActionBtn>
          
          {/* Delete Confirmation Modal */}
          <ConfirmationModal
            isOpen={showDeleteConfirm}
            title="Delete Listing"
            message={`Are you sure you want to delete "${listing.title}"? This action cannot be undone.`}
            confirmText="Delete"
            cancelText="Cancel"
            confirmVariant="danger"
            loading={isDeleting}
            onConfirm={handleConfirmDelete}
            onCancel={() => setShowDeleteConfirm(false)}
          />
        </div>
        {listing.adminHidden && (
          <p className="mt-2 text-xs font-medium text-rose-600">
            Hidden by admin. You cannot re-enable this listing.
          </p>
        )}
      </td>
    </tr>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

const ListingsTable = ({
  listings,
  loading,
  error,
  onEdit,
  onDelete,
  onToggleActive,
  onCreateNew,
}) => {
  const [sortBy, setSortBy] = useState('newest')

  const sorted = [...(listings || [])].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt)
    if (sortBy === 'price-asc') return a.pricePerDay - b.pricePerDay
    if (sortBy === 'price-desc') return b.pricePerDay - a.pricePerDay
    if (sortBy === 'name') return a.title.localeCompare(b.title)
    return 0
  })

  if (error) {
    return (
      <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
        <span className="text-base">⚠️</span> {error}
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-2xl"
      style={{ background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>

      {/* ── Header bar ── */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b border-[#F0EAE0]"
        style={{ background: 'linear-gradient(90deg, #FAFAF8 0%, #F7F2EB 100%)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
            style={{
              background: 'linear-gradient(135deg, #004D40, #00342B)',
              boxShadow: '0 2px 8px rgba(0,52,43,0.22)',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-black text-[#1A1A1A]" style={{ fontFamily: "'Georgia', serif" }}>
              Your Listings
            </h3>
            {!loading && (
              <p className="text-xs text-[#AAA]">{listings?.length || 0} items in your atelier</p>
            )}
          </div>
        </div>

        {/* Sort control */}
        {!loading && listings?.length > 1 && (
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs font-semibold text-[#666] bg-white border border-[#E0D8CD] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#D4AF37] cursor-pointer"
          >
            <option value="newest">Newest first</option>
            <option value="name">Name A–Z</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        )}
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-175">
          <thead>
            <tr className="border-b border-[#F0EAE0]">
              {['Item', 'Category', 'Status', 'Pricing', 'Actions'].map((col) => (
                <th
                  key={col}
                  className="px-5 py-3 text-left text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#B5A898]"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? [0, 1, 2, 3].map((i) => <SkeletonRow key={i} index={i} />)
              : sorted.length === 0
              ? null
              : sorted.map((listing, i) => (
                  <ListingRow
                    key={listing._id}
                    listing={listing}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleActive={onToggleActive}
                    index={i}
                  />
                ))}
          </tbody>
        </table>

        {/* Empty state */}
        {!loading && sorted.length === 0 && (
          <EmptyState onCreateNew={onCreateNew} />
        )}
      </div>

      {/* ── Footer ── */}
      {!loading && sorted.length > 0 && (
        <div
          className="px-5 py-3 border-t border-[#F0EAE0] flex items-center justify-between"
          style={{ background: 'linear-gradient(90deg, #FAFAF8 0%, #F7F2EB 100%)' }}
        >
          <div className="flex items-center gap-4">
            {Object.entries(STATUS_CONFIG).map(([key, val]) => {
              const count = listings.filter((l) => getStatus(l) === key).length
              if (!count) return null
              return (
                <div key={key} className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${val.dot}`} />
                  <span className="text-xs text-[#AAA]">{count} {val.label}</span>
                </div>
              )
            })}
          </div>
          <button
            onClick={onCreateNew}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#004D40] hover:text-[#003830] transition-colors"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add listing
          </button>
        </div>
      )}
    </div>
  )
}

export default ListingsTable