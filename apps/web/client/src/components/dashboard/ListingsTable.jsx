import React, { useState } from 'react'
import Button from '../ui/Button'
import { getOptimizedImageUrl } from '../../services/cloudinary'

const ListingsTable = ({
  listings,
  loading,
  error,
  onEdit,
  onDelete,
  onToggleActive,
  onCreateNew,
}) => {
  const [togglingId, setTogglingId] = useState(null)

  const getStatusColor = (status) => {
    switch (status) {
      case 'Rented':
        return 'bg-yellow-100 text-yellow-800'
      case 'Available':
        return 'bg-green-100 text-green-800'
      case 'In Cleaning':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadgeLabel = (listing) => {
    if (!listing.isActive) return 'Inactive'
    return 'Available'
  }

  const handleToggleActive = async (listing) => {
    try {
      setTogglingId(listing._id)
      await onToggleActive(listing._id, listing.isActive)
    } finally {
      setTogglingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="text-3xl animate-spin mb-2">⏳</div>
          <p className="text-[#666]">Loading your listings...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-[#FFE8E0] text-[#C8622A] rounded-lg">
        {error}
      </div>
    )
  }

  if (listings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-3">👗</div>
        <h4 className="text-lg font-semibold text-[#1A1A1A] mb-2">No items yet</h4>
        <p className="text-[#666] mb-6">
          Start listing your outfits to earn by renting them out!
        </p>
        <Button onClick={onCreateNew} variant="accent">
          Add Your First Item
        </Button>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#E8E0D5]">
            <th className="text-left py-4 px-6 font-semibold text-[#666] text-sm uppercase tracking-wide">
              ITEM DETAIL
            </th>
            <th className="text-left py-4 px-6 font-semibold text-[#666] text-sm uppercase tracking-wide">
              CATEGORY
            </th>
            <th className="text-left py-4 px-6 font-semibold text-[#666] text-sm uppercase tracking-wide">
              STATUS
            </th>
            <th className="text-left py-4 px-6 font-semibold text-[#666] text-sm uppercase tracking-wide">
              RENTAL PRICE
            </th>
            <th className="text-left py-4 px-6 font-semibold text-[#666] text-sm uppercase tracking-wide">
              ACTIONS
            </th>
          </tr>
        </thead>
        <tbody>
          {listings.map((listing) => (
            <tr key={listing._id} className="border-b border-[#F0F0F0] hover:bg-[#FAF7F2] transition-colors">
              <td className="py-4 px-6">
                <div className="flex items-center gap-4">
                  {listing.images && listing.images.length > 0 ? (
                    <img
                      src={getOptimizedImageUrl(listing.images[0], { width: 50, height: 50, quality: 'auto' })}
                      alt={listing.title}
                      loading="lazy"
                      className="w-12 h-12 rounded object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded bg-[#E8E0D5] flex items-center justify-center text-lg">
                      👗
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-[#1A1A1A]">{listing.title}</p>
                    <p className="text-sm text-[#999] mt-1">
                      Added {new Date(listing.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </td>
              <td className="py-4 px-6">
                <p className="text-[#1A1A1A] font-medium">{listing.category}</p>
              </td>
              <td className="py-4 px-6">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  listing.isActive ? 'Available' : 'Inactive'
                )}`}>
                  {getStatusBadgeLabel(listing)}
                </span>
              </td>
              <td className="py-4 px-6">
                <p className="text-[#1A1A1A] font-medium">₹{listing.pricePerDay}/day</p>
              </td>
              <td className="py-4 px-6">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(listing._id)}
                    className="text-[#004D40] hover:text-[#003830] font-medium text-sm"
                  >
                    Edit
                  </button>
                  <span className="text-[#DDD]">|</span>
                  <button
                    onClick={() => handleToggleActive(listing)}
                    disabled={togglingId === listing._id}
                    className={`font-medium text-sm transition-colors ${
                      listing.isActive
                        ? 'text-blue-600 hover:text-blue-700 disabled:opacity-50'
                        : 'text-purple-600 hover:text-purple-700 disabled:opacity-50'
                    }`}
                  >
                    {togglingId === listing._id ? '⏳' : listing.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <span className="text-[#DDD]">|</span>
                  <button
                    onClick={() => onDelete(listing._id)}
                    className="text-red-600 hover:text-red-700 font-medium text-sm"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ListingsTable
