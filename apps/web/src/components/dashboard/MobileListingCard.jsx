import React from 'react'
import Button from '../ui/Button'

const MobileListingCard = ({
  listing,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  const getStatusBadgeColor = (isActive) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="bg-white rounded-lg border border-[#E8E0D5] p-4 mb-4">
      {/* Image and Status */}
      <div className="relative mb-4">
        {listing.images && listing.images.length > 0 ? (
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-40 rounded-lg object-cover"
          />
        ) : (
          <div className="w-full h-40 rounded-lg bg-[#E8E0D5] flex items-center justify-center text-4xl">
            👗
          </div>
        )}
        <span
          className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
            listing.isActive
          )}`}
        >
          {listing.isActive ? 'Available' : 'Inactive'}
        </span>
      </div>

      {/* Content */}
      <div className="mb-4">
        <h3 className="font-bold text-[#1A1A1A] mb-1">{listing.title}</h3>
        <p className="text-sm text-[#666] mb-2">{listing.category}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#999]">Added {new Date(listing.createdAt).toLocaleDateString()}</span>
          <span className="text-lg font-bold text-[#004D40]">₹{listing.pricePerDay}/day</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => onEdit(listing._id)}
          className="flex-1 bg-[#004D40] text-white py-2 rounded-lg font-medium text-sm hover:bg-[#003830] transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(listing._id)}
          className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg font-medium text-sm hover:bg-red-200 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  )
}

export default MobileListingCard
