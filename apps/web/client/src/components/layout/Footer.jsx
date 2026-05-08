import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { FiShare2, FiGlobe, FiInstagram, FiTwitter } from 'react-icons/fi'

// ─── Ambient Background ───────────────────────────────────────────────────────
function AmbientAccents() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Gold glow — top-right */}
      <motion.div
        animate={{ x: [0, -16, 8, 0], y: [0, 14, 4, 0], opacity: [0.2, 0.36, 0.26, 0.2] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-[20%] -right-[8%] rounded-full blur-3xl"
        style={{
          width: 'min(42vw, 520px)',
          height: 'min(42vw, 520px)',
          background: 'radial-gradient(circle, rgba(212,175,55,0.28) 0%, rgba(212,175,55,0.1) 42%, rgba(212,175,55,0) 72%)',
        }}
      />
      {/* Emerald glow — bottom-left */}
      <motion.div
        animate={{ x: [0, 18, -8, 0], y: [0, -12, -4, 0], opacity: [0.18, 0.32, 0.22, 0.18] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-[16%] -left-[6%] rounded-full blur-3xl"
        style={{
          width: 'min(36vw, 440px)',
          height: 'min(36vw, 440px)',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.04) 42%, rgba(255,255,255,0) 70%)',
        }}
      />
      {/* Fine white grid */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'linear-gradient(180deg, black 0%, black 70%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(180deg, black 0%, black 70%, transparent 100%)',
        }}
      />
      {/* Ambient dots */}
      {[
        { top: '18%', left: '24%', size: 6,  color: 'rgba(212,175,55,0.4)',  ring: 'rgba(212,175,55,0.1)',  dur: 6.2, delay: 0.4 },
        { top: '60%', left: '78%', size: 8,  color: 'rgba(255,255,255,0.15)', ring: 'rgba(255,255,255,0.04)', dur: 5.8, delay: 1.1 },
        { top: '40%', left: '58%', size: 5,  color: 'rgba(200,98,42,0.32)',  ring: 'rgba(200,98,42,0.08)',  dur: 7.4, delay: 0.7 },
      ].map((pt, i) => (
        <motion.div
          key={i}
          animate={{ scale: [1, 1.5, 1], opacity: [0.38, 0.8, 0.38] }}
          transition={{ duration: pt.dur, delay: pt.delay, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute rounded-full"
          style={{ top: pt.top, left: pt.left, width: pt.size, height: pt.size, background: pt.color, boxShadow: `0 0 0 6px ${pt.ring}` }}
        />
      ))}
    </div>
  )
}

// ─── Social Icon Button ───────────────────────────────────────────────────────
function SocialBtn({ icon, label, href }) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.a
      href={href || '#'}
      aria-label={label}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -2, scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      transition={{ duration: 0.22 }}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur-sm transition-colors"
      style={{ borderColor: hovered ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.2)', background: hovered ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.05)' }}
    >
      {icon}
    </motion.a>
  )
}

// ─── Footer Link ──────────────────────────────────────────────────────────────
function FooterLink({ label, href, to }) {
  const [hovered, setHovered] = useState(false)
  const cls = 'group relative flex items-center gap-2 text-sm text-white/55 transition-colors'

  const inner = (
    <>
      <motion.span
        animate={{ x: hovered ? 4 : 0, color: hovered ? '#D4AF37' : 'rgba(255,255,255,0.55)' }}
        transition={{ duration: 0.22 }}
        className="text-sm font-medium"
      >
        {label}
      </motion.span>
      <motion.div
        animate={{ scaleX: hovered ? 1 : 0, originX: 0 }}
        transition={{ duration: 0.28 }}
        className="absolute -bottom-0.5 left-0 h-px w-full bg-[linear-gradient(90deg,#D4AF37,transparent)]"
      />
    </>
  )

  if (to) {
    return (
      <Link to={to} className={cls} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
        {inner}
      </Link>
    )
  }
  return (
    <a href={href || '#'} className={cls} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {inner}
    </a>
  )
}

