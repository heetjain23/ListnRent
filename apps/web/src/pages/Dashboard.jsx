import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useUserListings } from '../hooks/useUserListings'
import EditListingModal from '../components/ui/EditListingModal'
import ProfileCard from '../components/dashboard/ProfileCard'
import QuickActionsSection from '../components/dashboard/QuickActionsSection'
import UserListingsSection from '../components/dashboard/UserListingsSection'

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
        <ProfileCard user={user} listings={listings} />

        {/* Quick Actions */}
        <QuickActionsSection onLogout={handleLogout} />

        {/* Your Listings Section */}
        <UserListingsSection
          listings={listings}
          loading={listingsLoading}
          error={listingsError}
          showOnlyActive={showOnlyActive}
          onShowOnlyActiveChange={setShowOnlyActive}
          onEdit={handleEditClick}
          onDelete={deleteListing}
          onToggleActive={toggleListingActive}
          onNavigate={navigate}
        />

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
