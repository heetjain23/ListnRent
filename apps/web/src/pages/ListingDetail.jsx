import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useListing } from '../hooks/useListings'

// Section components
import ImageGallerySection    from '../components/listing-detail/ImageGallerySection'
import ListingDetailsSection  from '../components/listing-detail/ListingDetailsSection'
import BookingSection         from '../components/listing-detail/BookingSection'
import HostMetadataSection    from '../components/listing-detail/HostMetadataSection'
import { HostCard }           from '../components/listing-detail/HostMetadataSection'

// ─── Breadcrumb ────────────────────────────────────────────────────────────────
const Breadcrumb = ({ category, title }) => (
  <nav
    className="flex items-center gap-1 md:gap-2 text-[10px] md:text-xs mb-6 md:mb-8 tracking-wide uppercase overflow-x-auto pb-1"
    style={{ color: '#9E9E7A' }}
  >
    <Link to="/collection" className="hover:text-[#004D40] transition-colors whitespace-nowrap">Collection</Link>
    <span style={{ color: '#C9C9A8' }}>›</span>
    <Link to={`/collection?category=${category}`} className="hover:text-[#004D40] transition-colors whitespace-nowrap">
      {category || 'Collection'}
    </Link>
    <span style={{ color: '#C9C9A8' }}>›</span>
    <span
      className="font-semibold truncate"
      style={{ color: '#004D40' }}
    >
      {title}
    </span>
  </nav>
)

// ─── Loading Skeleton ──────────────────────────────────────────────────────────
const LoadingSkeleton = () => (
  <div className="pt-16 md:pt-20 pb-20 md:pb-24 max-w-6xl mx-auto px-4 md:px-6 animate-pulse">
    <div className="h-3 rounded-full w-56 mb-6 md:mb-8" style={{ backgroundColor: '#E8E4D4' }} />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 lg:gap-16">
      <div className="flex gap-2 md:gap-3">
        <div className="hidden md:flex flex-col gap-2 w-17">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-full rounded-xl"
              style={{ aspectRatio: '3/4', backgroundColor: '#E8E4D4' }}
            />
          ))}
        </div>
        <div
          className="flex-1 rounded-2xl"
          style={{ aspectRatio: '3/4', backgroundColor: '#E8E4D4' }}
        />
      </div>
      <div className="space-y-4">
        <div className="h-4 rounded-full w-32"  style={{ backgroundColor: '#E8E4D4' }} />
        <div className="h-8 md:h-9 rounded-full w-4/5" style={{ backgroundColor: '#E8E4D4' }} />
        <div className="h-4 rounded-full w-full" style={{ backgroundColor: '#E8E4D4' }} />
        <div className="h-4 rounded-full w-2/3" style={{ backgroundColor: '#E8E4D4' }} />
        <div className="h-24 md:h-28 rounded-2xl mt-4"  style={{ backgroundColor: '#E8E4D4' }} />
        <div className="h-48 md:h-56 rounded-3xl mt-4"  style={{ backgroundColor: '#E8E4D4' }} />
      </div>
    </div>
  </div>
)

// ─── Booking Success Screen ────────────────────────────────────────────────────
const BookingSuccessScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-4 md:gap-6 pt-16">
    <span className="text-6xl md:text-7xl">✅</span>
    <h2
      className="text-xl md:text-2xl font-bold text-center px-4"
      style={{ color: '#1A1A14', fontFamily: 'Georgia, serif' }}
    >
      Booking Confirmed!
    </h2>
    <p className="text-sm md:text-base text-center px-4" style={{ color: '#7D6B41' }}>
      Your rental booking has been successfully created.
    </p>
    <p className="text-xs md:text-sm text-center px-4" style={{ color: '#9E9E7A' }}>
      Redirecting to your dashboard…
    </p>
  </div>
)

// ─── Not Found Screen ──────────────────────────────────────────────────────────
const NotFoundScreen = ({ error }) => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-3 md:gap-4 pt-16">
    <span className="text-5xl md:text-6xl">🪭</span>
    <h2 className="text-lg md:text-xl font-semibold text-center px-4" style={{ color: '#1A1A14' }}>
      {error || 'Outfit not found'}
    </h2>
    <Link
      to="/collection"
      className="text-xs md:text-sm underline transition-colors hover:opacity-70"
      style={{ color: '#004D40' }}
    >
      Back to Collection
    </Link>
  </div>
)

// ─── Page ──────────────────────────────────────────────────────────────────────
const ListingDetail = () => {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const { user }     = useAuth()
  const { listing, loading, error, refetch } = useListing(id)

  const [activeImage,    setActiveImage]    = useState(0)
  const [eventDate,      setEventDate]      = useState('')
  const [durationDays,   setDurationDays]   = useState(1)

  useEffect(() => { 
    window.scrollTo(0, 0)
  }, [id, listing])

  if (loading)           return <LoadingSkeleton />
  if (error || !listing) return <NotFoundScreen error={error} />

  const available = listing.isActive
  const isOwner = user && user.uid === listing.userId

  const handleRentClick = () => {
    if (!eventDate || !durationDays) return
    window.scrollTo(0, 0)
    navigate('/checkout', {
      state: {
        listing,
        renterId: listing.userId,
        startDate,
        endDate,
      },
    })
  }

  // ── Calculate check-in and return dates from event date ──────────────────────
  const getCalculatedDates = () => {
    if (!eventDate) return { startDate: '', endDate: '' }
    const event = new Date(eventDate)
    
    // Check-in = 1 day before event
    const checkIn = new Date(event)
    checkIn.setDate(checkIn.getDate() - 1)
    
    // Return = event date + selected days
    const returnDate = new Date(event)
    returnDate.setDate(returnDate.getDate() + (durationDays || 1))
    
    return {
      startDate: checkIn.toISOString().split('T')[0],
      endDate: returnDate.toISOString().split('T')[0],
    }
  }

  const { startDate, endDate } = getCalculatedDates()

  const handleEditClick = () => {
    navigate(`/edit/${listing._id}`)
    window.scrollTo(0, 0)
  }

  return (
    <div className="min-h-screen pt-16 md:pt-20 pb-20 md:pb-24 px-4 md:px-6" style={{ backgroundColor: '#FDFCF0' }}>
      <div className="max-w-6xl mx-auto">

        {/* Breadcrumb - Hidden on mobile, shown on md+ */}
        <div className="hidden md:block mb-6 md:mb-8">
          <Breadcrumb category={listing.category} title={listing.title} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 lg:gap-16">

          {/* Left — Image gallery + metadata */}
          <div className="flex flex-col gap-4 md:gap-6">
            <ImageGallerySection
              images={listing.images}
              activeImage={activeImage}
              onImageChange={setActiveImage}
              title={listing.title}
            />

            {/* Metadata - Only show on small screens below md */}
            <div className="md:hidden">
              <HostMetadataSection listing={listing} />
            </div>

            {/* Desktop: Metadata below images on md and up */}
            <div className="hidden md:block">
              <HostMetadataSection listing={listing} />
            </div>
          </div>

          {/* Right — Details + booking + host card */}
          <div className="flex flex-col gap-4 md:gap-6">

            <ListingDetailsSection listing={listing} />

            {/* Edit Button for Owner */}
            {isOwner && (
              <div className="mt-2">
                <button
                  onClick={handleEditClick}
                  className="text-sm font-semibold text-[#004D40] hover:text-[#003830] hover:underline transition-colors"
                >
                  ✏️ Edit This Listing
                </button>
              </div>
            )}

            <BookingSection
              listing={listing}
              eventDate={eventDate}
              onEventDateChange={setEventDate}
              durationDays={durationDays}
              onDurationChange={setDurationDays}
              onRentClick={handleRentClick}
              available={available}
            />

            {/* Host Card */}
            <HostCard 
              displayName={listing.owner?.displayName || listing.owner?.name || 'Host'} 
              ownerName={listing.owner?.name}
            />

          </div>
        </div>
      </div>
    </div>
  )
}

export default ListingDetail