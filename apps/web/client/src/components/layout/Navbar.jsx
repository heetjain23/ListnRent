import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { AnimatePresence, motion } from 'motion/react'
import { useAuth } from '../../hooks/useAuth'

// ─── Animation variants ───────────────────────────────────────────────────────
const shellVariants = {
  hidden:   { opacity: 0, y: -22, filter: 'blur(10px)' },
  top:      { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1], when: 'beforeChildren', staggerChildren: 0.04, delayChildren: 0.05 } },
  scrolled: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1], when: 'beforeChildren', staggerChildren: 0.03 } },
}

const itemVariants = {
  hidden:   { x: -12, opacity: 0 },
  top:      { x: 0, opacity: 1 },
  scrolled: { x: 0, opacity: 1 },
}

// ─── Nav Link ─────────────────────────────────────────────────────────────────
function NavLink({ to, active, children }) {
  return (
    <Link
      to={to}
      className={`relative rounded-full px-4 py-2 text-sm font-semibold tracking-wide transition-all duration-300 ease-out ${
        active
          ? 'bg-[#00342B] text-[#FAF7F2] shadow-[0_6px_18px_rgba(0,52,43,0.25)]'
          : 'text-[#5B5149] hover:bg-[rgba(0,52,43,0.08)] hover:text-[#00342B]'
      }`}
    >
      {children}
      {/* Active gold underline dot */}
      {active && (
        <motion.div
          layoutId="nav-active-dot"
          className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#D4AF37]"
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}
    </Link>
  )
}

// ─── CTA Button ──────────────────────────────────────────────────────────────
function CTAButton({ onClick, children }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="relative overflow-hidden rounded-full border border-[#D4AF37] bg-[#00342B] px-5 py-2 text-sm font-bold tracking-[0.04em] text-[#FAF7F2] shadow-[0_8px_24px_rgba(0,52,43,0.22)]"
    >
      <span className="relative z-10">{children}</span>
      {/* shimmer */}
      <motion.div
        className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(212,175,55,0.18),transparent)]"
        style={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.5 }}
      />
    </motion.button>
  )
}