// ─── Main Footer ──────────────────────────────────────────────────────────────
const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden" style={{ background: '#001F1A' }}>
      <AmbientAccents />

      {/* Top gold accent line */}
      <div className="h-0.75 w-full bg-[linear-gradient(90deg,transparent,#D4AF37,#C8622A,rgba(200,98,42,0.3),transparent)]" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">

          {/* ── Brand Column ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-5 flex flex-col gap-6"
          >
            {/* Logo */}
            <div>
              <Link to="/" className="inline-flex items-center gap-3 group">
                <span
                  className="text-[28px] font-black tracking-tight text-white"
                  style={{ fontFamily: "'Georgia', serif" }}
                >
                  Listn<span className="text-[#D4AF37]">Rent</span>
                </span>
                <span className="rounded-full border border-[rgba(212,175,55,0.35)] bg-[rgba(212,175,55,0.1)] px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#D4AF37]">
                  Ethnic Wear
                </span>
              </Link>

              {/* Gold underline under logo */}
              <motion.div
                initial={{ scaleX: 0, originX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="mt-2 h-0.75 max-w-32 rounded-sm bg-[linear-gradient(90deg,#D4AF37,#C8622A,transparent)]"
              />
            </div>

            <p className="text-sm leading-relaxed text-white/50 max-w-xs">
              Mumbai's premier destination for luxury ethnic rentals. Celebrating tradition, embracing sustainability, one outfit at a time.
            </p>

            {/* Eyebrow tag */}
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[rgba(212,175,55,0.3)] bg-[rgba(212,175,55,0.08)] py-1 pl-2 pr-4">
              <span className="rounded-full bg-[#D4AF37] px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.15em] text-[#1A1A1A]">
                Mumbai
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#D4AF37]/70">
                The Curated Heritage
              </span>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-3 pt-1">
              <SocialBtn icon={<FiInstagram size={16} className="text-white/70" />} label="Instagram" />
              <SocialBtn icon={<FiTwitter size={16} className="text-white/70" />} label="Twitter" />
              <SocialBtn icon={<FiShare2 size={16} className="text-white/70" />} label="Share" />
              <SocialBtn icon={<FiGlobe size={16} className="text-white/70" />} label="Language" />
            </div>
          </motion.div>

          {/* ── Links Columns ── */}
          <div className="md:col-span-7 grid grid-cols-3 gap-8">
            {/* The Brand */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <h3 className="mb-5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#D4AF37]">
                The Brand
              </h3>
              <ul className="flex flex-col gap-3.5">
                <li><FooterLink label="Sustainability" href="#sustainability" /></li>
                <li><FooterLink label="Brand Story" href="#brand-story" /></li>
                <li><FooterLink label="Collection" to="/collection" /></li>
              </ul>
            </motion.div>

            {/* Support */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.18, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <h3 className="mb-5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#D4AF37]">
                Support
              </h3>
              <ul className="flex flex-col gap-3.5">
                <li><FooterLink label="Terms of Service" href="#terms" /></li>
                <li><FooterLink label="Privacy Policy" href="#privacy" /></li>
                <li><FooterLink label="Contact Us" href="#contact" /></li>
              </ul>
            </motion.div>

            {/* Explore */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.26, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <h3 className="mb-5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#D4AF37]">
                Explore
              </h3>
              <ul className="flex flex-col gap-3.5">
                <li><FooterLink label="Weddings" to="/collection?occasion=Wedding" /></li>
                <li><FooterLink label="Parties" to="/collection?occasion=Parties" /></li>
                <li><FooterLink label="Festivals" to="/collection?occasion=Festivals" /></li>
                <li><FooterLink label="List Outfit" to="/create" /></li>
              </ul>
            </motion.div>
          </div>
        </div>

        {/* ── Bottom strip ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-14 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/8 pt-8"
        >
          <p className="text-xs text-white/35 tracking-wide">
            © {currentYear} ListnRent Mumbai. The Curated Heritage.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-5 md:gap-8">
            {[
              { icon: '🏆', label: "Mumbai's #1 Ethnic Rental" },
              { icon: '🌿', label: '100% Sustainable' },
              { icon: '⭐', label: '4.9 / 5 Rating' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="text-[#D4AF37] text-xs">{item.icon}</span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer