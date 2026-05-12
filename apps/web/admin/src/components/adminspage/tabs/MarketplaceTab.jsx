import React from 'react'
import PageHeader from '../../shared/PageHeader'
import { adminApi } from '../../../services/api'

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))

const formatDate = (value) => {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Recently'
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

const getInitials = (name = 'User') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'U'

const MarketplaceTab = () => {
  const [listings, setListings] = React.useState([])
  const [search, setSearch] = React.useState('')
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [actionId, setActionId] = React.useState('')

  const loadListings = React.useCallback(async (searchValue = '') => {
    setLoading(true)
    setError('')

    try {
      const response = await adminApi.getMarketplaceListings(searchValue)
      setListings(response.listings || [])
    } catch (err) {
      setError(err.message || 'Failed to load marketplace listings')
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      loadListings(search)
    }, 300)

    return () => window.clearTimeout(timer)
  }, [search, loadListings])

  const handleToggleVisibility = async (listing) => {
    if (!listing?.id || listing.isDraft) return

    setActionId(listing.id)
    setError('')

    try {
      const response = await adminApi.updateMarketplaceListingVisibility(listing.id, !listing.isActive)
      const updatedListing = response.listing

      setListings((prev) =>
        prev.map((item) =>
          item.id === listing.id
            ? { ...item, isActive: updatedListing.isActive }
            : item
        )
      )
    } catch (err) {
      setError(err.message || 'Failed to update listing visibility')
    } finally {
      setActionId('')
    }
  }

  const handleDelete = async (listing) => {
    if (!listing?.id) return

    const confirmed = window.confirm(`Delete ${listing.title}? This cannot be undone.`)
    if (!confirmed) return

    setActionId(listing.id)
    setError('')

    try {
      await adminApi.deleteMarketplaceListing(listing.id)
      setListings((prev) => prev.filter((item) => item.id !== listing.id))
    } catch (err) {
      setError(err.message || 'Failed to delete listing')
    } finally {
      setActionId('')
    }
  }

  const activeCount = listings.filter((item) => item.isActive && !item.isDraft).length
  const hiddenCount = listings.filter((item) => !item.isActive && !item.isDraft).length
  const draftCount = listings.filter((item) => item.isDraft).length

  return (
    <>
      <PageHeader
        title="Marketplace"
        subtitle="Search, hide, show, and delete listings across the site"
      />

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex-1">
            <label className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
              Search listings
            </label>
            <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <span className="text-slate-400">⌕</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by listing name, username, or category"
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center lg:min-w-[320px]">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-emerald-700">Active</p>
              <p className="mt-1 text-2xl font-black text-emerald-950">{activeCount}</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-amber-700">Hidden</p>
              <p className="mt-1 text-2xl font-black text-amber-950">{hiddenCount}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">Drafts</p>
              <p className="mt-1 text-2xl font-black text-slate-900">{draftCount}</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="h-44 animate-pulse rounded-xl bg-slate-200" />
              <div className="mt-4 h-4 w-3/4 animate-pulse rounded bg-slate-200" />
              <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-slate-200" />
              <div className="mt-4 h-10 animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing) => (
            <div key={listing.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="relative h-48 bg-slate-100">
                {listing.images?.[0] ? (
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-slate-100 to-amber-50 text-4xl text-slate-400">
                    🧥
                  </div>
                )}

                <div className="absolute left-4 top-4 flex gap-2">
                  {listing.isDraft ? (
                    <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">Draft</span>
                  ) : listing.isActive ? (
                    <span className="rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">Visible</span>
                  ) : (
                    <span className="rounded-full bg-amber-600 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">Hidden</span>
                  )}
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-start gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-slate-900 text-sm font-black text-white">
                    {listing.owner?.photoURL ? (
                      <img src={listing.owner.photoURL} alt={listing.owner.displayName} className="h-full w-full rounded-full object-cover" />
                    ) : (
                      getInitials(listing.owner?.displayName)
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-black text-slate-900">{listing.title}</h3>
                    <p className="mt-1 truncate text-sm text-slate-500">{listing.owner?.displayName} · {listing.owner?.email}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-900">{listing.category}</span>
                  {listing.occasion && <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{listing.occasion}</span>}
                  {listing.size && <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{listing.size}</span>}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Rent</p>
                    <p className="mt-1 font-black text-slate-900">{formatCurrency(listing.pricePerDay)}/day</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Deposit</p>
                    <p className="mt-1 font-black text-slate-900">{formatCurrency(listing.deposit)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Listed</p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">{formatDate(listing.createdAt)}</p>
                  </div>
                </div>

                <div className="mt-5 flex gap-2">
                  {!listing.isDraft && (
                    <button
                      onClick={() => handleToggleVisibility(listing)}
                      disabled={actionId === listing.id}
                      className={`flex-1 rounded-xl px-4 py-2 text-sm font-bold transition ${
                        listing.isActive
                          ? 'border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100'
                          : 'border border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                      } disabled:cursor-not-allowed disabled:opacity-70`}
                    >
                      {actionId === listing.id
                        ? 'Updating...'
                        : listing.isActive
                          ? 'Hide'
                          : 'Show'}
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(listing)}
                    disabled={actionId === listing.id}
                    className="flex-1 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {actionId === listing.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {listings.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
              No listings match your search.
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default MarketplaceTab
