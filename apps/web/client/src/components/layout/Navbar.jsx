import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../../hooks/useAuth'

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const profileDropdownRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, loading } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleDashboardClick = () => {
    navigate('/dashboard')
    window.scrollTo(0, 0)
    setProfileDropdownOpen(false)
  }

  const handleClickLogo = () => {
    navigate('/')
    window.scrollTo(0, 0)
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('You have been logged out successfully')
      navigate('/')
      setProfileDropdownOpen(false)
    } catch (error) {
      toast.error('Failed to logout. Please try again.')
    }
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#FAF7F2]/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" onClick={handleClickLogo} className="flex items-center gap-2 group">
          <span className="text-2xl font-black tracking-tight text-[#1A1A1A]"
            style={{ fontFamily: "'Georgia', serif" }}>
            Listn<span className="text-[#00342B]">Rent</span>
          </span>
          <span className="text-xs text-[#888] font-medium tracking-widest uppercase mt-1 hidden sm:block">
            Ethnic Wear
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            to="/collection"
            className={`text-sm font-medium tracking-wide transition-colors hover:text-[#00342B] ${
              location.pathname === '/collection' ? 'text-[#00342B]' : 'text-[#555]'
            }`}
          >
            Browse Collection
          </Link>

          {/* List Outfit - Only show if authenticated */}
          {!loading && user && (
            <Link
              to="/create"
              className="text-sm font-medium px-5 py-2 bg-[#00342B] text-white rounded-full
                hover:bg-[#00695C] transition-colors duration-200 tracking-wide"
            >
              + List Outfit
            </Link>
          )}

          {/* Auth Section */}
          <div className="flex items-center gap-3 ml-4 border-l border-[#DDD] pl-4">
            {!loading && user ? (
              <div className="relative" ref={profileDropdownRef}>
                {/* Profile Dropdown Button */}
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 text-sm font-medium text-[#555] hover:text-[#1A1A1A] transition-colors"
                >
                  <span>👤 {user.displayName || 'Profile'}</span>
                  <span className={`transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-[#E8E0D5] shadow-lg z-50 overflow-hidden">
                    <button
                      onClick={handleDashboardClick}
                      className="w-full px-4 py-3 text-left text-sm font-medium text-[#555] hover:bg-[#FAF7F2] transition-colors flex items-center gap-2"
                    >
                      <span>📊</span> Dashboard
                    </button>
                    <div className="border-t border-[#E8E0D5]">
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-[#FFE8E0] transition-colors flex items-center gap-2"
                      >
                        <span>↪️</span> Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <a
                href="/login"
                onClick={(e) => {
                  e.preventDefault()
                  window.scrollTo(0, 0)
                  navigate('/login')
                }}
                className="text-sm font-medium text-[#555] hover:text-[#1A1A1A] transition-colors cursor-pointer"
              >
                {loading ? '...' : 'Sign In'}
              </a>
            )}
          </div>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-1"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-0.5 bg-[#1A1A1A] transition-transform duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-0.5 bg-[#1A1A1A] transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-[#1A1A1A] transition-transform duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#FAF7F2] border-t border-[#E8E0D5] px-6 py-4 flex flex-col gap-4">
          <Link to="/collection" className="text-sm font-medium text-[#555] hover:text-[#00342B] transition-colors">
            Browse Collection
          </Link>
            <Link to="/create" className="text-sm font-medium text-[#00342B]">
              + List Your Outfit
            </Link>

          {/* Mobile Auth Section */}
          {!loading && user ? (
            <>
              <div className="border-t border-[#DDD] pt-4">
                <p className="text-xs text-[#999] mb-3">Logged in as {user.email}</p>
                <button
                  onClick={() => {
                    navigate('/dashboard')
                    window.scrollTo(0, 0)
                    setMenuOpen(false)
                  }}
                  className="block w-full text-left text-sm font-medium text-[#555] mb-4 hover:text-[#1A1A1A] px-2 py-2 rounded hover:bg-[#F0EDE5] transition-colors"
                >
                  📊 Dashboard
                </button>
                <div className="border-t border-[#DDD] pt-4">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left text-sm font-medium text-red-600 hover:text-red-700 px-2 py-1"
                  >
                    ↪️ Log Out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="border-t border-[#DDD] pt-4">
              <Link to="/login" className="text-sm font-medium text-[#555]">
                {loading ? '...' : 'Sign In'}
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navbar