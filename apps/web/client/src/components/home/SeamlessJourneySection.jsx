import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'

// ─── Ambient Background ───────────────────────────────────────────────────────
function AmbientAccents() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Emerald glow — top-right */}
      <motion.div
        animate={{ x: [0, -20, 10, 0], y: [0, 18, 6, 0], opacity: [0.36, 0.54, 0.42, 0.36] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-[14%] -right-[8%] rounded-full blur-[56px]"
        style={{
          width: 'min(44vw, 540px)',
          height: 'min(44vw, 540px)',
          background:
            'radial-gradient(circle, rgba(0,52,43,0.16) 0%, rgba(0,52,43,0.07) 42%, rgba(0,52,43,0) 72%)',
        }}
      />

      {/* Gold glow — bottom-left */}
      <motion.div
        animate={{ x: [0, 16, -8, 0], y: [0, -12, -4, 0], opacity: [0.3, 0.5, 0.36, 0.3] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-[12%] -left-[6%] rounded-full blur-[56px]"
        style={{
          width: 'min(38vw, 480px)',
          height: 'min(38vw, 480px)',
          background:
            'radial-gradient(circle, rgba(212,175,55,0.2) 0%, rgba(212,175,55,0.08) 40%, rgba(212,175,55,0) 70%)',
        }}
      />

      {/* Terracotta mid */}
      <motion.div
        animate={{ x: [0, 12, -14, 0], y: [0, -10, 8, 0], opacity: [0.18, 0.32, 0.22, 0.18] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[40%] left-[40%] rounded-full blur-[44px]"
        style={{
          width: 'min(30vw, 360px)',
          height: 'min(30vw, 360px)',
          background:
            'radial-gradient(circle, rgba(200,98,42,0.12) 0%, rgba(200,98,42,0.05) 40%, rgba(200,98,42,0) 70%)',
        }}
      />

      {/* Fine grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
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

      {/* Horizontal light beam */}
      <motion.div
        animate={{ opacity: [0.14, 0.32, 0.14] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="pointer-events-none absolute"
        style={{
          top: '50%',
          left: '6%',
          width: 'min(55vw, 700px)',
          height: 'min(9vw, 110px)',
          borderRadius: 999,
          background:
            'linear-gradient(90deg, rgba(212,175,55,0), rgba(212,175,55,0.14), rgba(255,255,255,0.44), rgba(200,98,42,0.1), rgba(212,175,55,0))',
          filter: 'blur(6px)',
          transform: 'rotate(-6deg)',
        }}
      />

      {/* Ambient dots */}
      {[
        { top: '14%', left: '22%', size: 7,  color: 'rgba(212,175,55,0.3)',  ring: 'rgba(212,175,55,0.07)', dur: 6.1, delay: 0.3 },
        { top: '76%', left: '74%', size: 9,  color: 'rgba(0,52,43,0.22)',    ring: 'rgba(0,52,43,0.05)',    dur: 5.7, delay: 1.2 },
        { top: '38%', left: '88%', size: 6,  color: 'rgba(200,98,42,0.26)',  ring: 'rgba(200,98,42,0.07)', dur: 7.3, delay: 0.8 },
        { top: '62%', left: '10%', size: 8,  color: 'rgba(212,175,55,0.24)', ring: 'rgba(212,175,55,0.06)', dur: 6.6, delay: 1.5 },
      ].map((pt, i) => (
        <motion.div
          key={i}
          animate={{ scale: [1, 1.45, 1], opacity: [0.42, 0.88, 0.42] }}
          transition={{ duration: pt.dur, delay: pt.delay, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute rounded-full"
          style={{
            top: pt.top, left: pt.left,
            width: pt.size, height: pt.size,
            background: pt.color,
            boxShadow: `0 0 0 7px ${pt.ring}`,
          }}
        />
      ))}
    </div>
  )
}

// ─── Connector line between steps ─────────────────────────────────────────────
function ConnectorLine({ index, total }) {
  if (index >= total - 1) return null
  return (
    <div className="hidden lg:flex absolute top-13t-[calc(50%+52px)] right-[calc(-50%+52px)] items-center z-0">
      <motion.div
        initial={{ scaleX: 0, originX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 + index * 0.18, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="h-px w-full bg-[linear-gradient(90deg,#D4AF37,rgba(212,175,55,0.2),transparent)]"
      />
      <motion.div
        initial={{ opacity: 0, x: -4 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.9 + index * 0.18, duration: 0.4 }}
        className="absolute right-0 text-[#D4AF37] text-xs font-bold"
      >
        ›
      </motion.div>
    </div>
  )
}

// ─── Single Step Card ──────────────────────────────────────────────────────────
function StepCard({ step, index }) {
  const [hovered, setHovered] = useState(false)

  const accentColors = [
    { from: '#00342B', to: '#00695C', glow: 'rgba(0,52,43,0.28)' },
    { from: '#8B4513', to: '#A0522D', glow: 'rgba(139,69,19,0.28)' },
    { from: '#C8622A', to: '#D4763E', glow: 'rgba(200,98,42,0.28)' },
    { from: '#8B7340', to: '#D4AF37', glow: 'rgba(212,175,55,0.28)' },
  ]
  const accent = accentColors[index % accentColors.length]

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-32px' }}
      transition={{ delay: index * 0.13, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="relative flex flex-col items-center text-center"
    >
      {/* Icon orb */}
      <div className="relative mb-6 z-10">
        {/* Glow halo */}
        <motion.div
          animate={{ scale: hovered ? 1.5 : 1, opacity: hovered ? 0.6 : 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 rounded-full blur-[18px]"
          style={{ background: accent.glow }}
        />

        {/* Outer ring */}
        <motion.div
          animate={{ scale: hovered ? 1.12 : 1, opacity: hovered ? 1 : 0.4 }}
          transition={{ duration: 0.35 }}
          className="absolute -inset-3 rounded-full border border-[rgba(212,175,55,0.35)]"
        />

        {/* Step number badge */}
        <motion.div
          animate={{ scale: hovered ? 1.08 : 1 }}
          transition={{ duration: 0.3 }}
          className="relative flex h-18 w-18 items-center justify-center rounded-full text-3xl shadow-[0_8px_28px_rgba(0,0,0,0.18)]"
          style={{
            background: `linear-gradient(135deg, ${accent.from}, ${accent.to})`,
            boxShadow: hovered
              ? `0 12px 36px ${accent.glow}`
              : `0 8px 24px rgba(0,0,0,0.15)`,
          }}
        >
          {step.icon}

          {/* Inner shimmer sweep */}
          <motion.div
            animate={{ x: hovered ? '200%' : '-100%' }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 rounded-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)] w-[60%] -skew-x-12"
          />
        </motion.div>

        {/* Step index dot */}
        <div
          className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-extrabold text-[#1A1A1A]"
          style={{ background: '#D4AF37' }}
        >
          {step.id}
        </div>
      </div>

      {/* Card body */}
      {step.link ? (
        <Link
          to={step.link}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="block w-full rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2"
          aria-label={step.title}
        >
          <motion.div
            animate={{
              borderColor: hovered ? 'rgba(212,175,55,0.4)' : 'rgba(232,224,213,0.6)',
              boxShadow: hovered
                ? '0 16px 48px rgba(0,0,0,0.1), 0 0 0 1px rgba(212,175,55,0.2)'
                : '0 4px 16px rgba(0,0,0,0.05)',
            }}
            transition={{ duration: 0.3 }}
            className="relative w-full rounded-2xl border bg-white/70 px-6 py-6 backdrop-blur-sm"
          >
            {/* Corner accent */}
            <motion.div
              animate={{ scaleX: hovered ? 1 : 0, originX: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="absolute bottom-0 left-0 h-0.5 w-full rounded-b-2xl bg-[linear-gradient(90deg,#D4AF37,#C8622A,transparent)]"
            />

            <h3
              className="mb-2 text-lg font-black text-[#1A1A1A] leading-tight"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              {step.title}
            </h3>
            <p className="text-sm leading-relaxed text-[#777]">{step.description}</p>

            {/* Hover CTA hint */}
            <motion.div
              animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 6 }}
              transition={{ duration: 0.25 }}
              className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest"
              style={{ color: accent.from }}
            >
              <span
                className="h-px w-4 rounded-full"
                style={{ background: accent.from }}
              />
              {step.cta}
            </motion.div>
          </motion.div>
        </Link>
      ) : (
        <motion.div
          animate={{
            borderColor: hovered ? 'rgba(212,175,55,0.4)' : 'rgba(232,224,213,0.6)',
            boxShadow: hovered
              ? '0 16px 48px rgba(0,0,0,0.1), 0 0 0 1px rgba(212,175,55,0.2)'
              : '0 4px 16px rgba(0,0,0,0.05)',
          }}
          transition={{ duration: 0.3 }}
          className="relative w-full rounded-2xl border bg-white/70 px-6 py-6 backdrop-blur-sm"
        >
        {/* Corner accent */}
        <motion.div
          animate={{ scaleX: hovered ? 1 : 0, originX: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute bottom-0 left-0 h-0.5 w-full rounded-b-2xl bg-[linear-gradient(90deg,#D4AF37,#C8622A,transparent)]"
        />

        <h3
          className="mb-2 text-lg font-black text-[#1A1A1A] leading-tight"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          {step.title}
        </h3>
        <p className="text-sm leading-relaxed text-[#777]">{step.description}</p>

        {/* Hover CTA hint */}
        <motion.div
          animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 6 }}
          transition={{ duration: 0.25 }}
          className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest"
          style={{ color: accent.from }}
        >
          <span
            className="h-px w-4 rounded-full"
            style={{ background: accent.from }}
          />
          {step.cta}
        </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}

// ─── Main Section ─────────────────────────────────────────────────────────────
const SeamlessJourneySection = () => {
  const steps = [
    {
      id: 1,
      icon: '📤',
      title: 'Share',
      description: 'Upload your curated wardrobe pieces with style — add photos, set your price, and go live in minutes.',
      cta: 'List an outfit',
      link: '/create',
    },
    {
      id: 2,
      icon: '🔍',
      title: 'Discover',
      description: 'Explore exquisite designer looks curated by the best in town — filtered by occasion, size & location.',
      cta: 'Browse collection',
      link: '/collection',
    },
    {
      id: 3,
      icon: '🎀',
      title: 'Rent',
      description: 'Select your dates and get high-quality garments delivered straight to your door.',
      cta: 'Rent now',
      link: '/collection',
    },
    {
      id: 4,
      icon: '↩️',
      title: 'Return',
      description: 'Hassle-free returns with dry cleaning included — send it back and we handle the rest.',
      cta: 'Learn more',
    },
  ]

  return (
    <section className="relative overflow-hidden bg-[#FAF7F2] py-20 px-6">
      <AmbientAccents />

      <div className="relative z-10 max-w-6xl mx-auto">

        {/* ── Section Header ── */}
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
              How It Works
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8B7340]">
              Simple, Elegant, Effortless
            </span>
          </div>

          <h2
            className="text-3xl md:text-4xl font-black text-[#1A1A1A] leading-[1.1]"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            A Seamless Journey
          </h2>

          {/* Gold underline */}
          <motion.div
            initial={{ scaleX: 0, originX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mt-2 h-0.75 max-w-44 rounded-sm bg-[linear-gradient(90deg,#D4AF37,#C8622A,transparent)]"
          />

          <p className="mt-3 text-[14px] text-[#888] hidden md:block tracking-wide">
            Accessing luxury should be as effortless as wearing it.
          </p>
        </motion.div>

        {/* ── Steps Grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {steps.map((step, index) => (
            <div key={step.id} className="relative">
              <ConnectorLine index={index} total={steps.length} />
              <StepCard step={step} index={index} />
            </div>
          ))}
        </div>

        {/* ── Bottom accent strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-14 flex flex-wrap justify-center gap-6 md:gap-10 pt-8 border-t border-[rgba(212,175,55,0.2)]"
        >
          {[
            { icon: '⚡', label: 'Same-Day Mumbai Delivery' },
            { icon: '🌿', label: '100% Sustainable Fashion' },
            { icon: '🔒', label: 'Secure & Verified' },
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

export default SeamlessJourneySection