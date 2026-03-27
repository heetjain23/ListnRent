import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useUserListings } from '../hooks/useUserListings'
import Button from '../components/ui/Button'
import UserListingItem from '../components/ui/UserListingItem'
import EditListingModal from '../components/ui/EditListingModal'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, logout, loading: authLoading } = useAuth()
  const {
    listings,
    loading: listingsLoading,
    error: listingsError,
    fetchUserListings,
    updateListing,
    deleteListing,
    toggleListingActive,
  } = useUserListings(false)

  const [editingId, setEditingId] = useState(null)
  const [editingListing, setEditingListing] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showOnlyActive, setShowOnlyActive] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login')
    }
  }, [user, authLoading, navigate])

  // Fetch user listings when user is available
  useEffect(() => {
    if (user) {
      fetchUserListings()
    }
  }, [user, fetchUserListings])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleEditClick = (id) => {
    const listing = listings.find((l) => l._id === id)
    setEditingListing(listing)
    setEditingId(id)
  }

  const handleSaveListing = async (formData) => {
    try {
      setIsSaving(true)
      await updateListing(editingId, formData)
      setEditingId(null)
      setEditingListing(null)
    } catch (error) {
      console.error('Save error:', error)
      throw error
    } finally {
      setIsSaving(false)
    }
  }

  const filteredListings = showOnlyActive
    ? listings.filter((l) => l.isActive)
    : listings

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center pt-20">
        <div className="text-center">
          <div className="text-4xl animate-spin mb-4">⏳</div>
          <p className="text-[#666]">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] pt-20 pb-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">Dashboard</h1>
          <p className="text-[#666]">Manage your RentFit account and listings</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-sm border border-[#E8E0D5] p-6 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              {user.photoURL && (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Profile'}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#C8622A]"
                />
              )}
              <div>
                <h2 className="text-2xl font-bold text-[#1A1A1A]">
                  {user.displayName || 'Welcome!'}
                </h2>
                <p className="text-[#666] text-sm">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-[#E8E0D5] pt-4">
            <h3 className="font-semibold text-[#1A1A1A] mb-3 text-sm">Account Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[#999] text-xs uppercase tracking-wide">Email</p>
                <p className="text-[#1A1A1A] font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-[#999] text-xs uppercase tracking-wide">Total Listings</p>
                <p className="text-[#1A1A1A] font-medium">{listings.length}</p>
              </div>
              <div>
                <p className="text-[#999] text-xs uppercase tracking-wide">Active Listings</p>
                <p className="text-[#1A1A1A] font-medium">
                  {listings.filter((l) => l.isActive).length}
                </p>
              </div>
              <div>
                <p className="text-[#999] text-xs uppercase tracking-wide">Display Name</p>
                <p className="text-[#1A1A1A] font-medium">{user.displayName || 'Not set'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button
            onClick={() => navigate('/#listings')}
            variant="secondary"
            size="lg"
            className="w-full justify-center"
          >
            ← Browse Collection
          </Button>

          <Button
            onClick={() => navigate('/create')}
            variant="accent"
            size="lg"
            className="w-full justify-center"
          >
            + List New Outfit
          </Button>

          <Button
            onClick={handleLogout}
            variant="ghost"
            size="lg"
            className="w-full justify-center"
          >
            🚪 Sign Out
          </Button>
        </div>

        {/* Your Listings Section */}
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
                  onChange={(e) => setShowOnlyActive(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                Show active only
              </label>
            </div>
          </div>

          {listingsError && (
            <div className="mb-4 p-4 bg-[#FFE8E0] text-[#C8622A] rounded-lg">
              {listingsError}
            </div>
          )}

          {listingsLoading ? (
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
                onClick={() => navigate('/create')}
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
                  onEdit={handleEditClick}
                  onDelete={deleteListing}
                  onToggleActive={toggleListingActive}
                />
              ))}
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {editingListing && (
          <EditListingModal
            listing={editingListing}
            onClose={() => {
              setEditingId(null)
              setEditingListing(null)
            }}
            onSave={handleSaveListing}
            loading={isSaving}
          />
        )}
      </div>
    </div>
  )
}

export default Dashboard
