import React from 'react'
import Button from '../ui/Button'
import UserListingItem from '../ui/UserListingItem'

const UserListingsSection = ({
  listings,
  loading,
  error,
  showOnlyActive,
  onShowOnlyActiveChange,
  onEdit,
  onDelete,
  onToggleActive,
  onNavigate,
}) => {
  const filteredListings = showOnlyActive
    ? listings.filter((l) => l.isActive)
    : listings

  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#E8E0D5] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-[#1A1A1A]">Your Listings</h3>
          <p className="text-[#666] text-sm mt-1">
            Manage and track all your listed outfits
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-[#666] flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlyActive}
              onChange={(e) => onShowOnlyActiveChange(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            Show active only
          </label>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-[#FFE8E0] text-[#C8622A] rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="text-3xl animate-spin mb-2">⏳</div>
            <p className="text-[#666]">Loading your listings...</p>
          </div>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📦</div>
          <h4 className="text-lg font-semibold text-[#1A1A1A] mb-2">No listings yet</h4>
          <p className="text-[#666] mb-6">
            {showOnlyActive
              ? 'You have no active listings. Create one or reactivate an inactive listing.'
              : 'Start listing your outfits to earn by renting them out!'}
          </p>
          <Button
            onClick={() => onNavigate('/create')}
            variant="accent"
          >
            Create Your First Listing
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredListings.map((listing) => (
            <UserListingItem
              key={listing._id}
              listing={listing}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleActive={onToggleActive}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default UserListingsSection
