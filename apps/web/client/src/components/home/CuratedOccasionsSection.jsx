import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { CLOUDINARY_IMAGES } from '../../constants/imageConstants'

// ─── Ambient Background (mirrors HeroSection & TrendingNowSection) ────────────
function AmbientAccents() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Emerald glow — top-left */}
      <motion.div
        animate={{ x: [0, 22, -10, 0], y: [0, 16, 6, 0], opacity: [0.38, 0.58, 0.44, 0.38] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-[12%] -left-[8%] rounded-full blur-[52px]"
        style={{
          width: 'min(42vw, 520px)',
          height: 'min(42vw, 520px)',
          background:
            'radial-gradient(circle, rgba(0,52,43,0.18) 0%, rgba(0,52,43,0.08) 40%, rgba(0,52,43,0) 72%)',
        }}
      />

      {/* Gold glow — bottom-right */}
      <motion.div
        animate={{ x: [0, -18, 8, 0], y: [0, -14, -4, 0], opacity: [0.32, 0.52, 0.38, 0.32] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-[10%] -right-[6%] rounded-full blur-[52px]"
        style={{
          width: 'min(36vw, 460px)',
          height: 'min(36vw, 460px)',
          background:
            'radial-gradient(circle, rgba(212,175,55,0.22) 0%, rgba(212,175,55,0.1) 38%, rgba(212,175,55,0) 70%)',
        }}
      />

      {/* Terracotta mid accent */}
      <motion.div
        animate={{ x: [0, 14, -16, 0], y: [0, -12, 10, 0], opacity: [0.22, 0.36, 0.26, 0.22] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[35%] left-[30%] rounded-full blur-2xl"
        style={{
          width: 'min(28vw, 340px)',
          height: 'min(28vw, 340px)',
          background:
            'radial-gradient(circle, rgba(200,98,42,0.14) 0%, rgba(200,98,42,0.06) 40%, rgba(200,98,42,0) 70%)',
        }}
      />

      {/* Fine grid overlay — same mask as TrendingNow */}
      <div
        className="absolute inset-0 opacity-[0.032]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,52,43,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,52,43,1) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage:
            'linear-gradient(180deg, transparent 0%, black 14%, black 86%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(180deg, transparent 0%, black 14%, black 86%, transparent 100%)',
        }}
      />

      {/* Floating light beam */}
      <motion.div
        animate={{ opacity: [0.18, 0.38, 0.18] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute"
        style={{
          top: '44%',
          left: '12%',
          width: 'min(50vw, 640px)',
          height: 'min(10vw, 120px)',
          borderRadius: 999,
          background:
            'linear-gradient(90deg, rgba(212,175,55,0), rgba(212,175,55,0.16), rgba(255,255,255,0.48), rgba(200,98,42,0.12), rgba(212,175,55,0))',
          filter: 'blur(6px)',
          transform: 'rotate(-8deg)',
        }}
      />

      {/* Ambient dots */}
      {[
        { top: '16%', left: '68%', size: 7, color: 'rgba(212,175,55,0.32)', ring: 'rgba(212,175,55,0.08)', dur: 6.2, delay: 0.4 },
        { top: '72%', left: '18%', size: 9, color: 'rgba(0,52,43,0.24)', ring: 'rgba(0,52,43,0.06)', dur: 5.8, delay: 1.1 },
        { top: '52%', left: '82%', size: 6, color: 'rgba(200,98,42,0.28)', ring: 'rgba(200,98,42,0.07)', dur: 7.1, delay: 0.7 },
      ].map((pt, i) => (
        <motion.div
          key={i}
          animate={{ scale: [1, 1.4, 1], opacity: [0.44, 0.88, 0.44] }}
          transition={{ duration: pt.dur, delay: pt.delay, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute rounded-full"
          style={{
            top: pt.top,
            left: pt.left,
            width: pt.size,
            height: pt.size,
            background: pt.color,
            boxShadow: `0 0 0 7px ${pt.ring}`,
          }}
        />
      ))}
    </div>
  )
}

// ─── Magnetic 3-D tilt card wrapper ──────────────────────────────────────────
function TiltOccasionCard({ children, className, style, link }) {
  const rotX = useSpring(0, { stiffness: 200, damping: 24 })
  const rotY = useSpring(0, { stiffness: 200, damping: 24 })
  const scl  = useSpring(1, { stiffness: 200, damping: 24 })

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width  - 0.5
    const y = (e.clientY - rect.top)  / rect.height - 0.5
    rotX.set(-y * 10)
    rotY.set(x  * 10)
    scl.set(1.025)
  }
  const handleLeave = () => { rotX.set(0); rotY.set(0); scl.set(1) }

  return (
    <motion.div
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ rotateX: rotX, rotateY: rotY, scale: scl, transformStyle: 'preserve-3d', perspective: 900, ...style }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Single Occasion Card ────────────────────────────────────────────────────
function OccasionCard({ occasion, index }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.12, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
    >
      <TiltOccasionCard>
        <Link
          to={occasion.link}
          className="group relative block overflow-hidden rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.14)]"
          style={{ height: 'clamp(280px, 36vw, 440px)' }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          aria-label={occasion.title}
        >
          {/* Background image */}
          <motion.div
            animate={{ scale: hovered ? 1.08 : 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${occasion.bgImage}')` }}
          />

          {/* Base scrim */}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.15)_40%,rgba(0,0,0,0.72)_100%)]" />

          {/* Hover colour wash */}
          <motion.div
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0"
            style={{ background: `linear-gradient(160deg, ${occasion.accentColor}22 0%, transparent 60%)` }}
          />

          {/* Gold shimmer sweep */}
          <motion.div
            animate={{ x: hovered ? '200%' : '-100%' }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 -skew-x-12 bg-[linear-gradient(90deg,transparent,rgba(212,175,55,0.18),transparent)] w-[60%]"
          />

          {/* Top badge */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
            className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full border border-[rgba(212,175,55,0.4)] bg-black/30 py-1 pl-2 pr-3 backdrop-blur-sm"
          >
            <span className="rounded-full bg-[#D4AF37] px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.15em] text-[#1A1A1A]">
              Featured
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/80">
              {occasion.tag}
            </span>
          </motion.div>

          {/* Arrow indicator */}
          <motion.div
            animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : 6 }}
            transition={{ duration: 0.25 }}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/40 bg-white/20 text-white backdrop-blur-sm"
          >
            →
          </motion.div>

          {/* Bottom content */}
          <div className="absolute inset-x-0 bottom-0 z-10 p-6">
            {/* Icon */}
            <motion.div
              animate={{ y: hovered ? -4 : 0 }}
              transition={{ duration: 0.3 }}
              className="mb-3 text-4xl"
            >
              {occasion.icon}
            </motion.div>

            {/* Title */}
            <h3
              className="mb-1 text-2xl font-black leading-[1.1] text-white"
              style={{ fontFamily: "'Georgia', serif", textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}
            >
              {occasion.title}
            </h3>

            {/* Subtitle */}
            <p className="mb-4 text-sm font-medium text-white/80">{occasion.subtitle}</p>

            {/* CTA pill */}
            <motion.div
              animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 8 }}
              transition={{ duration: 0.28 }}
              className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37] bg-[rgba(212,175,55,0.18)] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#D4AF37] backdrop-blur-sm"
            >
              Browse Collection
              <span>→</span>
            </motion.div>
          </div>

          {/* Corner accent line */}
          <motion.div
            animate={{ scaleX: hovered ? 1 : 0, originX: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-0 left-0 h-0.5 w-full bg-[linear-gradient(90deg,#D4AF37,#C8622A,transparent)]"
          />
        </Link>
      </TiltOccasionCard>
    </motion.div>
  )
}

// ─── Main Section ─────────────────────────────────────────────────────────────
const CuratedOccasionsSection = () => {
  const occasionsData = [
    {
      id: 'weddings',
      title: 'Weddings',
      subtitle: 'Glamorous looks for the big day',
      tag: 'Bridal & Groom',
      icon: '💍',
      bgImage: CLOUDINARY_IMAGES.WEDDING,
      link: '/collection?occasion=Wedding',
      accentColor: '#8B4513',
    },
    {
      id: 'parties',
      title: 'Parties',
      subtitle: 'Chic looks & cocktail wear',
      tag: 'Evening Glam',
      icon: '🎉',
      bgImage: CLOUDINARY_IMAGES.PARTIES,
      link: '/collection?occasion=Parties',
      accentColor: '#00342B',
    },
    {
      id: 'festivals',
      title: 'Festivals',
      subtitle: 'Vibrant looks you need',
      tag: 'Cultural Wear',
      icon: '✨',
      bgImage: CLOUDINARY_IMAGES.FESTIVALS,
      link: '/collection?occasion=Festivals',
      accentColor: '#C8622A',
    },
  ]

  return (
    <section className="relative overflow-hidden bg-[#FDFAF7] py-20 px-6">
      <AmbientAccents />

      <div className="relative z-10 max-w-6xl mx-auto">

        {/* ── Section Header — mirrors TrendingNow ── */}
        <motion.div
          initial={{ opacity: 0, x: -28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14"
        >
          {/* Eyebrow tag */}
          <div className="inline-flex items-center gap-2 mb-3 rounded-full border border-[rgba(212,175,55,0.3)] bg-[rgba(212,175,55,0.08)] py-1 pl-2 pr-4">
            <span className="rounded-full bg-[#D4AF37] px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#1A1A1A]">
              Curated
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8B7340]">
              Dressed for Every Celebration
            </span>
          </div>

          <h2
            className="text-3xl md:text-4xl font-black text-[#1A1A1A] leading-[1.1]"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            Curated Occasions
          </h2>

          {/* Gold underline — exact match to hero */}
          <motion.div
            initial={{ scaleX: 0, originX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mt-2 h-0.75 max-w-40 rounded-sm bg-[linear-gradient(90deg,#D4AF37,#C8622A,transparent)]"
          />

          <p className="mt-3 text-[14px] text-[#888] hidden md:block tracking-wide">
            Find the perfect silhouette for every celebration.
          </p>
        </motion.div>

        {/* ── Cards Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {occasionsData.map((occasion, index) => (
            <OccasionCard key={occasion.id} occasion={occasion} index={index} />
          ))}
        </div>

        {/* ── Bottom accent strip — mirrors TrendingNow ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-14 flex flex-wrap justify-center gap-6 md:gap-10 pt-8 border-t border-[rgba(212,175,55,0.2)]"
        >
          {[
            { icon: '👗', label: '3 Curated Occasions' },
            { icon: '🌿', label: 'Sustainable Fashion' },
            { icon: '✨', label: 'Premium Ethnic Wear' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.55 + i * 0.08 }}
              className="flex items-center gap-2"
            >
              <span className="text-base text-[#D4AF37]">{item.icon}</span>
              <span className="text-[12px] font-semibold uppercase tracking-widest text-[#888]">
                {item.label}
              </span>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}

export default CuratedOccasionsSection