import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import Button from './Button'

const UserListingItem = ({ listing, onEdit, onDelete, onToggleActive }) => {
  const navigate = useNavigate()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isTogglingActive, setIsTogglingActive] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await onDelete(listing._id)
      toast.success('Listing deleted successfully')
      setShowDeleteConfirm(false)
    } catch (error) {
      toast.error(error.message || 'Failed to delete listing')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleActive = async () => {
    try {
      setIsTogglingActive(true)
      await onToggleActive(listing._id, listing.isActive)
      toast.success(listing.isActive ? 'Listing deactivated' : 'Listing activated')
    } catch (error) {
      toast.error(error.message || 'Failed to update listing status')
    } finally {
      setIsTogglingActive(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#E8E0D5] p-4 hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        {/* Image */}
        <div className="shrink-0">
          {listing.images && listing.images.length > 0 ? (
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-24 h-24 object-cover rounded-lg"
            />
          ) : (
            <div className="w-24 h-24 bg-[#F0EAE0] rounded-lg flex items-center justify-center text-[#999]">
              No image
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-[#1A1A1A] truncate">
                {listing.title}
              </h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="inline-block bg-[#F0EAE0] text-[#666] px-2 py-1 rounded text-xs">
                  {listing.category}
                </span>
                <span className="inline-block bg-[#F0EAE0] text-[#666] px-2 py-1 rounded text-xs">
                  {listing.occasion}
                </span>
                <span className="inline-block bg-[#F0EAE0] text-[#666] px-2 py-1 rounded text-xs">
                  Size: {listing.size}
                </span>
              </div>
            </div>
            {!listing.isActive && (
              <span className="inline-block bg-[#FFE8E0] text-[#C8622A] px-2 py-1 rounded text-xs font-semibold">
                Inactive
              </span>
            )}
          </div>

          <p className="text-sm text-[#666] line-clamp-2 mb-2">
            {listing.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="font-semibold text-[#1A1A1A]">
                ₹{listing.pricePerDay}/day
              </span>
              <span className="text-[#999] mx-2">•</span>
              <span className="text-[#666]">
                {listing.location.area}, {listing.location.city}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-[#E8E0D5]">
        <Button
          onClick={() => navigate(`/listing/${listing._id}`)}
          variant="outline"
          size="sm"
          className="flex-1"
        >
          View
        </Button>

        <Button
          onClick={() => onEdit(listing._id)}
          variant="outline"
          size="sm"
          className="flex-1"
        >
          Edit
        </Button>

        <Button
          onClick={handleToggleActive}
          disabled={isTogglingActive}
          variant={listing.isActive ? 'outline' : 'primary'}
          size="sm"
          className="flex-1"
        >
          {isTogglingActive ? '...' : listing.isActive ? 'Hide' : 'Show'}
        </Button>

        <Button
          onClick={() => setShowDeleteConfirm(true)}
          variant="danger"
          size="sm"
          className="flex-1"
        >
          Delete
        </Button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-2">
              Delete Listing?
            </h3>
            <p className="text-[#666] mb-6">
              Are you sure you want to delete "{listing.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                variant="danger"
                className="flex-1"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserListingItem
