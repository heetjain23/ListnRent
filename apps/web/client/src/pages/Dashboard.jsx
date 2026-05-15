import React, { useEffect, useState, useCallback } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '../hooks/useAuth'
import { useUserListings } from '../hooks/useUserListings'
import { useEarnings } from '../hooks/useEarnings'
import { api } from '../services/api'
import { useSEO } from '../hooks/useSEO'

import { PiSquaresFourBold } from "react-icons/pi";
import { FaIndianRupeeSign } from "react-icons/fa6";
import { MdOutlineShoppingBag } from "react-icons/md";
import { CiShoppingBasket } from "react-icons/ci";
import { TiMessage } from "react-icons/ti";
import { IoSettingsOutline } from "react-icons/io5";
import { FiAlertCircle } from "react-icons/fi";

// Sub-section components
import ListingsTable from '../components/dashboard/ListingsTable'
import MobileListingCard from '../components/dashboard/MobileListingCard'
import SettingsSection from '../components/dashboard/SettingsSection'
import MyOrders from '../components/dashboard/MyOrders'
import MyRentalsAsOwner from '../components/dashboard/MyRentalsAsOwner'
import MyEarnings from '../components/dashboard/MyEarnings'
import { DisputesContent } from '../pages/Disputes.jsx'
import { ChatWindow } from '../components/messaging/ChatWindow'
import Loading from '../components/ui/Loading'

// ─── Icons ────────────────────────────────────────────────────────────────────

const icons = {
  listings: (
    <PiSquaresFourBold size={22}/>
  ),
  earnings: (
    <FaIndianRupeeSign size={18} style={{ marginBottom: -2 }} />
  ),
  orders: (
    <MdOutlineShoppingBag size={20} />
  ),
  rentals: (
    <CiShoppingBasket size={20} />
  ),
  messages: (
    <TiMessage size={20} />
  ),
  disputes: (
    <FiAlertCircle size={20} />
  ),
  settings: (
    <IoSettingsOutline size={20} />
  ),
  plus: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  chevron: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  menu: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  trending: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-4 h-4">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
}

// ─── Nav items config ─────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: 'listings',  label: 'My Listings',       icon: icons.listings  },
  { id: 'earnings',  label: 'Earnings',           icon: icons.earnings  },
  { id: 'orders',    label: 'My Orders',          icon: icons.orders    },
  { id: 'rentals',   label: 'My Rentals (Owner)', icon: icons.rentals   },
  { id: 'messages',  label: 'Messages',           icon: icons.messages  },
  { id: 'disputes',  label: 'Disputes',           icon: icons.disputes  },
  { id: 'settings',  label: 'Settings',           icon: icons.settings  },
]

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({ label, value, sub, accent, delay = 0, icon, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    onClick={onClick}
    className={`relative overflow-hidden rounded-2xl p-5 md:p-6 ${accent} ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
  >
    {/* decorative circle */}
    <div className="pointer-events-none absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-10 bg-current" />
    <div className="flex items-start justify-between mb-3">
      <span className="opacity-70">{icon}</span>
      <span className="flex items-center gap-1 text-xs font-semibold opacity-70">
        {icons.trending} +12%
      </span>
    </div>
    <p className="text-2xl md:text-3xl font-bold tracking-tight">{value}</p>
    <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mt-1">{label}</p>
    {sub && <p className="text-xs opacity-50 mt-0.5">{sub}</p>}
  </motion.div>
)

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const Sidebar = ({ activeTab, onTabChange, user, onLogout, onAddNew }) => (
  <aside className="hidden lg:flex flex-col w-64 xl:w-72 shrink-0 h-[calc(100vh-80px)] sticky top-20 overflow-y-auto">
    <div
      className="flex flex-col h-full rounded-2xl border border-[#E8E0D5] overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #ffffff 0%, #faf7f2 100%)' }}
    >
      {/* User profile block */}
      <div className="p-5 xl:p-6 border-b border-[#E8E0D5]">
        <div className="flex items-center gap-3">
          {user?.photoURL ? (
            <img src={user.photoURL} alt={user.displayName} className="w-11 h-11 rounded-xl object-cover border-2 border-[#004D40]/20" />
          ) : (
            <div className="w-11 h-11 rounded-xl bg-[#004D40] flex items-center justify-center text-white text-lg font-bold">
              {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[#1A1A1A] truncate text-sm">
              {user?.displayName || 'User'}
            </p>
            <p className="text-xs text-[#999] truncate">{user?.email}</p>
          </div>
        </div>
        {/* CTA: Add new item */}
        <motion.button
          onClick={onAddNew}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#004D40] text-white text-sm font-semibold shadow-[0_4px_14px_rgba(0,77,64,0.28)] hover:bg-[#00342B] transition-colors"
        >
          {icons.plus}
          List New Outfit
        </motion.button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 xl:p-4 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`
                w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium
                transition-all duration-200 group relative
                ${isActive
                  ? 'bg-[#004D40] text-white shadow-[0_4px_14px_rgba(0,77,64,0.22)]'
                  : 'text-[#5B5149] hover:bg-[#004D40]/6 hover:text-[#004D40]'
                }
              `}
            >
              <span className={`transition-transform duration-200 ${isActive ? 'scale-105' : 'group-hover:scale-105'}`}>
                {item.icon}
              </span>
              <span className="flex-1 text-left">{item.label}</span>
              {isActive && (
                <motion.span
                  layoutId="sidebar-active-dot"
                  className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"
                />
              )}
              {item.id === 'messages'}
            </button>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 xl:p-4 border-t border-[#E8E0D5]">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium text-[#999] hover:text-red-600 hover:bg-red-50 transition-all duration-200"
        >
          {icons.logout}
          Log Out
        </button>
      </div>
    </div>
  </aside>
)

// ─── Mobile Top Bar + Drawer ──────────────────────────────────────────────────

const MobileNav = ({ activeTab, onTabChange, user, onLogout, onAddNew }) => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const activeLabel = NAV_ITEMS.find(n => n.id === activeTab)?.label || 'Dashboard'

  useEffect(() => {
    if (!drawerOpen) return

    const { body, documentElement } = document
    const previousBodyOverflow = body.style.overflow
    const previousHtmlOverflow = documentElement.style.overflow
    const previousBodyTouchAction = body.style.touchAction

    body.style.overflow = 'hidden'
    body.style.touchAction = 'none'
    documentElement.style.overflow = 'hidden'

    return () => {
      body.style.overflow = previousBodyOverflow
      body.style.touchAction = previousBodyTouchAction
      documentElement.style.overflow = previousHtmlOverflow
    }
  }, [drawerOpen])

  return (
    <>
      {/* Top strip */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur-md border-b border-[#E8E0D5] sticky top-20 z-30">
        <div className="flex items-center gap-3">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="w-8 h-8 rounded-lg object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-[#004D40] flex items-center justify-center text-white text-sm font-bold">
              {(user?.displayName || 'U').charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-xs text-[#999]">Dashboard</p>
            <p className="text-sm font-semibold text-[#1A1A1A]">{activeLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onAddNew}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#004D40] text-white text-xs font-semibold rounded-lg"
          >
            {icons.plus} Add
          </button>
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 rounded-lg text-[#5B5149] hover:bg-[#F5F1EB] transition-colors"
          >
            {icons.menu}
          </button>
        </div>
      </div>

      {/* Drawer overlay */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-black/40 z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-72 h-dvh max-h-dvh bg-white z-50 lg:hidden flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between p-5 border-b border-[#E8E0D5]">
                <div className="flex items-center gap-3">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-10 h-10 rounded-xl object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-[#004D40] flex items-center justify-center text-white font-bold">
                      {(user?.displayName || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-sm text-[#1A1A1A]">{user?.displayName || 'User'}</p>
                    <p className="text-xs text-[#999] truncate max-w-32.5">{user?.email}</p>
                  </div>
                </div>
                <button onClick={() => setDrawerOpen(false)} className="p-1.5 rounded-lg text-[#999] hover:bg-[#F5F1EB]">
                  {icons.close}
                </button>
              </div>

              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                  const isActive = activeTab === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => { onTabChange(item.id); setDrawerOpen(false) }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive ? 'bg-[#004D40] text-white' : 'text-[#5B5149] hover:bg-[#F5F1EB]'
                      }`}
                    >
                      {item.icon}
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.id === 'messages' }
                    </button>
                  )
                })}
              </nav>

              <div className="p-4 pb-[calc(env(safe-area-inset-bottom)+5.75rem)] border-t border-[#E8E0D5] bg-white">
                <button
                  onClick={() => { onLogout(); setDrawerOpen(false) }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
                >
                  {icons.logout} Log Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

// ─── Welcome Hero ─────────────────────────────────────────────────────────────

const WelcomeHero = ({ user, totalListings, totalEarnings }) => {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = user?.displayName?.split(' ')[0] || 'there'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-2xl mb-6 md:mb-8"
      style={{
        background: 'linear-gradient(135deg, #003830 0%, #004D40 45%, #005A4A 100%)',
      }}
    >
      {/* Decorative elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute right-24 -bottom-8 w-32 h-32 rounded-full bg-[#D4AF37]/10" />
        <div className="absolute left-1/2 top-0 w-px h-full bg-linear-to-b from-transparent via-white/5 to-transparent" />
        {/* Gold accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-[#D4AF37]/40 to-transparent" />
      </div>

      <div className="relative p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-[#D4AF37]/80 text-sm font-medium tracking-wider uppercase mb-1">{greeting}</p>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Welcome back, {firstName} 👋
            </h1>
            <p className="text-white/50 text-sm mt-2">Your atelier is performing well this week.</p>
          </div>

          {/* Inline mini stats */}
          <div className="flex gap-4 md:gap-6">
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-[#D4AF37]">{totalListings}</p>
              <p className="text-white/50 text-xs uppercase tracking-widest mt-0.5">Listings</p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-[#D4AF37]">
                ₹{typeof totalEarnings === 'number' ? totalEarnings.toLocaleString('en-IN') : '0'}
              </p>
              <p className="text-white/50 text-xs uppercase tracking-widest mt-0.5">Earned</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Stats Grid ───────────────────────────────────────────────────────────────

const StatsGrid = ({ totalListings, totalEarnings, unreadMessages = 0, onMessagesClick }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
    <StatCard
      label="Live Listings"
      value={totalListings}
      sub="Items available to rent"
      accent="bg-[#004D40] text-white"
      delay={0.05}
      icon={icons.listings}
    />
    <StatCard
      label="Total Earned"
      value={`₹${typeof totalEarnings === 'number' ? totalEarnings.toLocaleString('en-IN') : '0'}`}
      sub="From completed rentals"
      accent="bg-[#C8622A] text-white"
      delay={0.1}
      icon={icons.earnings}
    />
    <div className="col-span-2 md:col-span-1">
      <StatCard
        label="Messages"
        value={unreadMessages > 0 ? unreadMessages : 'No new'}
        sub={unreadMessages > 0 ? `${unreadMessages > 1 ? 'new messages' : 'new message'} waiting` : 'Chat with renters'}
        accent="bg-[#FAF7F2] text-[#1A1A1A] border border-[#E8E0D5]"
        delay={0.15}
        icon={icons.messages}
        onClick={onMessagesClick}
      />
    </div>
  </div>
)

// ─── Listings Tab ─────────────────────────────────────────────────────────────

const ListingsTab = ({
  listings,
  listingsLoading,
  listingsError,
  deleteListing,
  toggleListingActive,
  handleEditClick,
  navigate,
}) => {
  const [subTab, setSubTab] = useState('live')
  const liveListings = listings.filter((l) => !l.isDraft)
  const draftListings = listings.filter((l) => l.isDraft)
  const current = subTab === 'live' ? liveListings : draftListings

  return (
    <div>
      {/* Sub-tab bar */}
      <div className="flex items-center gap-1 bg-[#F5F1EB] p-1 rounded-xl mb-6 w-fit">
        {[
          { id: 'live', label: `Live (${liveListings.length})` },
          { id: 'drafts', label: `Drafts (${draftListings.length})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={`
              relative px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
              ${subTab === t.id ? 'bg-white text-[#004D40] shadow-sm' : 'text-[#999] hover:text-[#666]'}
            `}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Quick-add strip */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[#1A1A1A]">
          {subTab === 'live' ? 'Live Listings' : 'Drafts'}
        </h2>
        <button
          onClick={() => navigate('/create')}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#004D40] hover:text-[#003830] transition-colors"
        >
          {icons.plus}
          {subTab === 'live' ? 'Add New' : 'New Draft'}
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-2xl border border-[#E8E0D5] overflow-hidden shadow-sm">
        <ListingsTable
          listings={current}
          loading={listingsLoading}
          error={listingsError}
          onEdit={handleEditClick}
          onDelete={deleteListing}
          onToggleActive={toggleListingActive}
          onCreateNew={() => navigate('/create')}
        />
      </div>

      {/* Mobile cards */}
      <div className="md:hidden">
        {listingsLoading ? (
          <ListingsLoader />
        ) : listingsError ? (
          <ErrorBanner message={listingsError} />
        ) : current.length === 0 ? (
          <EmptyState
            emoji={subTab === 'live' ? '👗' : '📝'}
            title={subTab === 'live' ? 'No live listings yet' : 'No drafts yet'}
            desc={subTab === 'live' ? 'Start listing to earn from your outfits.' : 'Save a draft to continue later.'}
            action={() => navigate('/create')}
            actionLabel={subTab === 'live' ? 'Add Your First Item' : 'Create Draft'}
          />
        ) : (
          <div className="space-y-4">
            {current.map((listing) => (
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
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ListingsLoader = () => (
  <div className="space-y-3">
    {[1, 2, 3].map(i => (
      <div key={i} className="bg-white rounded-2xl border border-[#E8E0D5] p-4 animate-pulse">
        <div className="flex gap-4">
          <div className="w-20 h-20 rounded-xl bg-[#F0EAE0]" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-4 bg-[#F0EAE0] rounded w-2/3" />
            <div className="h-3 bg-[#F0EAE0] rounded w-1/3" />
            <div className="h-3 bg-[#F0EAE0] rounded w-1/2" />
          </div>
        </div>
      </div>
    ))}
  </div>
)

const ErrorBanner = ({ message }) => (
  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm">{message}</div>
)

const EmptyState = ({ emoji, title, desc, action, actionLabel }) => (
  <div className="text-center py-14">
    <div className="text-5xl mb-3">{emoji}</div>
    <h4 className="text-lg font-semibold text-[#1A1A1A] mb-2">{title}</h4>
    <p className="text-[#999] text-sm mb-6 max-w-xs mx-auto">{desc}</p>
    <button
      onClick={action}
      className="px-6 py-2.5 bg-[#004D40] text-white rounded-xl font-semibold text-sm hover:bg-[#003830] transition-colors"
    >
      {actionLabel}
    </button>
  </div>
)

// ─── Tab Content Wrapper ──────────────────────────────────────────────────────

const TabContent = ({ children }) => (
  <AnimatePresence mode="wait">
    <motion.div
      key={children?.key ?? Math.random()}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  </AnimatePresence>
)

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const Dashboard = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { tab: routeTab, disputeId } = useParams()

  useSEO({
    title: 'Dashboard',
    description: 'Manage your listings, rentals, earnings, and account settings on ListnRent.',
    canonicalPath: '/dashboard',
    noIndex: true,
  })

  const { user, logout, loading: authLoading } = useAuth()

  const {
    listings,
    loading: listingsLoading,
    error: listingsError,
    fetchUserListings,
    deleteListing,
    toggleListingActive,
  } = useUserListings(false)

  const { fetchEarnings, calculateTotalEarnings } = useEarnings()

  const [activeTab, setActiveTab] = useState('listings')
  const [userData, setUserData] = useState(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [unreadMessages, setUnreadMessages] = useState(0)

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Derive stats
  const liveListings = listings.filter((l) => !l.isDraft)
  const totalListings = liveListings.length
  const totalEarnings = calculateTotalEarnings()

  // Handle incoming tab from navigation state
  useEffect(() => {
    const { activeTab: inTab } = location.state || {}
    if (inTab) {
      setActiveTab(inTab)
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  useEffect(() => {
    const nextTab = routeTab || (location.pathname === '/dashboard' ? 'listings' : null)
    if (nextTab && nextTab !== activeTab) {
      setActiveTab(nextTab)
    }
  }, [activeTab, location.pathname, routeTab])

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !user) navigate('/login')
    else if (user) setUserData(user)
  }, [user, authLoading, navigate])

  // Data fetching
  useEffect(() => {
    if (user) {
      fetchUserListings()
      fetchEarnings()
    }
  }, [user, fetchUserListings, fetchEarnings])

  // Fetch unread messages count
  useEffect(() => {
    const fetchUnreadMessages = async () => {
      try {
        const response = await api('/api/messages/unread', { auth: true })
        setUnreadMessages(response?.count || 0)
      } catch (error) {
        console.log('Unable to fetch unread messages')
      }
    }

    if (user) {
      fetchUnreadMessages()
    }
  }, [user])

  const handleTabChange = useCallback((tab) => {
    const nextPath = tab === 'listings' ? '/dashboard' : `/dashboard/${tab}`
    navigate(nextPath)
    setActiveTab(tab)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [navigate])

  const handleEditClick = useCallback((id) => {
    navigate(`/edit/${id}`)
    window.scrollTo(0, 0)
  }, [navigate])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch {}
  }

  const handleDeleteAccount = async () => {
    try {
      await api('/api/users/account', { auth: true, method: 'DELETE' })
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_token')
      navigate('/login')
    } catch (error) { throw error }
  }

  const handleNameUpdate = (newName) => {
    setUserData((prev) => ({ ...prev, displayName: newName }))
  }

  if (authLoading) {
    return <Loading message="Loading your dashboard…" variant="dashboard" />
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#FAF7F2] pt-20">
      {/* Mobile nav */}
      <MobileNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        user={userData || user}
        onLogout={handleLogout}
        onAddNew={() => navigate('/create')}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="flex gap-6 xl:gap-8 items-start">
          {/* Desktop Sidebar */}
          <Sidebar
            activeTab={activeTab}
            onTabChange={handleTabChange}
            user={userData || user}
            onLogout={handleLogout}
            onAddNew={() => navigate('/create')}
          />

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Welcome hero – only on listings tab */}
            <AnimatePresence>
              {activeTab === 'listings' && (
                <motion.div
                  key="hero"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <WelcomeHero
                    user={userData || user}
                    totalListings={totalListings}
                    totalEarnings={totalEarnings}
                  />
                  <StatsGrid 
                    totalListings={totalListings} 
                    totalEarnings={totalEarnings}
                    unreadMessages={unreadMessages}
                    onMessagesClick={() => handleTabChange('messages')}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Page heading for non-listings tabs */}
            {activeTab !== 'listings' && (
              <motion.div
                key={activeTab + '-heading'}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#004D40]/10 flex items-center justify-center text-[#004D40]">
                    {NAV_ITEMS.find(n => n.id === activeTab)?.icon}
                  </div>
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold text-[#1A1A1A]">
                      {NAV_ITEMS.find(n => n.id === activeTab)?.label}
                    </h1>
                    <p className="text-xs text-[#999]">
                      {activeTab === 'earnings' && 'Track your rental income'}
                      {activeTab === 'orders' && 'Your rental bookings'}
                      {activeTab === 'rentals' && 'See who rented your outfits'}
                      {activeTab === 'messages' && 'Chat with renters & owners'}
                      {activeTab === 'disputes' && 'Review support threads'}
                      {activeTab === 'settings' && 'Manage your profile & account'}
                    </p>
                  </div>
                </div>
                {/* Divider */}
                <div className="mt-4 h-px bg-linear-to-r from-[#E8E0D5] to-transparent" />
              </motion.div>
            )}

            {/* Tab content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                {activeTab === 'listings' && (
                  <ListingsTab
                    listings={listings}
                    listingsLoading={listingsLoading}
                    listingsError={listingsError}
                    deleteListing={deleteListing}
                    toggleListingActive={toggleListingActive}
                    handleEditClick={handleEditClick}
                    navigate={navigate}
                  />
                )}

                {activeTab === 'earnings' && <MyEarnings />}

                {activeTab === 'orders' && <MyOrders />}

                {activeTab === 'rentals' && <MyRentalsAsOwner />}

                {activeTab === 'messages' && <ChatWindow isMobile={isMobile} />}

                {activeTab === 'disputes' && <DisputesContent basePath="/dashboard/disputes" disputeId={disputeId} />}

                {activeTab === 'settings' && (
                  <SettingsSection
                    user={userData || user}
                    onDeleteAccount={handleDeleteAccount}
                    onNameUpdate={handleNameUpdate}
                    onLogout={handleLogout}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard