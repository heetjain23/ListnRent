import React, { useEffect, useMemo, useState, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react'
import { toast } from 'sonner'
import { useAuth } from '../hooks/useAuth'
import Loading from '../components/ui/Loading'
import { cartApi } from '../services/api'
import { useSEO } from '../hooks/useSEO'

// ─── Ambient Background (mirrors HeroSection / TrendingNow) ──────────────────
function AmbientBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {/* Emerald glow — top-left */}
      <motion.div
        animate={{ x: [0, 28, -12, 0], y: [0, 18, 6, 0], opacity: [0.38, 0.56, 0.44, 0.38] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[-14%] left-[-10%] rounded-full blur-[56px]"
        style={{
          width: 'min(50vw, 640px)',
          height: 'min(50vw, 640px)',
          background: 'radial-gradient(circle, rgba(0,52,43,0.18) 0%, rgba(0,52,43,0.08) 42%, rgba(0,52,43,0) 72%)',
        }}
      />
      {/* Gold glow — top-right */}
      <motion.div
        animate={{ x: [0, -22, 10, 0], y: [0, 20, 8, 0], opacity: [0.3, 0.5, 0.36, 0.3] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute top-[-8%] right-[-8%] rounded-full blur-[56px]"
        style={{
          width: 'min(44vw, 540px)',
          height: 'min(44vw, 540px)',
          background: 'radial-gradient(circle, rgba(212,175,55,0.22) 0%, rgba(212,175,55,0.1) 38%, rgba(212,175,55,0) 70%)',
        }}
      />
      {/* Terracotta — bottom center */}
      <motion.div
        animate={{ x: [0, 14, -16, 0], y: [0, -14, 10, 0], opacity: [0.2, 0.34, 0.24, 0.2] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        className="absolute bottom-[5%] left-[28%] rounded-full blur-[48px]"
        style={{
          width: 'min(36vw, 440px)',
          height: 'min(36vw, 440px)',
          background: 'radial-gradient(circle, rgba(200,98,42,0.14) 0%, rgba(200,98,42,0.06) 40%, rgba(200,98,42,0) 70%)',
        }}
      />
      {/* Fine grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.028]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,52,43,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,52,43,1) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'linear-gradient(180deg, transparent 0%, black 12%, black 88%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, black 12%, black 88%, transparent 100%)',
        }}
      />
      {/* Floating light beam */}
      <motion.div
        animate={{ opacity: [0.14, 0.3, 0.14] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="pointer-events-none absolute"
        style={{
          top: '42%',
          left: '8%',
          width: 'min(55vw, 700px)',
          height: 'min(10vw, 120px)',
          borderRadius: 999,
          background:
            'linear-gradient(90deg, rgba(212,175,55,0), rgba(212,175,55,0.16), rgba(255,255,255,0.44), rgba(200,98,42,0.12), rgba(212,175,55,0))',
          filter: 'blur(7px)',
          transform: 'rotate(-7deg)',
        }}
      />
      {/* Ambient dots */}
      {[
        { top: '14%', left: '68%', size: 7,  color: 'rgba(212,175,55,0.32)', ring: 'rgba(212,175,55,0.08)', dur: 6.2, delay: 0.4 },
        { top: '74%', left: '16%', size: 9,  color: 'rgba(0,52,43,0.22)',    ring: 'rgba(0,52,43,0.05)',    dur: 5.8, delay: 1.1 },
        { top: '52%', left: '84%', size: 6,  color: 'rgba(200,98,42,0.28)',  ring: 'rgba(200,98,42,0.07)', dur: 7.1, delay: 0.7 },
        { top: '82%', left: '54%', size: 8,  color: 'rgba(212,175,55,0.24)', ring: 'rgba(212,175,55,0.06)', dur: 6.6, delay: 1.5 },
      ].map((pt, i) => (
        <motion.div
          key={i}
          animate={{ scale: [1, 1.45, 1], opacity: [0.42, 0.88, 0.42] }}
          transition={{ duration: pt.dur, delay: pt.delay, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute rounded-full"
          style={{ top: pt.top, left: pt.left, width: pt.size, height: pt.size, background: pt.color, boxShadow: `0 0 0 7px ${pt.ring}` }}
        />
      ))}
    </div>
  )
}

// ─── Cart Item Card ───────────────────────────────────────────────────────────
function CartItemCard({ item, getListing, removingId, onRemove, onCheckout, onNavigate, formatPrice }) {
  const [hovered, setHovered] = useState(false)
  const listing = getListing(item)
  const listingId = String(listing._id || listing.listingId || item.listingId)
  const image = listing.images?.[0]
  const canCheckout = !!item.startDate && !!item.endDate
  const days = Number(item.durationDays) || 1
  const totalCost = days * (Number(listing.pricePerDay) || 0) + (Number(listing.deposit) || 0)
  const listingState = canCheckout
    ? {
        listing,
        renterId: listing.userId,
        eventDate: item.eventDate || null,
        startDate: item.startDate,
        endDate: item.endDate,
        durationDays: item.durationDays || 1,
      }
    : null

  const handleCardClick = () => {
    onNavigate(`/listing/${listingId}`, listingState ? { state: listingState } : undefined)
  }

  const stopCardClick = (event, action) => {
    event.stopPropagation()
    action()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, x: -40, filter: 'blur(6px)' }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={handleCardClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          handleCardClick()
        }
      }}
      role="link"
      tabIndex={0}
      className="relative cursor-pointer rounded-3xl overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.92) 0%, rgba(250,247,242,0.88) 100%)',
        border: hovered ? '1px solid rgba(212,175,55,0.45)' : '1px solid rgba(232,224,213,0.7)',
        boxShadow: hovered
          ? '0 20px 60px rgba(0,0,0,0.1), 0 0 0 1px rgba(212,175,55,0.18)'
          : '0 8px 32px rgba(0,0,0,0.05)',
        backdropFilter: 'blur(10px)',
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}
    >
      {/* Top accent line — animates in on hover */}
      <motion.div
        animate={{ scaleX: hovered ? 1 : 0, originX: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-0 left-0 h-0.5 w-full bg-[linear-gradient(90deg,#D4AF37,#C8622A,transparent)]"
      />

      <div className="flex flex-col md:flex-row">
        {/* Image panel */}
        <div className="relative w-full md:w-44 shrink-0 h-52 md:h-auto overflow-hidden bg-[#F0EAE0]">
          {image ? (
            <motion.img
              src={image}
              alt={listing.title || 'Cart item'}
              animate={{ scale: hovered ? 1.06 : 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl bg-[linear-gradient(135deg,#F0EAE0,#E8D5C4)]">
              🪡
            </div>
          )}
          {/* Category badge */}
          <div className="absolute top-3 left-3">
            <span className="rounded-full border border-[rgba(255,255,255,0.6)] bg-black/30 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.15em] text-white backdrop-blur-sm">
              {listing.category || 'Outfit'}
            </span>
          </div>
          {/* Gold shimmer sweep */}
          <motion.div
            animate={{ x: hovered ? '200%' : '-100%' }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 -skew-x-12 bg-[linear-gradient(90deg,transparent,rgba(212,175,55,0.16),transparent)] w-[60%]"
          />
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-5 md:p-6 gap-4">
          {/* Header row */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3
                className="text-xl font-black text-[#1A1A1A] leading-tight mb-1"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                {listing.title || 'Untitled Outfit'}
              </h3>
              <p className="text-sm text-[#888] leading-relaxed line-clamp-2 max-w-sm">
                {listing.description || 'No description available.'}
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-lg font-black text-[#00342B]">
                {formatPrice(listing.pricePerDay)}<span className="text-[11px] font-semibold text-[#999]">/day</span>
              </div>
              <div className="text-xs text-[#AAA] mt-0.5">+{formatPrice(listing.deposit)} deposit</div>
            </div>
          </div>

          {/* Date / Duration pills */}
          <div className="flex flex-wrap gap-2.5">
            <div
              className="flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold"
              style={{
                background: canCheckout ? 'rgba(0,52,43,0.08)' : 'rgba(200,98,42,0.1)',
                color: canCheckout ? '#00342B' : '#C8622A',
                border: `1px solid ${canCheckout ? 'rgba(0,52,43,0.2)' : 'rgba(200,98,42,0.3)'}`,
              }}
            >
              <span>{canCheckout ? '📅' : '⚠️'}</span>
              {canCheckout
                ? `${new Date(item.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} – ${new Date(item.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`
                : 'Select dates on listing'}
            </div>
            <div className="flex items-center gap-2 rounded-full border border-[rgba(212,175,55,0.3)] bg-[rgba(212,175,55,0.08)] px-3.5 py-2 text-xs font-semibold text-[#8B7340]">
              <span>🕐</span>
              {days} day{days > 1 ? 's' : ''}
            </div>
            {canCheckout && (
              <div className="flex items-center gap-2 rounded-full border border-[rgba(0,52,43,0.2)] bg-[rgba(0,52,43,0.06)] px-3.5 py-2 text-xs font-bold text-[#00342B]">
                <span>💰</span>
                Total: {formatPrice(totalCost)}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-[rgba(232,224,213,0.6)]">
            <p className="text-[11px] text-[#AAA] uppercase tracking-widest">
              {canCheckout ? 'Ready to checkout ✓' : 'Add dates to continue'}
            </p>
            <div className="flex gap-2.5">
              <motion.button
                onClick={(event) => stopCardClick(event, () => onRemove(listingId))}
                disabled={removingId === listingId}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                className="rounded-full border border-[#E8E0D5] bg-white px-4 py-2 text-xs font-bold text-[#888] transition-colors hover:border-[#C8622A] hover:text-[#C8622A] disabled:opacity-40"
              >
                {removingId === listingId ? 'Removing…' : 'Remove'}
              </motion.button>
              <motion.button
                onClick={(event) => stopCardClick(event, () => (canCheckout ? onCheckout(item) : handleCardClick()))}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.96 }}
                className="relative overflow-hidden rounded-full bg-[#00342B] px-5 py-2 text-xs font-bold tracking-[0.06em] text-[#FAF7F2] shadow-[0_6px_20px_rgba(0,52,43,0.22)]"
              >
                <span className="relative z-10">
                  {canCheckout ? 'Checkout →' : 'Choose Dates →'}
                </span>
                <motion.div
                  className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(212,175,55,0.2),transparent)]"
                  style={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.5 }}
                />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Empty Cart ───────────────────────────────────────────────────────────────
function EmptyCart({ navigate }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="mb-6 flex h-24 w-24 items-center justify-center rounded-full text-5xl"
        style={{
          background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(0,52,43,0.1))',
          border: '1px solid rgba(212,175,55,0.3)',
          boxShadow: '0 12px 40px rgba(212,175,55,0.15)',
        }}
      >
        🛒
      </motion.div>
      <h2
        className="text-3xl font-black text-[#1A1A1A] mb-3"
        style={{ fontFamily: "'Georgia', serif" }}
      >
        Your cart is empty
      </h2>
      <p className="text-[#888] text-sm leading-relaxed max-w-sm mb-8">
        Browse the collection to add outfits, or open a listing and save it for checkout later.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <motion.button
          onClick={() => navigate('/collection')}
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.97 }}
          className="relative overflow-hidden rounded-full bg-[#00342B] px-7 py-3 text-sm font-bold tracking-[0.06em] text-[#FAF7F2] shadow-[0_8px_28px_rgba(0,52,43,0.22)]"
        >
          <span className="relative z-10">Explore Collection →</span>
          <motion.div
            className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(212,175,55,0.18),transparent)]"
            style={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.5 }}
          />
        </motion.button>
        <Link
          to="/dashboard"
          className="rounded-full border-2 border-[#D4AF37] px-7 py-3 text-sm font-bold tracking-[0.06em] text-[#00342B] transition-colors hover:bg-[rgba(212,175,55,0.08)]"
        >
          View Dashboard
        </Link>
      </div>
    </motion.div>
  )
}

// ─── Order Summary Panel ──────────────────────────────────────────────────────
function OrderSummaryPanel({ summary, canReserve, onReserve, formatPrice }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, x: 32, filter: 'blur(8px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      transition={{ delay: 0.2, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-28 flex flex-col gap-5"
    >
      {/* Main summary card */}
      <div
        className="relative rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #00342B 0%, #00453a 100%)',
          boxShadow: '0 24px 64px rgba(0,52,43,0.28), 0 0 0 1px rgba(212,175,55,0.2)',
        }}
      >
        {/* Top gold accent */}
        <div className="h-0.75 w-full bg-[linear-gradient(90deg,#D4AF37,#C8622A,rgba(200,98,42,0.3),transparent)]" />

        {/* Gold shimmer on card */}
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', repeatDelay: 5 }}
          className="absolute inset-0 -skew-x-12 bg-[linear-gradient(90deg,transparent,rgba(212,175,55,0.07),transparent)] w-[50%] pointer-events-none"
        />

        <div className="p-6 md:p-7">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 mb-5 rounded-full border border-[rgba(212,175,55,0.3)] bg-[rgba(212,175,55,0.1)] py-1 pl-2 pr-3.5">
            <span className="rounded-full bg-[#D4AF37] px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.15em] text-[#1A1A1A]">
              Summary
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#D4AF37]/70">
              Order Details
            </span>
          </div>

          <div className="space-y-4 mb-6">
            {[
              { label: 'Total items', value: summary.totalItems },
              { label: 'Ready for checkout', value: summary.readyItems, highlight: summary.readyItems > 0 },
              { label: 'Missing dates', value: summary.needsDates, warn: summary.needsDates > 0 },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-white/65">{row.label}</span>
                <span
                  className="text-sm font-bold"
                  style={{
                    color: row.warn && row.value > 0 ? '#C8622A' : row.highlight && row.value > 0 ? '#D4AF37' : 'white',
                  }}
                >
                  {row.value}
                </span>
              </div>
            ))}

            <div className="h-px bg-white/12 my-2" />

            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-white">Estimated total</span>
              <span
                className="text-xl font-black text-[#D4AF37]"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                {formatPrice(summary.estimatedTotal)}
              </span>
            </div>
          </div>

          {/* Reserve CTA */}
          <motion.button
            onClick={onReserve}
            disabled={!canReserve}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            whileHover={{ scale: canReserve ? 1.01 : 1, y: canReserve ? -1 : 0 }}
            whileTap={{ scale: canReserve ? 0.98 : 1 }}
            className="relative w-full overflow-hidden rounded-2xl py-3.5 text-sm font-bold tracking-[0.08em] text-[#1A1A1A] transition-all disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              background: canReserve ? '#D4AF37' : 'rgba(212,175,55,0.4)',
              boxShadow: canReserve ? '0 8px 28px rgba(212,175,55,0.3)' : 'none',
            }}
          >
            <span className="relative z-10">
              {canReserve ? 'Reserve Now →' : 'Add Dates to All Items'}
            </span>
            {canReserve && (
              <motion.div
                className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)]"
                style={{ x: '-100%' }}
                animate={hovered ? { x: '100%' } : { x: '-100%' }}
                transition={{ duration: 0.5 }}
              />
            )}
          </motion.button>

          <p className="mt-3 text-center text-[10px] text-white/45 tracking-wide">
            Secure checkout · Deposit fully refundable
          </p>
        </div>
      </div>

      {/* Next steps card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.55 }}
        className="rounded-3xl border border-[rgba(232,224,213,0.7)] bg-white/80 p-6 backdrop-blur-sm"
      >
        <div className="inline-flex items-center gap-2 mb-4 rounded-full border border-[rgba(212,175,55,0.3)] bg-[rgba(212,175,55,0.08)] py-1 pl-2 pr-3.5">
          <span className="rounded-full bg-[#D4AF37] px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.15em] text-[#1A1A1A]">
            Guide
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[#8B7340]">
            Next steps
          </span>
        </div>
        <ul className="space-y-3">
          {[
            { n: '1', text: 'Add outfits from any listing detail page.' },
            { n: '2', text: 'Pick event dates and duration for each item.' },
            { n: '3', text: 'Hit "Reserve Now" to complete checkout.' },
          ].map((step, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="flex items-start gap-3 text-sm"
            >
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-extrabold text-[#1A1A1A] mt-0.5"
                style={{ background: '#D4AF37' }}
              >
                {step.n}
              </span>
              <span className="text-[#777] leading-relaxed">{step.text}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* Trust badges */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex flex-wrap gap-3 pt-2"
      >
        {[
          { icon: '🔒', label: 'Secure Checkout' },
          { icon: '🌿', label: 'Sustainable' },
          { icon: '⭐', label: '4.9 Rating' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className="text-[#D4AF37] text-xs">{item.icon}</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#AAA]">{item.label}</span>
          </div>
        ))}
      </motion.div>
    </motion.div>
  )
}

// ─── Page Header ──────────────────────────────────────────────────────────────
function PageHeader({ itemCount }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -18, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="mb-10"
    >
      {/* Eyebrow */}
      <div className="inline-flex items-center gap-2 mb-4 rounded-full border border-[rgba(212,175,55,0.3)] bg-[rgba(212,175,55,0.08)] py-1 pl-2 pr-4">
        <span className="rounded-full bg-[#D4AF37] px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#1A1A1A]">
          Cart
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8B7340]">
          {itemCount > 0 ? `${itemCount} item${itemCount > 1 ? 's' : ''} selected` : 'Ready to rent'}
        </span>
      </div>

      <h1
        className="text-4xl md:text-5xl font-black text-[#1A1A1A] leading-[1.06]"
        style={{ fontFamily: "'Georgia', serif" }}
      >
        Your Cart
      </h1>

      {/* Gold underline */}
      <motion.div
        initial={{ scaleX: 0, originX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.4, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="mt-3 h-0.75 max-w-36 rounded-sm bg-[linear-gradient(90deg,#D4AF37,#C8622A,transparent)]"
      />

      <p className="mt-3 text-sm text-[#888] tracking-wide hidden md:block">
        Review your selections and complete your rental below.
      </p>
    </motion.div>
  )
}

// ─── Main Cart Page ───────────────────────────────────────────────────────────
const Cart = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [removingId, setRemovingId] = useState(null)

  useSEO({
    title: 'Cart',
    description: 'Review selected outfits before checkout on ListnRent.',
    canonicalPath: '/cart',
    noIndex: true,
  })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    if (authLoading) return

    if (!isAuthenticated) {
      navigate('/login', { replace: true, state: { from: '/cart', intent: 'view cart' } })
      return
    }

    let cancelled = false

    const fetchCartItems = async () => {
      try {
        setLoading(true)
        const response = await cartApi.getItems()
        if (cancelled) return
        setCartItems(response?.data?.items || [])
      } catch (error) {
        if (!cancelled) {
          toast.error(error.message || 'Failed to load cart')
          setCartItems([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchCartItems()
    return () => { cancelled = true }
  }, [authLoading, isAuthenticated, navigate])

  const formatPrice = (value) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value) || 0)

  const getListing = (item) => item.listingId || item.listingSnapshot || {}

  const summary = useMemo(() => {
    return cartItems.reduce(
      (acc, item) => {
        const listing = getListing(item)
        const pricePerDay = Number(listing.pricePerDay) || 0
        const deposit = Number(listing.deposit) || 0
        const durationDays = Number(item.durationDays) || 1
        acc.totalItems += 1
        if (item.startDate && item.endDate) {
          acc.readyItems += 1
          acc.estimatedTotal += durationDays * pricePerDay + deposit
        } else {
          acc.needsDates += 1
        }
        return acc
      },
      { totalItems: 0, readyItems: 0, needsDates: 0, estimatedTotal: 0 }
    )
  }, [cartItems])

  const canReserve = summary.totalItems > 0 && summary.needsDates === 0

  const handleRemove = async (listingId) => {
    try {
      setRemovingId(listingId)
      await cartApi.removeItem(listingId)
      setCartItems((prev) =>
        prev.filter((item) => {
          const itemListing = getListing(item)
          const itemId = itemListing._id || itemListing.listingId || item.listingId
          return String(itemId) !== String(listingId)
        })
      )
      toast.success('Removed from cart')
    } catch (error) {
      toast.error(error.message || 'Failed to remove item')
    } finally {
      setRemovingId(null)
    }
  }

  const handleCheckout = (item) => {
    const listing = getListing(item)
    if (!item.startDate || !item.endDate) {
      toast.error('Select dates on the listing before checkout')
      return
    }
    navigate('/checkout', {
      state: {
        listing,
        renterId: listing.userId,
        eventDate: item.eventDate,
        startDate: item.startDate,
        endDate: item.endDate,
        durationDays: item.durationDays || 1,
      },
    })
  }

  const handleReserveNow = () => {
    if (!canReserve) {
      toast.error('Add dates for every cart item before continuing')
      return
    }
    navigate('/checkout', {
      state: {
        cartItems: cartItems.map((item) => {
          const listing = getListing(item)
          return {
            listing,
            renterId: listing.userId,
            eventDate: item.eventDate,
            startDate: item.startDate,
            endDate: item.endDate,
            durationDays: item.durationDays || 1,
          }
        }),
        source: 'cart',
      },
    })
  }

  // ── Loading state ──
  if (authLoading || loading) {
    return <Loading message="Loading your cart…" variant="cart" />
  }

  if (!isAuthenticated) return null

  return (
    <div className="relative min-h-screen bg-[#FAF7F2]">
      <AmbientBackground />

      <div className="relative z-10 mx-auto max-w-6xl px-4 md:px-6 pt-28 pb-24">
        <PageHeader itemCount={summary.totalItems} />

        {cartItems.length === 0 ? (
          <EmptyCart navigate={navigate} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 xl:gap-12 items-start">

            {/* ── LEFT: Cart items ── */}
            <div className="flex flex-col gap-5">
              {/* Items count + clear hint */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="flex items-center justify-between"
              >
                <p className="text-[11px] uppercase tracking-[0.25em] text-[#999]">
                  {summary.totalItems} item{summary.totalItems > 1 ? 's' : ''} in cart
                </p>
                {summary.needsDates > 0 && (
                  <span className="rounded-full border border-[rgba(200,98,42,0.3)] bg-[rgba(200,98,42,0.08)] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#C8622A]">
                    {summary.needsDates} need{summary.needsDates > 1 ? '' : 's'} dates
                  </span>
                )}
              </motion.div>

              <AnimatePresence mode="popLayout">
                {cartItems.map((item, i) => {
                  const listing = getListing(item)
                  const listingId = String(listing._id || listing.listingId || item.listingId)
                  return (
                    <motion.div
                      key={listingId}
                      layout
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      <CartItemCard
                        item={item}
                        getListing={getListing}
                        removingId={removingId}
                        onRemove={handleRemove}
                        onCheckout={handleCheckout}
                        onNavigate={navigate}
                        formatPrice={formatPrice}
                      />
                    </motion.div>
                  )
                })}
              </AnimatePresence>

              {/* Bottom strip */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-2 flex flex-wrap gap-6 pt-6 border-t border-[rgba(212,175,55,0.2)]"
              >
                {[
                  { icon: '⚡', label: 'Same-Day Mumbai Delivery' },
                  { icon: '🌿', label: '100% Sustainable Fashion' },
                  { icon: '🔒', label: 'Secure & Verified' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 + i * 0.08 }}
                    className="flex items-center gap-2"
                  >
                    <span className="text-sm text-[#D4AF37]">{item.icon}</span>
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-[#AAA]">
                      {item.label}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* ── RIGHT: Summary panel ── */}
            <OrderSummaryPanel
              summary={summary}
              canReserve={canReserve}
              onReserve={handleReserveNow}
              formatPrice={formatPrice}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart