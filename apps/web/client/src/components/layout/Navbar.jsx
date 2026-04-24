import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { AnimatePresence, motion } from 'motion/react'
import { useAuth } from '../../hooks/useAuth'

const shellVariants = {
  hidden: {
    opacity: 0,
    y: -22,
    filter: 'blur(10px)',
  },
  top: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.55,
      ease: [0.16, 1, 0.3, 1],
      when: 'beforeChildren',
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
  scrolled: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1],
      when: 'beforeChildren',
      staggerChildren: 0.03,
    },
  },
}

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false)
  const [hasPassedHeroSection, setHasPassedHeroSection] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const profileDropdownRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, loading } = useAuth()
  const isHomePage = location.pathname === '/'
  const navState = scrolled || !isHomePage ? 'scrolled' : 'top'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const updateHeroProgress = () => {
      if (!isHomePage) {
        setHasPassedHeroSection(true)
        return
      }

      const heroSection = document.getElementById('home-hero-section')
      if (!heroSection) {
        setHasPassedHeroSection(false)
        return
      }

      const heroBottom = heroSection.getBoundingClientRect().bottom
      setHasPassedHeroSection(heroBottom <= 80)
    }

    updateHeroProgress()
    window.addEventListener('scroll', updateHeroProgress)
    window.addEventListener('resize', updateHeroProgress)

    return () => {
      window.removeEventListener('scroll', updateHeroProgress)
      window.removeEventListener('resize', updateHeroProgress)
    }
  }, [isHomePage])

  useEffect(() => {
    setMenuOpen(false)
    setProfileDropdownOpen(false)
  }, [location.pathname])

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
    setMenuOpen(false)
  }

  const handleClickLogo = () => {
    navigate('/')
    window.scrollTo(0, 0)
  }

  const handleNavigate = (path) => {
    navigate(path)
    window.scrollTo(0, 0)
    setMenuOpen(false)
    setProfileDropdownOpen(false)
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('You have been logged out successfully')
      navigate('/')
      setProfileDropdownOpen(false)
      setMenuOpen(false)
    } catch (error) {
      toast.error('Failed to logout. Please try again.')
    }
  }

  return (
    <motion.nav
      initial="hidden"
      animate={navState}
      variants={shellVariants}
      className="fixed top-0 left-0 right-0 z-50"
      style={{ willChange: 'transform, opacity, filter' }}
    >
      <motion.div
        aria-hidden="true"
        initial={false}
        animate={navState}
        variants={{
          top: { opacity: 0, y: -8 },
          scrolled: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 border-b border-[rgba(0,52,43,0.08)] bg-[linear-gradient(135deg,rgba(251,248,243,0.96)_0%,rgba(247,241,231,0.95)_52%,rgba(239,228,212,0.93)_100%)] shadow-[0_10px_30px_rgba(26,26,26,0.08)] backdrop-blur-md"
      />

      <motion.div
        className="relative mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-4 sm:px-6"
        variants={{
          hidden: { opacity: 0 },
          top: { opacity: 1 },
          scrolled: { opacity: 1 },
        }}
      >
        <motion.div variants={{ hidden: { x: -12, opacity: 0 }, top: { x: 0, opacity: 1 }, scrolled: { x: 0, opacity: 1 } }}>
          <Link to="/" onClick={handleClickLogo} className="group flex items-center gap-3">
            <span
              className="text-[30px] font-black tracking-tight text-[#1A1A1A]"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              Listn<span className="text-[#00342B]">Rent</span>
            </span>
            <span className="hidden rounded-full border border-[rgba(212,175,55,0.35)] bg-[rgba(212,175,55,0.12)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8B7340] sm:block">
              Ethnic Wear
            </span>
          </Link>
        </motion.div>

        <motion.div
          className="hidden items-center gap-2 lg:flex"
          variants={{ hidden: { opacity: 0, x: 12 }, top: { opacity: 1, x: 0 }, scrolled: { opacity: 1, x: 0 } }}
        >
          <Link
            to="/"
            className={`rounded-full px-4 py-2 text-sm font-semibold tracking-wide transition-all duration-300 ease-out ${
              location.pathname === '/'
                ? 'bg-[#00342B] text-[#FAF7F2] shadow-[0_6px_18px_rgba(0,52,43,0.25)]'
                : 'text-[#5B5149] hover:bg-[rgba(0,52,43,0.08)] hover:text-[#00342B]'
            }`}
          >
            Home
          </Link>
          <Link
            to="/collection"
            className={`rounded-full px-4 py-2 text-sm font-semibold tracking-wide transition-all duration-300 ease-out ${
              location.pathname === '/collection'
                ? 'bg-[#00342B] text-[#FAF7F2] shadow-[0_6px_18px_rgba(0,52,43,0.25)]'
                : 'text-[#5B5149] hover:bg-[rgba(0,52,43,0.08)] hover:text-[#00342B]'
            }`}
          >
            Collection
          </Link>

          <div className="ml-3 flex items-center gap-3 border-l border-[rgba(0,52,43,0.14)] pl-4">
            {!loading && user ? (
              <>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key="list-outfit-desktop"
                    initial={{ opacity: 0, x: 10, scale: 0.98 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 8, scale: 0.98 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      to="/create"
                      className="rounded-full border border-[#D4AF37] bg-[#00342B] px-5 py-2 text-sm font-bold tracking-[0.04em] text-[#FAF7F2] shadow-[0_10px_24px_rgba(0,52,43,0.24)] transition-colors hover:bg-[#0B4A3F]"
                    >
                      + List Outfit
                    </Link>
                  </motion.div>
                </AnimatePresence>

                <div className="relative" ref={profileDropdownRef}>
                  <motion.button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 rounded-full border border-[rgba(0,52,43,0.16)] bg-white/70 px-3.5 py-2 text-sm font-medium text-[#4A443D] transition-colors hover:text-[#1A1A1A]"
                    aria-expanded={profileDropdownOpen}
                    aria-label="Open profile menu"
                    whileHover={{ y: -1, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                  >
                    <span className="h-6 w-6 rounded-full bg-[#00342B] text-center text-xs font-bold leading-6 text-[#FAF7F2]">
                      {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                    </span>
                    <span>{user.displayName || 'Profile'}</span>
                    <motion.span
                      animate={{ rotate: profileDropdownOpen ? 180 : 0 }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                    >
                      ▼
                    </motion.span>
                  </motion.button>

                  <AnimatePresence>
                    {profileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-[#E8E0D5] bg-white shadow-lg"
                      >
                        <button
                          onClick={handleDashboardClick}
                          className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-[#555] transition-colors duration-200 ease-out hover:bg-[#FAF7F2]"
                        >
                          Dashboard
                        </button>
                        <div className="border-t border-[#E8E0D5]">
                          <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-red-600 transition-colors duration-200 ease-out hover:bg-[#FFE8E0]"
                          >
                            Log Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <a
                  href="/login"
                  onClick={(e) => {
                    e.preventDefault()
                    handleNavigate('/login')
                  }}
                  className="text-sm font-semibold text-[#4A443D] transition-colors hover:text-[#1A1A1A]"
                >
                  {loading ? '...' : 'Sign In'}
                </a>
                {hasPassedHeroSection && (
                  <motion.button
                    onClick={() => handleNavigate('/create')}
                    className="rounded-full border border-[#D4AF37] bg-[#00342B] px-5 py-2 text-sm font-bold tracking-[0.04em] text-[#FAF7F2] shadow-[0_10px_24px_rgba(0,52,43,0.24)] transition-colors hover:bg-[#0B4A3F]"
                    initial={{ opacity: 0, x: 12, scale: 0.98 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 8, scale: 0.98 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    + List Outfit
                  </motion.button>
                )}
              </>
            )}
          </div>
        </motion.div>

        <motion.button
          className="flex flex-col gap-1.5 p-1 lg:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          whileTap={{ scale: 0.96 }}
          whileHover={{ y: -1 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          <motion.span
            className="block h-0.5 w-5 bg-[#1A1A1A]"
            animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 6 : 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          />
          <motion.span
            className="block h-0.5 w-5 bg-[#1A1A1A]"
            animate={{ opacity: menuOpen ? 0 : 1, x: menuOpen ? 2 : 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          />
          <motion.span
            className="block h-0.5 w-5 bg-[#1A1A1A]"
            animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -6 : 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          />
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden overflow-hidden border-t border-[rgba(0,52,43,0.12)] bg-[linear-gradient(135deg,#FBF8F3_0%,#F7F1E7_52%,#EFE4D4_100%)] px-4 pb-5 pt-4 sm:px-6"
          >
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => handleNavigate('/collection')}
                className="rounded-full bg-[#00342B] px-4 py-2.5 text-sm font-bold text-[#FAF7F2] shadow-[0_8px_22px_rgba(0,52,43,0.26)]"
              >
                Explore
              </button>
              {!loading && user ? (
                <button
                  onClick={() => handleNavigate('/create')}
                  className="rounded-full border border-[#D4AF37] bg-white/80 px-4 py-2.5 text-sm font-bold text-[#00342B]"
                >
                  + List Outfit
                </button>
              ) : hasPassedHeroSection ? (
                <button
                  onClick={() => handleNavigate('/create')}
                  className="rounded-full border border-[#D4AF37] bg-white/80 px-4 py-2.5 text-sm font-bold text-[#00342B]"
                >
                  + List Outfit
                </button>
              ) : (
                <button
                  onClick={() => handleNavigate('/login')}
                  className="rounded-full border border-[#D4AF37] bg-white/80 px-4 py-2.5 text-sm font-bold text-[#00342B]"
                >
                  Sign In
                </button>
              )}
            </div>

            <div className="mt-4 space-y-2">
              <Link
                to="/"
                className={`block rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                  location.pathname === '/'
                    ? 'bg-[#00342B] text-[#FAF7F2]'
                    : 'bg-white/75 text-[#4A443D] hover:bg-white'
                }`}
              >
                Home
              </Link>
              <Link
                to="/collection"
                className={`block rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                  location.pathname === '/collection'
                    ? 'bg-[#00342B] text-[#FAF7F2]'
                    : 'bg-white/75 text-[#4A443D] hover:bg-white'
                }`}
              >
                Collection
              </Link>

              {!loading && user && (
                <Link
                  to="/dashboard"
                  className={`block rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                    location.pathname === '/dashboard'
                      ? 'bg-[#00342B] text-[#FAF7F2]'
                      : 'bg-white/75 text-[#4A443D] hover:bg-white'
                  }`}
                >
                  Dashboard
                </Link>
              )}
            </div>

            {!loading && user ? (
              <div className="mt-4 border-t border-[rgba(0,52,43,0.12)] pt-4">
                <p className="mb-2 text-xs text-[#7A7068]">Signed in as {user.email}</p>
                <button
                  onClick={handleLogout}
                  className="w-full rounded-xl border border-[#F0D7CF] bg-[#FFF3EF] px-4 py-2.5 text-left text-sm font-medium text-red-700"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="mt-4 border-t border-[rgba(0,52,43,0.12)] pt-4">
                <button
                  onClick={() => handleNavigate('/login')}
                  className="w-full rounded-xl border border-[rgba(0,52,43,0.14)] bg-white/80 px-4 py-2.5 text-left text-sm font-semibold text-[#4A443D]"
                >
                  {loading ? 'Loading...' : 'Continue to Sign In'}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

export default Navbar