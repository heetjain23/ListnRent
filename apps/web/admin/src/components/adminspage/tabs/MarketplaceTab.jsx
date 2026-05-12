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

const getStatusMeta = (listing) => {
  if (listing.isDraft) {
    return {
      label: 'Draft',
      className: 'bg-slate-100 text-slate-700',
    }
  }

  if (listing.isActive) {
    return {
      label: 'Visible',
      className: 'bg-emerald-100 text-emerald-800',
    }
  }

  return {
    label: 'Hidden',
    className: 'bg-amber-100 text-amber-800',
  }
}

const MarketplaceTab = () => {
  const [listings, setListings] = React.useState([])
  const [search, setSearch] = React.useState('')
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [actionId, setActionId] = React.useState('')
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(5)

  React.useEffect(() => {
    const updatePageSize = () => {
      const width = window.innerWidth

      if (width >= 1024) {
        setPageSize(10)
      } else if (width >= 768) {
        setPageSize(8)
      } else {
        setPageSize(5)
      }
    }

    updatePageSize()
    window.addEventListener('resize', updatePageSize)

    return () => window.removeEventListener('resize', updatePageSize)
  }, [])

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

  React.useEffect(() => {
    setCurrentPage(1)
  }, [search])

  const totalPages = Math.max(1, Math.ceil(listings.length / pageSize))

  React.useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages))
  }, [totalPages])

  const paginatedListings = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return listings.slice(startIndex, startIndex + pageSize)
  }, [currentPage, pageSize, listings])

  const pageStart = listings.length === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const pageEnd = Math.min(currentPage * pageSize, listings.length)

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

          <div className="grid grid-cols-1 gap-3 text-center sm:grid-cols-3 lg:min-w-[320px]">
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
        <>
          <div className="grid grid-cols-1 gap-4 lg:hidden">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="h-16 w-16 animate-pulse rounded-xl bg-slate-200" />
                  <div className="min-w-0 flex-1">
                    <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
                    <div className="mt-2 h-3 w-28 animate-pulse rounded bg-slate-200" />
                    <div className="mt-3 h-6 w-20 animate-pulse rounded-full bg-slate-200" />
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="h-16 animate-pulse rounded-xl bg-slate-200" />
                  <div className="h-16 animate-pulse rounded-xl bg-slate-200" />
                </div>
                <div className="mt-4 h-10 animate-pulse rounded-xl bg-slate-200" />
              </div>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
            <div className="overflow-x-auto">
              <table className="min-w-295 w-full border-collapse">
                <thead className="bg-slate-50">
                  <tr className="text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                    <th className="px-4 py-4">Listing</th>
                    <th className="px-4 py-4">Owner</th>
                    <th className="px-4 py-4">Category</th>
                    <th className="px-4 py-4">Pricing</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4">Listed</th>
                    <th className="px-4 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <tr key={idx} className="border-t border-slate-100">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-14 w-14 animate-pulse rounded-xl bg-slate-200" />
                          <div className="min-w-0 flex-1">
                            <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
                            <div className="mt-2 h-3 w-28 animate-pulse rounded bg-slate-200" />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                        <div className="mt-2 h-3 w-40 animate-pulse rounded bg-slate-200" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-6 w-24 animate-pulse rounded-full bg-slate-200" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                        <div className="mt-2 h-3 w-20 animate-pulse rounded bg-slate-200" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-6 w-20 animate-pulse rounded-full bg-slate-200" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="ml-auto h-9 w-28 animate-pulse rounded-xl bg-slate-200" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:hidden">
            {paginatedListings.map((listing) => {
              const status = getStatusMeta(listing)

              return (
                <div key={listing.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
                  <div className="flex items-start gap-3">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                      {listing.images?.[0] ? (
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-slate-100 to-amber-50 text-2xl text-slate-400">
                          🧥
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-bold text-slate-900">{listing.title}</h3>
                          <p className="mt-1 truncate text-xs text-slate-500">
                            {listing.owner?.displayName || 'Unknown owner'}
                          </p>
                        </div>
                        <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${status.className}`}>
                          {status.label}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-slate-500">
                        {listing.owner?.email || 'No email'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-slate-50 px-3 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Category</p>
                      <p className="mt-1 font-semibold text-slate-900">{listing.category || 'Uncategorized'}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 px-3 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Listed</p>
                      <p className="mt-1 font-semibold text-slate-900">{formatDate(listing.createdAt)}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 px-3 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Rent</p>
                      <p className="mt-1 font-semibold text-slate-900">{formatCurrency(listing.pricePerDay)}/day</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 px-3 py-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Deposit</p>
                      <p className="mt-1 font-semibold text-slate-900">{formatCurrency(listing.deposit)}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {listing.occasion && (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {listing.occasion}
                      </span>
                    )}
                    {listing.size && (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {listing.size}
                      </span>
                    )}
                    {listing.isDraft && (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        Draft
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex gap-2">
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
              )
            })}

            {listings.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
                No listings match your search.
              </div>
            )}
          </div>

          <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
            <div className="overflow-x-auto">
              <table className="min-w-295 w-full border-collapse">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  <th className="px-4 py-4">Listing</th>
                  <th className="px-4 py-4">Owner</th>
                  <th className="px-4 py-4">Category</th>
                  <th className="px-4 py-4">Pricing</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Listed</th>
                  <th className="px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedListings.map((listing) => {
                  const status = getStatusMeta(listing)

                  return (
                    <tr key={listing.id} className="border-t border-slate-100 transition hover:bg-slate-50/80">
                      <td className="px-4 py-4 align-top">
                        <div className="flex items-center gap-3">
                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                            {listing.images?.[0] ? (
                              <img
                                src={listing.images[0]}
                                alt={listing.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-slate-100 to-amber-50 text-2xl text-slate-400">
                                🧥
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="truncate text-sm font-bold text-slate-900">{listing.title}</h3>
                              {listing.isDraft && (
                                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-700">
                                  Draft
                                </span>
                              )}
                            </div>
                            <p className="mt-1 truncate text-xs text-slate-500">
                              {listing.occasion || 'No occasion'} · {listing.size || 'No size'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 align-top">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-slate-900 text-xs font-black text-white">
                            {listing.owner?.photoURL ? (
                              <img
                                src={listing.owner.photoURL}
                                alt={listing.owner.displayName}
                                className="h-full w-full rounded-full object-cover"
                              />
                            ) : (
                              getInitials(listing.owner?.displayName)
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {listing.owner?.displayName || 'Unknown owner'}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {listing.owner?.email || 'No email'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 align-top">
                        <div className="flex flex-wrap gap-2 text-xs font-semibold">
                          <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-900">
                            {listing.category || 'Uncategorized'}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4 align-top">
                        <p className="text-sm font-bold text-slate-900">
                          {formatCurrency(listing.pricePerDay)}/day
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Deposit {formatCurrency(listing.deposit)}
                        </p>
                      </td>

                      <td className="px-4 py-4 align-top">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${status.className}`}>
                          {status.label}
                        </span>
                      </td>

                      <td className="px-4 py-4 align-top">
                        <p className="text-sm font-semibold text-slate-700">
                          {formatDate(listing.createdAt)}
                        </p>
                      </td>

                      <td className="px-4 py-4 align-top text-right">
                        <div className="ml-auto flex justify-end gap-2">
                          {!listing.isDraft && (
                            <button
                              onClick={() => handleToggleVisibility(listing)}
                              disabled={actionId === listing.id}
                              className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
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
                            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {actionId === listing.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}

                {listings.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-500">
                      No listings match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {listings.length > 0 && (
          <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              Showing {pageStart}-{pageEnd} of {listings.length} listings
            </p>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>

              <div className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                Page {currentPage} of {totalPages}
              </div>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
        </>
      )}
    </>
  )
}

export default MarketplaceTab
