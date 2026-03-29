import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useUserListings } from '../hooks/useUserListings'
import EditListingModal from '../components/ui/EditListingModal'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import StatCard from '../components/dashboard/StatCard'
import DashboardTabs from '../components/dashboard/DashboardTabs'
import ListingsTable from '../components/dashboard/ListingsTable'
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
        {/* Dashboard Header - show on listings tabs */}
        
          <DashboardHeader
            userName={user?.displayName?.split(' ')[0] || 'User'}
            performanceText="Your atelier's performance is up 12% this week."
            onAddNew={() => navigate('/create')}
          />

        {/* Stats Cards - show on listings tabs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
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

        {/* Dashboard Tabs */}
        <DashboardTabs activeTab={activeTab} onTabChange={handleTabChange} onLogout={handleLogout} />

        {/* Personal Information Tab */}
        {activeTab === 'personal' && <PersonalInformation user={user} />}

        {/* My Listings Tab */}
        {activeTab === 'listings' && (
          <div className="space-y-8">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#1A1A1A]">My Wardrobe</h2>
                <a href="#" className="text-[#004D40] font-medium text-sm hover:underline">
                  VIEW ALL ITEMS →
                </a>
              </div>
              
              <div className="bg-white rounded-lg border border-[#E8E0D5] p-6">
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
            </div>
            <PromoBanner onBoost={() => alert('Boost feature coming soon!')} />
          </div>
        )}

        {/* My Orders Tab */}
        {activeTab === 'orders' && <MyOrders />}

        {/* Earnings Tab */}
        {activeTab === 'earnings' && (
          <div className="bg-white rounded-lg border border-[#E8E0D5] p-8">
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6">Earnings</h2>
            <p className="text-[#666]">Earnings analytics coming soon.</p>
          </div>
        )}

        {/* My Rentals (As Owner) Tab */}
        {activeTab === 'rentals' && <MyRentalsAsOwner />}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-lg border border-[#E8E0D5] p-8">
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6">Messages</h2>
            <p className="text-[#666]">Messages feature coming soon.</p>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg border border-[#E8E0D5] p-8">
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
