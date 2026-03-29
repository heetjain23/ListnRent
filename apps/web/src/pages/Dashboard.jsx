import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useUserListings } from '../hooks/useUserListings'
import EditListingModal from '../components/ui/EditListingModal'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import StatCard from '../components/dashboard/StatCard'
import DashboardTabs from '../components/dashboard/DashboardTabs'
import ListingsTable from '../components/dashboard/ListingsTable'
import MobileListingCard from '../components/dashboard/MobileListingCard'
import PromoBanner from '../components/dashboard/PromoBanner'
import PersonalInformation from '../components/dashboard/PersonalInformation'
import MyOrders from '../components/dashboard/MyOrders'
import MyRentalsAsOwner from '../components/dashboard/MyRentalsAsOwner'

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

  const [activeTab, setActiveTab] = useState('personal')
  const [editingId, setEditingId] = useState(null)
  const [editingListing, setEditingListing] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  // Calculate stats from listings
  const activeListings = listings.filter((l) => l.isActive).length
  const totalEarnings = listings.reduce((sum, l) => sum + (l.pricePerDay || 0), 0) * 30 // Rough estimate
  const pendingRequests = Math.floor(Math.random() * 10) + 1 // Placeholder

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    window.scrollTo(0, 0)
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

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
      <div className="max-w-7xl mx-auto px-4">
          <DashboardHeader
            userName={user?.displayName?.split(' ')[0] || 'User'}
            performanceText="Your atelier's performance is up 12% this week."
            onAddNew={() => navigate('/create')}
          />

          <div className="mb-8">
            {/* Mobile: Primary stat card */}
            <div className="md:hidden mb-4">
              <div className="bg-[#004D40] text-white rounded-lg p-6">
                <p className="text-[#CCC] text-xs uppercase tracking-wide mb-2">Total Earnings</p>
                <h2 className="text-4xl font-bold">₹{totalEarnings.toLocaleString()}</h2>
                <p className="text-sm text-[#AAA] mt-2">This Month</p>
              </div>
            </div>

            {/* Mobile: Secondary stats */}
            <div className="grid grid-cols-2 gap-4 md:hidden mb-6">
              <div className="bg-white rounded-lg border border-[#E8E0D5] p-4">
                <p className="text-[#999] text-xs uppercase tracking-wide font-medium mb-2">Active Rentals</p>
                <p className="text-2xl font-bold text-[#1A1A1A]">{activeListings}</p>
              </div>
              <div className="bg-white rounded-lg border border-[#E8E0D5] p-4">
                <p className="text-[#999] text-xs uppercase tracking-wide font-medium mb-2">Pending Requests</p>
                <p className="text-2xl font-bold text-[#1A1A1A]">{String(pendingRequests).padStart(2, '0')}</p>
              </div>
            </div>

            {/* Desktop: Full stat cards */}
            <div className="hidden md:grid grid-cols-3 gap-6 mb-12">
              <StatCard
                icon="📅"
                label="Active Rentals"
                value={activeListings}
                period="Today"
              />
              <StatCard
                icon="💰"
                label="Total Earnings"
                value={`₹${totalEarnings.toLocaleString()}`}
                period="This Month"
              />
              <StatCard
                icon="🔔"
                label="Pending Requests"
                value={String(pendingRequests).padStart(2, '0')}
              />
            </div>
          </div>

        {/* Dashboard Tabs */}
        <DashboardTabs activeTab={activeTab} onTabChange={handleTabChange} onLogout={handleLogout} />

        {/* Personal Information Tab */}
        {activeTab === 'personal' && <PersonalInformation user={user} />}

        {/* My Listings Tab */}
        {activeTab === 'listings' && (
          <div className="space-y-6 md:space-y-8">
            <div>
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-[#1A1A1A]">Live Listings</h2>
                <button
                  onClick={() => navigate('/create')}
                  className="text-[#004D40] font-medium text-xs md:text-sm hover:underline"
                >
                  + ADD NEW ITEM
                </button>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block bg-white rounded-lg border border-[#E8E0D5] p-6">
                <ListingsTable
                  listings={listings}
                  loading={listingsLoading}
                  error={listingsError}
                  onEdit={handleEditClick}
                  onDelete={deleteListing}
                  onToggleActive={toggleListingActive}
                  onCreateNew={() => navigate('/create')}
                />
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden">
                {listingsLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="text-center">
                      <div className="text-3xl animate-spin mb-2">⏳</div>
                      <p className="text-[#666]">Loading your listings...</p>
                    </div>
                  </div>
                ) : listingsError ? (
                  <div className="p-4 bg-[#FFE8E0] text-[#C8622A] rounded-lg">
                    {listingsError}
                  </div>
                ) : listings.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-3">👗</div>
                    <h4 className="text-lg font-semibold text-[#1A1A1A] mb-2">No items yet</h4>
                    <p className="text-[#666] mb-6">Start listing your outfits to earn by renting them out!</p>
                    <button
                      onClick={() => navigate('/create')}
                      className="bg-[#004D40] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#003830] transition-colors"
                    >
                      Add Your First Item
                    </button>
                  </div>
                ) : (
                  <div>
                    {listings.map((listing) => (
                      <MobileListingCard
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
            </div>

            {/* Promotional Banner - Desktop only */}
            <div className="hidden md:block">
              <PromoBanner onBoost={() => alert('Boost feature coming soon!')} />
            </div>
          </div>
        )}

        {/* My Orders Tab */}
        {activeTab === 'orders' && <MyOrders />}

        {/* Earnings Tab */}
        {activeTab === 'earnings' && (
          <div className="bg-white rounded-lg border border-[#E8E0D5] p-6 md:p-8">
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6">Earnings</h2>
            <p className="text-[#666]">Earnings analytics coming soon.</p>
          </div>
        )}

        {/* My Rentals (As Owner) Tab */}
        {activeTab === 'rentals' && <MyRentalsAsOwner />}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-lg border border-[#E8E0D5] p-6 md:p-8">
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6">Messages</h2>
            <p className="text-[#666]">Messages feature coming soon.</p>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg border border-[#E8E0D5] p-6 md:p-8">
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6">Settings</h2>
            <p className="text-[#666]">Settings coming soon.</p>
          </div>
        )}

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
