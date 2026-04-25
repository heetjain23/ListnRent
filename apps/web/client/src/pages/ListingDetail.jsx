import React, { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '../hooks/useAuth'
import { useListing } from '../hooks/useListings'
import { useSEO } from '../hooks/useSEO'
import { listingsApi } from '../services/api'

// Section components
import ImageGallerySection    from '../components/listing-detail/ImageGallerySection'
import ImageDetailSection     from '../components/listing-detail/ImageDetailSection'
import ListingDetailsSection  from '../components/listing-detail/ListingDetailsSection'
import BookingSection         from '../components/listing-detail/BookingSection'
import HostMetadataSection    from '../components/listing-detail/HostMetadataSection'
import { HostCard }           from '../components/listing-detail/HostMetadataSection'
import ListingCard            from '../components/collection/ListingCard'

const parseLocalDate = (value) => {
  if (!value) return null
  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate())
  }
  if (typeof value === 'string') {
    const ymdMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (ymdMatch) {
      const [, year, month, day] = ymdMatch
      return new Date(Number(year), Number(month) - 1, Number(day))
    }
  }
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
}

const formatLocalDate = (dateObj) => {
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const VIEW_TRACK_TTL_MS = 10 * 60 * 1000

const shouldTrackListingView = (listingId) => {
  if (!listingId || typeof window === 'undefined') return false
  const storageKey = `listing_view_tracked_${listingId}`
  const now = Date.now()
  try {
    const lastTracked = Number(sessionStorage.getItem(storageKey) || 0)
    if (lastTracked && now - lastTracked < VIEW_TRACK_TTL_MS) return false
    sessionStorage.setItem(storageKey, String(now))
    return true
  } catch { return true }
}

// ─── Ambient Background ───────────────────────────────────────────────────────
function AmbientBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      {/* Top-right gold glow */}
      <motion.div
        animate={{ x: [0, -20, 10, 0], y: [0, 18, 6, 0], opacity: [0.18, 0.3, 0.22, 0.18] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-[15%] -right-[10%] rounded-full blur-3xl"
        style={{
          width: 'min(48vw, 600px)', height: 'min(48vw, 600px)',
          background: 'radial-gradient(circle, rgba(212,175,55,0.22) 0%, rgba(212,175,55,0.07) 50%, transparent 72%)',
        }}
      />
      {/* Bottom-left soft glow */}
      <motion.div
        animate={{ x: [0, 16, -8, 0], y: [0, -14, -4, 0], opacity: [0.12, 0.22, 0.15, 0.12] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-[20%] -left-[8%] rounded-full blur-3xl"
        style={{
          width: 'min(40vw, 500px)', height: 'min(40vw, 500px)',
          background: 'radial-gradient(circle, rgba(0,77,64,0.18) 0%, rgba(0,77,64,0.06) 50%, transparent 72%)',
        }}
      />
      {/* Center warmth */}
      <motion.div
        animate={{ opacity: [0.06, 0.12, 0.06] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          width: 'min(60vw, 700px)', height: 'min(30vw, 350px)',
          background: 'radial-gradient(ellipse, rgba(200,98,42,0.12) 0%, transparent 70%)',
        }}
      />
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(0,52,43,0.8) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
    </div>
  )
}

// ─── Breadcrumb ───────────────────────────────────────────────────────────────
const Breadcrumb = ({ category, title }) => (
  <motion.nav
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs mb-6 md:mb-8 tracking-widest uppercase overflow-x-auto pb-1"
    style={{ color: '#9E9E7A' }}
  >
    <Link to="/" className="hover:text-[#004D40] transition-colors whitespace-nowrap">Home</Link>
    <span style={{ color: '#C9C9A8' }}>›</span>
    <Link to="/collection" className="hover:text-[#004D40] transition-colors whitespace-nowrap">Collection</Link>
    <span style={{ color: '#C9C9A8' }}>›</span>
    <Link to={`/collection?category=${category}`} className="hover:text-[#004D40] transition-colors whitespace-nowrap">
      {category || 'Outfit'}
    </Link>
    <span style={{ color: '#C9C9A8' }}>›</span>
    <span className="font-semibold truncate max-w-40" style={{ color: '#004D40' }}>
      {title}
    </span>
  </motion.nav>
)

// ─── Loading Skeleton ─────────────────────────────────────────────────────────
const LoadingSkeleton = () => (
  <div
    className="min-h-screen pt-20 md:pt-24 pb-20 px-4 md:px-6"
    style={{ backgroundColor: '#FDFCF0' }}
  >
    <div className="max-w-6xl mx-auto animate-pulse">
      <div className="h-3 rounded-full w-56 mb-8" style={{ backgroundColor: '#E8E4D4' }} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        <div>
          <div className="rounded-3xl w-full" style={{ aspectRatio: '3/4', backgroundColor: '#E8E4D4' }} />
          <div className="flex gap-2 mt-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-xl flex-1" style={{ aspectRatio: '3/4', backgroundColor: '#E8E4D4' }} />
            ))}
          </div>
        </div>
        <div className="space-y-5 pt-2">
          <div className="h-5 rounded-full w-28" style={{ backgroundColor: '#E8E4D4' }} />
          <div className="h-10 rounded-full w-4/5" style={{ backgroundColor: '#E8E4D4' }} />
          <div className="h-4 rounded-full w-full" style={{ backgroundColor: '#E8E4D4' }} />
          <div className="h-4 rounded-full w-2/3" style={{ backgroundColor: '#E8E4D4' }} />
          <div className="h-28 rounded-3xl" style={{ backgroundColor: '#E8E4D4' }} />
          <div className="h-64 rounded-3xl" style={{ backgroundColor: '#E8E4D4' }} />
        </div>
      </div>
    </div>
  </div>
)

