import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { AiOutlineHome } from 'react-icons/ai'
import { MdImageSearch, MdOutlineShoppingCart } from 'react-icons/md'
import { CgProfile } from 'react-icons/cg'
import { FaPlus } from 'react-icons/fa6'

// ── Icons ─────────────────────────────────────────────────────────────────────

const HomeIcon = ({ active }) => (
  <AiOutlineHome size={22} className={active ? 'opacity-100' : 'opacity-90'} />
)

const CollectionIcon = ({ active }) => (
  <MdImageSearch size={22} className={active ? 'opacity-100' : 'opacity-90'} />
)

const PlusIcon = () => (
  <FaPlus size={20} color="white" />
)

const CartIcon = ({ active }) => (
  <MdOutlineShoppingCart size={22} className={active ? 'opacity-100' : 'opacity-90'} />
)

const ProfileIcon = ({ active }) => (
  <CgProfile size={22} className={active ? 'opacity-100' : 'opacity-90'} />
)

// ── Nav Item ─────────────────────────────────────────────────────────────────

const NavItem = ({ icon, label, to, active, onClick }) => {
  const content = (
    <motion.div
      className="flex flex-col items-center justify-center gap-1 relative py-1"
      whileTap={{ scale: 0.88 }}
      transition={{ duration: 0.15 }}
    >
      {/* Active indicator dot */}
      <AnimatePresence>
        {active && (
          <motion.div
            layoutId="bottom-nav-active"
            className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full"
            style={{ background: 'linear-gradient(90deg, #D4AF37, #C8622A)' }}
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          />
        )}
      </AnimatePresence>

      <motion.span
        animate={{ color: active ? '#00342B' : '#9A8F82' }}
        transition={{ duration: 0.2 }}
        className="flex items-center justify-center"
      >
        {icon}
      </motion.span>

      <motion.span
        animate={{
          color: active ? '#00342B' : '#9A8F82',
          fontWeight: active ? 700 : 500,
        }}
        transition={{ duration: 0.2 }}
        className="text-[9px] uppercase tracking-widest"
        style={{ fontFamily: 'Georgia, serif' }}
      >
        {label}
      </motion.span>
    </motion.div>
  )

  if (onClick) {
    return (
      <button onClick={onClick} className="flex-1 flex items-center justify-center focus:outline-none">
        {content}
      </button>
    )
  }

  return (
    <Link to={to} className="flex-1 flex items-center justify-center focus:outline-none">
      {content}
    </Link>
  )
}

// ── Main BottomNav ────────────────────────────────────────────────────────────

const BottomNav = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  const isActive = (path) => location.pathname === path

  const handleNavigate = (path) => {
    navigate(path)
    window.scrollTo(0, 0)
  }

  // Don't render on non-mobile (handled via CSS too, but keep logic clean)
  if (!mounted) return null

  return (
    <>
      {/* Bottom Nav Bar — mobile only */}
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden"
        style={{ willChange: 'transform' }}
      >
        {/* Frosted glass panel */}
        <div
          className="relative mx-3 mb-3 rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(251,248,243,0.97) 0%, rgba(247,241,231,0.95) 52%, rgba(239,228,212,0.93) 100%)',
            boxShadow: '0 -2px 20px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.12), 0 0 0 1px rgba(212,175,55,0.15)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {/* Gold top accent line */}
          <div className="h-px w-full bg-[linear-gradient(90deg,transparent,rgba(212,175,55,0.5),rgba(200,98,42,0.3),transparent)]" />

          <div className="flex items-center px-2 py-2 safe-area-inset-bottom">
            {/* Home */}
            <NavItem
              to="/"
              label="Home"
              active={isActive('/')}
              icon={<HomeIcon active={isActive('/')} />}
            />

            {/* Collection */}
            <NavItem
              to="/collection"
              label="Browse"
              active={isActive('/collection')}
              icon={<CollectionIcon active={isActive('/collection')} />}
            />

            {/* Create FAB */}
            <div className="flex-1 flex items-center justify-center">
              <motion.button
                onClick={() => handleNavigate('/create')}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.92 }}
                transition={{ duration: 0.18 }}
                className="relative flex h-12 w-12 items-center justify-center rounded-full focus:outline-none"
                style={{
                  background: 'linear-gradient(135deg, #00342B, #004D40)',
                  boxShadow: '0 4px 18px rgba(0,52,43,0.35), 0 0 0 1px rgba(212,175,55,0.25)',
                }}
                aria-label="Create listing"
              >
                <motion.span
                  animate={{ rotate: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-center justify-center"
                >
                  <PlusIcon />
                </motion.span>
                <motion.div
                  className="absolute inset-0 rounded-full border border-[#D4AF37]"
                  animate={{ scale: [1, 1.35], opacity: [0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                />
              </motion.button>
            </div>

            {/* Cart */}
            <NavItem
              to="/cart"
              label="Cart"
              active={isActive('/cart')}
              icon={<CartIcon active={isActive('/cart')} />}
            />

            {/* Profile / Dashboard */}
            <NavItem
              to="/dashboard"
              label="Profile"
              active={isActive('/dashboard')}
              icon={<ProfileIcon active={isActive('/dashboard')} />}
            />
          </div>
        </div>
      </motion.nav>

      {/* Spacer so page content doesn't hide behind nav — mobile only */}
      <div className="h-20 lg:hidden" aria-hidden="true" />
    </>
  )
}

export default BottomNav