// ─── Profile Dropdown ─────────────────────────────────────────────────────────
function ProfileDropdown({ user, onDashboard, onLogout, open, setOpen, dropdownRef }) {
  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label="Open profile menu"
        whileHover={{ y: -1, scale: 1.01 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.22 }}
        className="flex items-center gap-2 rounded-full border border-[rgba(0,52,43,0.16)] bg-white/70 px-3.5 py-2 text-sm font-medium text-[#4A443D] backdrop-blur-sm transition-colors hover:border-[rgba(212,175,55,0.4)] hover:text-[#1A1A1A]"
      >
        {/* Avatar orb */}
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00342B] text-xs font-bold text-[#FAF7F2]">
          {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
        </span>
        <span className="max-w-20 truncate">{user.displayName || 'Profile'}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.22 }}
          className="text-[10px] text-[#999]"
        >
          ▼
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-[#E8E0D5] bg-white/95 shadow-[0_16px_48px_rgba(0,0,0,0.12)] backdrop-blur-md"
          >
            {/* Top accent */}
            <div className="h-0.5 w-full bg-[linear-gradient(90deg,#D4AF37,#C8622A,transparent)]" />
            <button
              onClick={onDashboard}
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-[#555] transition-colors hover:bg-[#FAF7F2] hover:text-[#00342B]"
            >
              Dashboard
            </button>
            <div className="border-t border-[#E8E0D5]">
              <button
                onClick={onLogout}
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-red-600 transition-colors hover:bg-[#FFF3EF]"
              >
                Log Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────
const Navbar = () => {
  const [scrolled, setScrolled]                     = useState(false)
  const [hasPassedHeroSection, setHasPassedHeroSection] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const navRef              = useRef(null)
  const profileDropdownRef  = useRef(null)
  const location            = useLocation()
  const navigate            = useNavigate()
  const { user, logout, loading } = useAuth()
  const isHomePage = location.pathname === '/'
  const navState   = scrolled || !isHomePage ? 'scrolled' : 'top'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const update = () => {
      if (!isHomePage) { setHasPassedHeroSection(true); return }
      const hero = document.getElementById('home-hero-section')
      if (!hero) { setHasPassedHeroSection(false); return }
      setHasPassedHeroSection(hero.getBoundingClientRect().bottom <= 80)
    }
    update()
    window.addEventListener('scroll', update)
    window.addEventListener('resize', update)
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update) }
  }, [isHomePage])

  useEffect(() => {
    setProfileDropdownOpen(false)
  }, [location.pathname])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    const handleOutside = (e) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) setProfileDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleOutside)
    document.addEventListener('touchstart', handleOutside)
    return () => { document.removeEventListener('mousedown', handleOutside); document.removeEventListener('touchstart', handleOutside) }
  }, [])

  const handleNavigate = (path) => { navigate(path); window.scrollTo(0, 0); setProfileDropdownOpen(false) }
  const handleDashboard = () => { navigate('/dashboard'); window.scrollTo(0, 0); setProfileDropdownOpen(false) }
  const handleClickLogo = () => { navigate('/'); window.scrollTo(0, 0) }
  const handleLogout = async () => {
    try {
      await logout()
      toast.success('You have been logged out successfully')
      navigate('/')
      setProfileDropdownOpen(false)
    } catch {
      toast.error('Failed to logout. Please try again.')
    }
  }

  return (
    <motion.nav
      ref={navRef}
      initial="hidden"
      animate={navState}
      variants={shellVariants}
      className="fixed top-0 left-0 right-0 z-50"
      style={{ willChange: 'transform, opacity, filter' }}
    >
      {/* ── Scrolled background panel ── */}
      <motion.div
        aria-hidden="true"
        initial={false}
        animate={navState}
        variants={{
          top:     { opacity: 0, y: -8 },
          scrolled: { opacity: 1, y: 0 },
        }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-x-0 top-0 h-20 border-b border-[rgba(0,52,43,0.08)] bg-[linear-gradient(135deg,rgba(251,248,243,0.97)_0%,rgba(247,241,231,0.96)_52%,rgba(239,228,212,0.94)_100%)] shadow-[0_10px_30px_rgba(26,26,26,0.07)] backdrop-blur-md"
      />

      {/* ── Scrolled top gold accent line ── */}
      <motion.div
        initial={false}
        animate={navState}
        variants={{ top: { opacity: 0 }, scrolled: { opacity: 1 } }}
        transition={{ duration: 0.35 }}
        className="absolute inset-x-0 top-0 h-0.5 bg-[linear-gradient(90deg,transparent,rgba(212,175,55,0.5),rgba(200,98,42,0.3),transparent)]"
      />

      {/* ── Main row ── */}
      <motion.div
        className="relative mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-5 sm:px-6"
        variants={{ hidden: { opacity: 0 }, top: { opacity: 1 }, scrolled: { opacity: 1 } }}
      >
        {/* Logo */}
        <motion.div variants={itemVariants}>
          <button onClick={handleClickLogo} className="group flex items-center gap-3">
            <span
              className="text-[30px] font-black tracking-tight text-[#1A1A1A]"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              Listn<span className="text-[#00342B]">Rent</span>
            </span>
            <span className="hidden rounded-full border border-[rgba(212,175,55,0.35)] bg-[rgba(212,175,55,0.12)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8B7340] sm:block">
              Ethnic Wear
            </span>
          </button>
        </motion.div>

        {/* ── Desktop nav ── */}
        <motion.div
          className="hidden items-center gap-2 lg:flex"
          variants={{ hidden: { opacity: 0, x: 12 }, top: { opacity: 1, x: 0 }, scrolled: { opacity: 1, x: 0 } }}
        >
          <NavLink to="/" active={location.pathname === '/'}>Home</NavLink>
          <NavLink to="/collection" active={location.pathname === '/collection'}>Collection</NavLink>

          <div className="ml-3 flex items-center gap-3 border-l border-[rgba(0,52,43,0.14)] pl-4">
            {!loading && user ? (
              <>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div
                    key="list-cta"
                    initial={{ opacity: 0, x: 10, scale: 0.98 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 8, scale: 0.98 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <CTAButton onClick={() => handleNavigate('/create')}>+ List Outfit</CTAButton>
                  </motion.div>
                </AnimatePresence>

                <ProfileDropdown
                  user={user}
                  onDashboard={handleDashboard}
                  onLogout={handleLogout}
                  open={profileDropdownOpen}
                  setOpen={setProfileDropdownOpen}
                  dropdownRef={profileDropdownRef}
                />
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNavigate('/login')}
                  className="text-sm font-semibold text-[#4A443D] transition-colors hover:text-[#00342B]"
                >
                  {loading ? '...' : 'Sign In'}
                </button>

                <AnimatePresence>
                  {hasPassedHeroSection && (
                    <motion.div
                      initial={{ opacity: 0, x: 12, scale: 0.98 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 8, scale: 0.98 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <CTAButton onClick={() => handleNavigate('/create')}>+ List Outfit</CTAButton>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>
        </motion.div>

        {/* ── Mobile: Sign In pill (shown when not logged in) ── */}
        <div className="flex items-center gap-3 lg:hidden">
          {!loading && !user && (
            <motion.button
              onClick={() => handleNavigate('/login')}
              whileTap={{ scale: 0.95 }}
              className="rounded-full border border-[rgba(212,175,55,0.4)] bg-[rgba(212,175,55,0.08)] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#8B7340]"
            >
              Sign In
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.nav>
  )
}

export default Navbar