// ─── Not Found Screen ─────────────────────────────────────────────────────────
const NotFoundScreen = ({ error }) => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-4 pt-20 px-4">
    <motion.span
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 18 }}
      className="text-6xl"
    >🪭</motion.span>
    <h2 className="text-xl font-semibold text-center" style={{ color: '#1A1A14', fontFamily: 'Georgia, serif' }}>
      {error || 'Outfit not found'}
    </h2>
    <Link
      to="/collection"
      className="text-sm font-semibold underline underline-offset-2 hover:opacity-70 transition-opacity"
      style={{ color: '#004D40' }}
    >
      ← Back to Collection
    </Link>
  </div>
)

// ─── Page ─────────────────────────────────────────────────────────────────────
const ListingDetail = () => {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const { user }     = useAuth()
  const { listing, loading, error, refetch } = useListing(id)

  const productSchema = useMemo(() => {
    if (!listing) return null
    const listingUrl = typeof window !== 'undefined'
      ? window.location.href
      : `https://listnrent.com/listing/${listing._id || id}`
    const image = Array.isArray(listing.images) ? listing.images.filter(Boolean) : []
    const itemCondition =
      listing.condition === 'Excellent' ? 'https://schema.org/UsedCondition'
      : listing.condition === 'New' ? 'https://schema.org/NewCondition'
      : 'https://schema.org/UsedCondition'
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: listing.title,
      description: listing.description,
      category: listing.category,
      image,
      brand: { '@type': 'Brand', name: 'ListnRent' },
      offers: {
        '@type': 'Offer',
        url: listingUrl,
        priceCurrency: 'INR',
        price: Number(listing.pricePerDay) || 0,
        availability: listing.isActive ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        itemCondition,
      },
    }
  }, [listing, id])

  useSEO({
    title: listing?.title ? `${listing.title} for Rent` : 'Outfit Details',
    description: listing?.description
      ? `${listing.description.slice(0, 150)}${listing.description.length > 150 ? '...' : ''}`
      : 'View outfit details, rental pricing, and booking availability on ListnRent.',
    keywords: [listing?.category, listing?.occasion, 'outfit rental', 'clothing rental', 'designer wear rental', 'ListnRent'].filter(Boolean).join(', '),
    canonicalPath: `/listing/${listing?._id || id}`,
    ogType: 'product',
    structuredData: productSchema,
  })

  const [activeImage,  setActiveImage]  = useState(0)
  const [eventDate,    setEventDate]    = useState('')
  const [durationDays, setDurationDays] = useState(1)
  const [similarListings, setSimilarListings] = useState([])
  const [similarLoading, setSimilarLoading] = useState(false)

  useEffect(() => { window.scrollTo(0, 0) }, [id, listing])

  useEffect(() => {
    if (!id) return
    if (!shouldTrackListingView(id)) return
    listingsApi.trackView(id).catch(() => {})
  }, [id])

  useEffect(() => {
    if (!listing?.category || !listing?.gender) {
      setSimilarListings([])
      return
    }

    let isCancelled = false

    const fetchSimilarListings = async () => {
      try {
        setSimilarLoading(true)
        const res = await listingsApi.getAll({
          category: [listing.category],
          gender: [listing.gender],
          limit: 12,
        })

        if (isCancelled) return

        const currentId = listing._id || listing.id
        const related = (res?.data?.listings || [])
          .filter((item) => {
            const itemId = item._id || item.id
            return itemId !== currentId
          })
          .slice(0, 4)

        setSimilarListings(related)
      } catch {
        if (!isCancelled) setSimilarListings([])
      } finally {
        if (!isCancelled) setSimilarLoading(false)
      }
    }

    fetchSimilarListings()

    return () => {
      isCancelled = true
    }
  }, [listing])

  if (loading)           return <LoadingSkeleton />
  if (error || !listing) return <NotFoundScreen error={error} />

  const available = listing.isActive
  const isOwner   = user && user.uid === listing.userId

  const getCalculatedDates = () => {
    if (!eventDate) return { startDate: '', endDate: '' }
    const event = parseLocalDate(eventDate)
    if (!event) return { startDate: '', endDate: '' }
    const checkIn = new Date(event)
    checkIn.setDate(checkIn.getDate() - 1)
    const returnDate = new Date(event)
    returnDate.setDate(returnDate.getDate() + (durationDays || 1))
    return { startDate: formatLocalDate(checkIn), endDate: formatLocalDate(returnDate) }
  }

  const { startDate, endDate } = getCalculatedDates()

  const handleRentClick = () => {
    if (!eventDate || !durationDays) return
    window.scrollTo(0, 0)
    navigate('/checkout', {
      state: { listing, renterId: listing.userId, eventDate, startDate, endDate, durationDays },
    })
  }

  const handleEditClick = () => {
    navigate(`/edit/${listing._id}`)
    window.scrollTo(0, 0)
  }

  return (
    <div className="relative min-h-screen" style={{ backgroundColor: '#FDFCF0' }}>
      <AmbientBackground />

      <div className="relative z-10 pt-20 md:pt-24 pb-24 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">

          {/* Breadcrumb */}
          <div className="hidden md:block">
            <Breadcrumb category={listing.category} title={listing.title} />
          </div>

          {/* ── Main Two-Column Grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 xl:gap-20">

            {/* ── Left: Gallery + Metadata ── */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-6"
            >
              {/* Mobile breadcrumb */}
              <div className="md:hidden">
                <Breadcrumb category={listing.category} title={listing.title} />
              </div>

              <ImageGallerySection
                images={listing.images}
                activeImage={activeImage}
                onImageChange={setActiveImage}
                title={listing.title}
              />

              {/* Metadata grid */}
              <div className="mt-2">
                <HostMetadataSection listing={listing} />
              </div>

              {/* ── Image Detail Section — lg screens: below metadata on left col ── */}
              {listing.images?.length > 0 && (
                <div className="hidden lg:block">
                  <ImageDetailSection images={listing.images} title={listing.title} />
                </div>
              )}
            </motion.div>

            {/* ── Right: Info + Booking ── */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
              className="flex flex-col gap-6 lg:pt-1"
            >
              {/* Listing details */}
              <ListingDetailsSection listing={listing} />

              {/* Owner edit link */}
              {isOwner && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <button
                    onClick={handleEditClick}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold transition-all hover:opacity-70 underline underline-offset-2"
                    style={{ color: '#004D40' }}
                  >
                    <span>✏️</span>
                    Edit This Listing
                  </button>
                </motion.div>
              )}

              {/* Booking section */}
              <BookingSection
                listing={listing}
                eventDate={eventDate}
                onEventDateChange={setEventDate}
                durationDays={durationDays}
                onDurationChange={setDurationDays}
                onRentClick={handleRentClick}
                available={available}
              />

              {/* ── Image Detail Section — sm/md: below booking on right col ── */}
              {listing.images?.length > 0 && (
                <div className="block lg:hidden">
                  <ImageDetailSection images={listing.images} title={listing.title} />
                </div>
              )}

              {/* Host card */}
              <HostCard
                displayName={listing.owner?.displayName || listing.owner?.name || 'Host'}
                ownerName={listing.owner?.name}
              />

              {/* Sustainability note */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-start gap-3 rounded-2xl px-4 py-3"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,77,64,0.06) 0%, rgba(212,175,55,0.06) 100%)',
                  border: '1px solid rgba(0,77,64,0.12)',
                }}
              >
                <span className="text-xl mt-0.5">🌿</span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: '#004D40' }}>
                    Sustainable Choice
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: '#7D6B41' }}>
                    Renting reduces textile waste by up to 70% compared to buying. Every rental is a step toward a more sustainable future.
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Similar products */}
          <div className="mt-12 md:mt-16">
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <div className="h-4 w-0.5 rounded-sm" style={{ background: 'linear-gradient(180deg, #D4AF37, #C8622A)' }} />
              <h2
                className="text-lg md:text-2xl font-black"
                style={{ color: '#1A1A14', fontFamily: 'Georgia, serif' }}
              >
                Similar Products
              </h2>
            </div>

            <p className="text-xs md:text-sm mb-5" style={{ color: '#7D6B41' }}>
              More picks from the same category and gender.
            </p>

            {similarLoading && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                {[...Array(4)].map((_, index) => (
                  <div
                    key={index}
                    className="rounded-2xl animate-pulse"
                    style={{
                      backgroundColor: '#E8E4D4',
                      height: 280,
                    }}
                  />
                ))}
              </div>
            )}

            {!similarLoading && similarListings.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
                {similarListings.map((item) => (
                  <ListingCard key={item._id || item.id} listing={item} />
                ))}
              </div>
            )}

            {!similarLoading && similarListings.length === 0 && (
              <div
                className="rounded-2xl px-4 py-5 text-sm"
                style={{
                  backgroundColor: 'rgba(0,77,64,0.04)',
                  border: '1px solid rgba(0,77,64,0.12)',
                  color: '#5F5A4E',
                }}
              >
                No similar products available right now.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ListingDetail