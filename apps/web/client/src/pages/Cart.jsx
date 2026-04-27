import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { useAuth } from '../hooks/useAuth'
import { cartApi } from '../services/api'
import { useSEO } from '../hooks/useSEO'

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
      navigate('/login', {
        replace: true,
        state: { from: '/cart', intent: 'view cart' },
      })
      return
    }

    let cancelled = false

    const fetchCartItems = async () => {
      try {
        setLoading(true)
        const response = await cartApi.getItems()
        if (cancelled) return

        const items = response?.data?.items || []
        setCartItems(items)
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

    return () => {
      cancelled = true
    }
  }, [authLoading, isAuthenticated, navigate])

  const formatPrice = (value) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(value) || 0)

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
      setCartItems((prev) => prev.filter((item) => {
        const itemListing = getListing(item)
        const itemId = itemListing._id || itemListing.listingId || item.listingId
        return String(itemId) !== String(listingId)
      }))
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

  const handleReserveNow = async () => {
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] pt-24 pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl animate-spin mb-4">⏳</div>
          <p className="text-[#666]">Loading your cart...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] pt-24 pb-20 relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(circle at top left, rgba(0,52,43,0.08), transparent 35%), radial-gradient(circle at bottom right, rgba(212,175,55,0.12), transparent 32%)',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-4xl border border-[#E8E0D5] bg-white/85 backdrop-blur-sm shadow-[0_20px_70px_rgba(0,0,0,0.06)] overflow-hidden"
        >
          <div className="p-6 md:p-10 border-b border-[#F0E8DB]">
            <p className="text-[11px] uppercase tracking-[0.35em] text-[#9A8F82] mb-3">
              Ready to rent
            </p>
            <h1 className="text-3xl md:text-5xl font-bold text-[#00342B] leading-tight">
              Your Cart
            </h1>
            <p className="mt-4 max-w-2xl text-[#6F655B] text-sm md:text-base leading-7">
              Keep the pieces you love in one place, review the total, and head to checkout when you’re ready.
            </p>
          </div>

          <div className="grid lg:grid-cols-[1.5fr_0.9fr] gap-0">
            <div className="p-6 md:p-10 border-b lg:border-b-0 lg:border-r border-[#F0E8DB]">
              {cartItems.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-[#D8CCBB] bg-[#FCFAF6] p-8 md:p-10 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#00342B]/8 text-3xl">
                    🛒
                  </div>
                  <h2 className="text-2xl font-semibold text-[#1A1A1A]">Your cart is empty</h2>
                  <p className="mt-3 text-[#6F655B] leading-7 max-w-md mx-auto">
                    Browse the collection to add outfits, or open a listing and save it for checkout later.
                  </p>
                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                      onClick={() => navigate('/collection')}
                      className="inline-flex items-center justify-center rounded-full bg-[#00342B] px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
                    >
                      Browse Collection
                    </button>
                    <Link
                      to="/dashboard"
                      className="inline-flex items-center justify-center rounded-full border border-[#D8CCBB] bg-white px-6 py-3 text-sm font-semibold text-[#1A1A1A] transition-colors hover:bg-[#FAF7F2]"
                    >
                      View Dashboard
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 md:space-y-5">
                  {cartItems.map((item) => {
                    const listing = getListing(item)
                    const listingId = String(listing._id || listing.listingId || item.listingId)
                    const image = listing.images?.[0]
                    const canCheckout = !!item.startDate && !!item.endDate
                    const days = Number(item.durationDays) || 1

                    return (
                      <motion.div
                        key={String(listingId)}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-[1.75rem] border border-[#E8E0D5] bg-white overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.04)]"
                      >
                        <div className="grid md:grid-cols-[150px_1fr] gap-0">
                          <div className="bg-[#F8F4EC] min-h-40 md:min-h-full">
                            {image ? (
                              <img
                                src={image}
                                alt={listing.title || 'Cart item'}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full min-h-40 items-center justify-center text-4xl">
                                🪡
                              </div>
                            )}
                          </div>

                          <div className="p-5 md:p-6 flex flex-col gap-4">
                            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                              <div>
                                <p className="text-[10px] uppercase tracking-[0.3em] text-[#9A8F82] mb-2">
                                  {listing.category || 'Outfit'}
                                </p>
                                <h2 className="text-xl font-bold text-[#1A1A1A] leading-tight">
                                  {listing.title || 'Untitled Outfit'}
                                </h2>
                                <p className="mt-2 text-sm text-[#6F655B] leading-6 max-w-2xl">
                                  {listing.description || 'No description available.'}
                                </p>
                              </div>

                              <div className="text-left md:text-right shrink-0">
                                <div className="text-lg font-semibold text-[#00342B]">
                                  {formatPrice(listing.pricePerDay)} / day
                                </div>
                                <div className="text-sm text-[#6F655B] mt-1">
                                  Deposit {formatPrice(listing.deposit)}
                                </div>
                              </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-3 text-sm">
                              <div className="rounded-2xl bg-[#FCFAF6] border border-[#EEE4D4] p-3">
                                <p className="text-[10px] uppercase tracking-[0.25em] text-[#9A8F82] mb-1">Dates</p>
                                <p className="font-semibold text-[#1A1A1A]">
                                  {canCheckout
                                    ? `${new Date(item.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} - ${new Date(item.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`
                                    : 'Select dates on the listing'}
                                </p>
                              </div>
                              <div className="rounded-2xl bg-[#FCFAF6] border border-[#EEE4D4] p-3">
                                <p className="text-[10px] uppercase tracking-[0.25em] text-[#9A8F82] mb-1">Duration</p>
                                <p className="font-semibold text-[#1A1A1A]">{days} day{days > 1 ? 's' : ''}</p>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                              <div className="text-sm text-[#6F655B]">
                                {canCheckout ? 'Ready to continue to checkout.' : 'Add dates before checkout.'}
                              </div>

                              <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                  onClick={() => handleRemove(listingId)}
                                  disabled={removingId === listingId}
                                  className="inline-flex items-center justify-center rounded-full border border-[#D8CCBB] bg-white px-5 py-2.5 text-sm font-semibold text-[#1A1A1A] transition-colors hover:bg-[#FAF7F2] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {removingId === listingId ? 'Removing...' : 'Remove'}
                                </button>
                                <button
                                  onClick={() => (canCheckout ? handleCheckout(item) : navigate(`/listing/${listingId}`))}
                                  className="inline-flex items-center justify-center rounded-full bg-[#00342B] px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.01]"
                                >
                                  {canCheckout ? 'Continue to Checkout' : 'Choose Dates'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="p-6 md:p-10 bg-[#FCFAF6]">
              <div className="rounded-3xl bg-[#00342B] text-white p-6 md:p-7 shadow-[0_20px_50px_rgba(0,52,43,0.16)]">
                <p className="text-[11px] uppercase tracking-[0.3em] text-white/65 mb-3">Summary</p>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-white/75">Items</span>
                    <span className="font-semibold">{summary.totalItems}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/75">Ready for checkout</span>
                    <span className="font-semibold">{summary.readyItems}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/75">Missing dates</span>
                    <span className="font-semibold">{summary.needsDates}</span>
                  </div>
                  <div className="h-px bg-white/15 my-4" />
                  <div className="flex items-center justify-between text-base">
                    <span className="font-medium">Estimated total</span>
                    <span className="font-semibold">{formatPrice(summary.estimatedTotal)}</span>
                  </div>
                </div>

                <button
                  onClick={handleReserveNow}
                  disabled={!canReserve}
                  className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#D4AF37] px-5 py-3 text-sm font-bold text-[#1A1A1A] transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Reserve Now
                </button>
                <p className="mt-3 text-xs leading-5 text-white/70">
                  Review your details and complete payment before all cart outfits are reserved.
                </p>
              </div>

              <div className="mt-6 rounded-3xl border border-[#E8E0D5] bg-white p-6">
                <h2 className="text-lg font-semibold text-[#1A1A1A]">Next steps</h2>
                <ul className="mt-4 space-y-3 text-sm text-[#6F655B] leading-6">
                  <li>1. Add outfits from the listing detail page.</li>
                  <li>2. Pick event dates and duration for each item.</li>
                  <li>3. Continue to checkout when the item is ready.</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Cart