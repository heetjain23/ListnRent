import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
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

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
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
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl font-black tracking-tight text-[#1A1A1A]"
            style={{ fontFamily: "'Georgia', serif" }}>
            Rent<span className="text-[#C8622A]">Fit</span>
          </span>
          <span className="text-xs text-[#888] font-medium tracking-widest uppercase mt-1 hidden sm:block">
            Ethnic Wear
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className={`text-sm font-medium tracking-wide transition-colors hover:text-[#C8622A] ${
              location.pathname === '/' ? 'text-[#C8622A]' : 'text-[#555]'
            }`}
          >
            Browse
          </Link>

          {/* List Outfit - Only show if authenticated */}
          {!loading && user && (
            <Link
              to="/create"
              className="text-sm font-medium px-5 py-2 bg-[#1A1A1A] text-[#FAF7F2] rounded-full
                hover:bg-[#C8622A] transition-colors duration-200 tracking-wide"
            >
              + List Outfit
            </Link>
          )}

          {/* Auth Section */}
          <div className="flex items-center gap-3 ml-4 border-l border-[#DDD] pl-4">
            {!loading && user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-sm font-medium text-[#555] hover:text-[#1A1A1A] transition-colors"
                >
                  👤 {user.displayName || 'Profile'}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-[#999] hover:text-red-600 transition-colors"
                >
                  ↪️ Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="text-sm font-medium text-[#555] hover:text-[#1A1A1A] transition-colors"
              >
                {loading ? '...' : 'Sign In'}
              </Link>
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
          <Link to="/" className="text-sm font-medium text-[#555] hover:text-[#C8622A] transition-colors">
            Browse Outfits
          </Link>

          {/* List Your Outfit - Only show if authenticated */}
          {!loading && user && (
            <Link to="/create" className="text-sm font-medium text-[#C8622A]">
              + List Your Outfit
            </Link>
          )}

          {/* Mobile Auth Section */}
          {!loading && user ? (
            <>
              <div className="border-t border-[#DDD] pt-4">
                <p className="text-xs text-[#999] mb-2">Logged in as {user.email}</p>
                <Link to="/dashboard" className="block text-sm font-medium text-[#555] mb-2 hover:text-[#1A1A1A]">
                  👤 Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="block text-sm font-medium text-red-600 hover:text-red-700"
                >
                  ↪️ Sign Out
                </button>
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