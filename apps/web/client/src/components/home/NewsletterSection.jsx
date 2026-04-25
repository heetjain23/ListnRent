import React, { useState } from 'react'
import { motion } from 'motion/react'

// ─── Ambient Background ───────────────────────────────────────────────────────
function AmbientAccents() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Emerald glow — top-left */}
      <motion.div
        animate={{ x: [0, 24, -10, 0], y: [0, 16, 6, 0], opacity: [0.22, 0.38, 0.28, 0.22] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-[16%] -left-[8%] rounded-full blur-[60px]"
        style={{
          width: 'min(46vw, 560px)',
          height: 'min(46vw, 560px)',
          background:
            'radial-gradient(circle, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 42%, rgba(255,255,255,0) 72%)',
        }}
      />

      {/* Gold glow — bottom-right */}
      <motion.div
        animate={{ x: [0, -18, 8, 0], y: [0, -14, -4, 0], opacity: [0.28, 0.46, 0.34, 0.28] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-[12%] -right-[6%] rounded-full blur-[60px]"
        style={{
          width: 'min(40vw, 500px)',
          height: 'min(40vw, 500px)',
          background:
            'radial-gradient(circle, rgba(212,175,55,0.3) 0%, rgba(212,175,55,0.12) 38%, rgba(212,175,55,0) 70%)',
        }}
      />

      {/* Terracotta mid accent */}
      <motion.div
        animate={{ x: [0, 14, -16, 0], y: [0, -12, 10, 0], opacity: [0.16, 0.28, 0.2, 0.16] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[38%] left-[38%] rounded-full blur-[48px]"
        style={{
          width: 'min(28vw, 340px)',
          height: 'min(28vw, 340px)',
          background:
            'radial-gradient(circle, rgba(200,98,42,0.22) 0%, rgba(200,98,42,0.08) 42%, rgba(200,98,42,0) 70%)',
        }}
      />

      {/* Fine grid overlay — white tint on dark bg */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage:
            'linear-gradient(180deg, transparent 0%, black 14%, black 86%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(180deg, transparent 0%, black 14%, black 86%, transparent 100%)',
        }}
      />

      {/* Horizontal light beam */}
      <motion.div
        animate={{ opacity: [0.12, 0.28, 0.12] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
        className="pointer-events-none absolute"
        style={{
          top: '48%',
          left: '4%',
          width: 'min(58vw, 720px)',
          height: 'min(9vw, 110px)',
          borderRadius: 999,
          background:
            'linear-gradient(90deg, rgba(212,175,55,0), rgba(212,175,55,0.22), rgba(255,255,255,0.3), rgba(200,98,42,0.14), rgba(212,175,55,0))',
          filter: 'blur(7px)',
          transform: 'rotate(-5deg)',
        }}
      />

      {/* Ambient dots */}
      {[
        { top: '12%', left: '72%', size: 7,  color: 'rgba(212,175,55,0.5)',  ring: 'rgba(212,175,55,0.12)', dur: 6.1, delay: 0.3 },
        { top: '78%', left: '16%', size: 9,  color: 'rgba(255,255,255,0.2)', ring: 'rgba(255,255,255,0.05)', dur: 5.7, delay: 1.2 },
        { top: '34%', left: '88%', size: 6,  color: 'rgba(200,98,42,0.4)',   ring: 'rgba(200,98,42,0.1)',   dur: 7.3, delay: 0.8 },
        { top: '64%', left: '8%',  size: 8,  color: 'rgba(212,175,55,0.36)', ring: 'rgba(212,175,55,0.09)', dur: 6.6, delay: 1.5 },
      ].map((pt, i) => (
        <motion.div
          key={i}
          animate={{ scale: [1, 1.45, 1], opacity: [0.42, 0.9, 0.42] }}
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

// ─── Feature Row ──────────────────────────────────────────────────────────────
function FeatureItem({ icon, title, description, index }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2 + index * 0.14, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="flex items-start gap-4 group"
    >
      {/* Icon orb */}
      <motion.div
        animate={{ scale: hovered ? 1.12 : 1, boxShadow: hovered ? '0 8px 28px rgba(212,175,55,0.3)' : '0 4px 14px rgba(0,0,0,0.2)' }}
        transition={{ duration: 0.3 }}
        className="shrink-0 flex h-12 w-12 items-center justify-center rounded-full text-2xl"
        style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.08))', border: '1px solid rgba(212,175,55,0.35)' }}
      >
        {icon}
      </motion.div>

      <div>
        <h3 className="text-lg font-bold text-white mb-1.5" style={{ fontFamily: "'Georgia', serif" }}>
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-white/65">{description}</p>
        {/* Hover underline */}
        <motion.div
          animate={{ scaleX: hovered ? 1 : 0, originX: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mt-2 h-px w-20 bg-[linear-gradient(90deg,#D4AF37,transparent)]"
        />
      </div>
    </motion.div>
  )
}

// ─── Main Section ─────────────────────────────────────────────────────────────
const NewsletterSection = () => {
  const [email, setEmail]       = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage]   = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [focused, setFocused]   = useState(false)

  const handleSubscribe = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'
      const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl
      const response = await fetch(`${baseUrl}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'include',
      })

      const data = await response.json()

      if (data.success) {
        setIsSuccess(true)
        setMessage('Successfully subscribed to our newsletter!')
        setEmail('')
        setTimeout(() => { setMessage(''); setIsSuccess(false) }, 3000)
      } else {
        setIsSuccess(false)
        setMessage(data.message || 'Failed to subscribe. Please try again.')
      }
    } catch {
      setIsSuccess(false)
      setMessage('An error occurred. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    {
      icon: '🌿',
      title: 'Sustainability at Core',
      description: 'By choosing to rent, you participate in a circular fashion economy — reducing waste and the environmental impact of one-time wear pieces.',
    },
    {
      icon: '✓',
      title: 'Verified Heritage',
      description: 'Every piece on ListnRent undergoes rigorous authentication and quality checks. We ensure your luxury experience is flawless.',
    },
  ]

  return (
    <section className="relative overflow-hidden py-20 px-6" style={{ background: '#00342B' }}>
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
          <div className="inline-flex items-center gap-2 mb-3 rounded-full border border-[rgba(212,175,55,0.35)] bg-[rgba(212,175,55,0.1)] py-1 pl-2 pr-4">
            <span className="rounded-full bg-[#D4AF37] px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#1A1A1A]">
              Atelier
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#D4AF37]/80">
              Join the Inner Circle
            </span>
          </div>

          <h2
            className="text-3xl md:text-5xl font-black text-white leading-[1.08]"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            Elegance with a<br />Conscience.
          </h2>

          {/* Gold underline */}
          <motion.div
            initial={{ scaleX: 0, originX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mt-3 h-0.75 max-w-44 rounded-sm bg-[linear-gradient(90deg,#D4AF37,#C8622A,transparent)]"
          />
        </motion.div>

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

          {/* Left — features */}
          <div className="flex flex-col gap-10">
            {features.map((f, i) => (
              <FeatureItem key={i} {...f} index={i} />
            ))}

            {/* Social proof strip */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.55, duration: 0.55 }}
              className="flex flex-wrap gap-6 pt-6 border-t border-white/10"
            >
              {[
                { icon: '⭐', label: '4.9 / 5 Rating' },
                { icon: '👗', label: '120+ Outfits' },
                { icon: '🏆', label: "Mumbai's #1" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[#D4AF37] text-sm">{item.icon}</span>
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-white/50">
                    {item.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — form card */}
          <motion.div
            initial={{ opacity: 0, x: 28, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ delay: 0.25, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, rgba(250,247,242,0.97) 0%, rgba(245,239,230,0.96) 100%)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.28), 0 0 0 1px rgba(212,175,55,0.2)',
            }}
          >
            {/* Card top accent line */}
            <div className="h-0.75 w-full bg-[linear-gradient(90deg,#D4AF37,#C8622A,rgba(200,98,42,0.3),transparent)]" />

            {/* Gold shimmer on card */}
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 4 }}
              className="absolute inset-0 -skew-x-12 bg-[linear-gradient(90deg,transparent,rgba(212,175,55,0.06),transparent)] w-[50%] pointer-events-none"
            />

            <div className="p-8 md:p-10">
              <h3
                className="text-2xl font-extrabold text-[#00342B] mb-2"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                Join the Atelier
              </h3>
              <p className="text-[#666] text-sm leading-relaxed mb-8">
                Get exclusive early access to new designer drops, sustainable styling tips, and members-only offers.
              </p>

              <form onSubmit={handleSubscribe} className="flex flex-col gap-4">
                {/* Input */}
                <motion.div
                  animate={{
                    boxShadow: focused
                      ? '0 0 0 3px rgba(0,52,43,0.15), 0 4px 16px rgba(0,52,43,0.1)'
                      : '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                  transition={{ duration: 0.25 }}
                  className="relative rounded-xl overflow-hidden border border-[#E8E0D5] bg-white"
                >
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    required
                    className="w-full px-4 py-3.5 text-sm text-[#1A1A1A] placeholder-[#AAA] bg-transparent outline-none"
                  />
                  {/* Focus accent line */}
                  <motion.div
                    animate={{ scaleX: focused ? 1 : 0, originX: 0 }}
                    transition={{ duration: 0.35 }}
                    className="absolute bottom-0 left-0 h-0.5 w-full bg-[linear-gradient(90deg,#00342B,#D4AF37)]"
                  />
                </motion.div>

                {/* Submit button */}
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="relative overflow-hidden rounded-xl bg-[#00342B] py-3.5 text-sm font-bold tracking-[0.08em] text-[#FAF7F2] shadow-[0_8px_28px_rgba(0,52,43,0.28)] disabled:opacity-50"
                >
                  <span className="relative z-10">
                    {isLoading ? 'Subscribing...' : 'SUBSCRIBE →'}
                  </span>
                  {/* Shimmer on button */}
                  <motion.div
                    className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(212,175,55,0.18),transparent)]"
                    style={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.5 }}
                  />
                </motion.button>

                {/* Status message */}
                {message && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-center text-sm font-medium ${isSuccess ? 'text-[#00342B]' : 'text-red-600'}`}
                  >
                    {isSuccess ? '✓ ' : '⚠ '}{message}
                  </motion.p>
                )}
              </form>

              {/* Trust note */}
              <p className="mt-6 text-center text-[11px] text-[#AAA] tracking-wide">
                No spam, ever. Unsubscribe anytime.
              </p>
            </div>
          </motion.div>
        </div>

        {/* ── Bottom accent strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-14 flex flex-wrap justify-center gap-6 md:gap-10 pt-8 border-t border-white/10"
        >
          {[
            { icon: '🌿', label: '100% Sustainable Fashion' },
            { icon: '✨', label: 'Exclusive Designer Drops' },
            { icon: '💌', label: 'Members-Only Offers' },
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
              <span className="text-[12px] font-semibold uppercase tracking-widest text-white/40">
                {item.label}
              </span>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}

export default NewsletterSection