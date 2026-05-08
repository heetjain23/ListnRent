import React, { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { createPortal } from 'react-dom'
import { getOptimizedImageUrl } from '../../services/cloudinary'

// ─── Lightbox ─────────────────────────────────────────────────────────────────
const Lightbox = ({ images, startIndex, onClose }) => {
  const [current, setCurrent] = useState(startIndex)

  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length)
  const next = () => setCurrent((c) => (c + 1) % images.length)

  // Keyboard nav
  React.useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft')  prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape')     onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  React.useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  if (typeof document === 'undefined') return null

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="fixed inset-0 z-100 flex flex-col items-center justify-center"
      style={{ backgroundColor: 'rgba(10,14,12,0.94)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full text-white/70 hover:text-white transition-colors"
        style={{ backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
      >
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Counter */}
      <div
        className="absolute top-4 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full"
        style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.15)' }}
      >
        {current + 1} / {images.length}
      </div>

      {/* Main image */}
      <motion.div
        className="relative flex items-center justify-center w-full h-full px-16"
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={getOptimizedImageUrl(images[current], { width: 900, height: 1200, quality: 'auto' })}
            alt={`Image ${current + 1}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="max-h-[80vh] max-w-full object-contain rounded-2xl select-none"
            style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}
            draggable={false}
          />
        </AnimatePresence>

        {/* Prev / Next */}
        {images.length > 1 && (
          <>
            <motion.button
              onClick={prev}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              className="absolute left-3 md:left-6 w-10 h-10 flex items-center justify-center rounded-full text-white transition-colors"
              style={{ backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>
            <motion.button
              onClick={next}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              className="absolute right-3 md:right-6 w-10 h-10 flex items-center justify-center rounded-full text-white transition-colors"
              style={{ backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          </>
        )}
      </motion.div>

      {/* Filmstrip thumbnails */}
      {images.length > 1 && (
        <div
          className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 px-4 py-2.5 rounded-2xl overflow-x-auto max-w-[90vw]"
          style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="shrink-0 rounded-lg overflow-hidden transition-all duration-200"
              style={{
                width: 44, height: 58,
                border: current === i ? '2px solid #D4AF37' : '2px solid rgba(255,255,255,0.15)',
                opacity: current === i ? 1 : 0.5,
                transform: current === i ? 'scale(1.08)' : 'scale(1)',
              }}
            >
              <img
                src={getOptimizedImageUrl(img, { width: 44, height: 58, quality: 'auto' })}
                alt=""
                className="w-full h-full object-cover pointer-events-none"
              />
            </button>
          ))}
        </div>
      )}
    </motion.div>
    ,
    document.body
  )
}

// ─── Image Detail Section ─────────────────────────────────────────────────────
const ImageDetailSection = ({ images = [], title = '' }) => {
  const [lightboxIndex, setLightboxIndex] = useState(null)

  if (!images || images.length === 0) return null

  // Layout: first image large, rest in grid
  const [hero, ...rest] = images

  return (
    <>
      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            images={images}
            startIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full"
      >
        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-4 w-0.5 rounded-sm" style={{ background: 'linear-gradient(180deg, #D4AF37, #C8622A)' }} />
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em]" style={{ color: '#7D6B41' }}>
              Photo Gallery
            </p>
            <span
              className="px-2 py-0.5 rounded-full text-[9px] font-bold"
              style={{ backgroundColor: 'rgba(212,175,55,0.12)', color: '#8B7340', border: '1px solid rgba(212,175,55,0.25)' }}
            >
              {images.length} photos
            </span>
          </div>

          {images.length > 1 && (
            <button
              onClick={() => setLightboxIndex(0)}
              className="flex items-center gap-1.5 text-[11px] font-semibold transition-opacity hover:opacity-70"
              style={{ color: '#004D40' }}
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              View all
            </button>
          )}
        </div>

        {/* Single image */}
        {images.length === 1 && (
          <motion.div
            whileHover={{ scale: 1.008 }}
            transition={{ duration: 0.3 }}
            className="relative rounded-2xl overflow-hidden cursor-zoom-in w-full"
            style={{
              aspectRatio: '4/3',
              backgroundColor: '#F5F2E8',
              boxShadow: '0 4px 24px rgba(0,52,43,0.08)',
              border: '1px solid #E8E4D4',
            }}
            onClick={() => setLightboxIndex(0)}
          >
            <img
              src={getOptimizedImageUrl(hero, { width: 900, height: 675, quality: 'auto' })}
              alt={`${title} — full view`}
              loading="lazy"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
              <span className="text-white text-xs font-semibold bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full">
                🔍 Click to zoom
              </span>
            </div>
          </motion.div>
        )}

        {/* 2 images */}
        {images.length === 2 && (
          <div className="grid grid-cols-2 gap-2.5">
            {images.map((img, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.012 }}
                transition={{ duration: 0.3 }}
                className="relative rounded-2xl overflow-hidden cursor-zoom-in"
                style={{
                  aspectRatio: '3/4',
                  backgroundColor: '#F5F2E8',
                  boxShadow: '0 4px 20px rgba(0,52,43,0.07)',
                  border: '1px solid #E8E4D4',
                }}
                onClick={() => setLightboxIndex(i)}
              >
                <img
                  src={getOptimizedImageUrl(img, { width: 500, height: 667, quality: 'auto' })}
                  alt={`${title} — view ${i + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/25 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            ))}
          </div>
        )}

        {/* 3+ images: hero + grid */}
        {images.length >= 3 && (
          <div className="flex flex-col gap-2.5">
            {/* Hero image */}
            <motion.div
              whileHover={{ scale: 1.005 }}
              transition={{ duration: 0.3 }}
              className="relative rounded-2xl overflow-hidden cursor-zoom-in w-full"
              style={{
                aspectRatio: '16/9',
                backgroundColor: '#F5F2E8',
                boxShadow: '0 4px 24px rgba(0,52,43,0.08)',
                border: '1px solid #E8E4D4',
              }}
              onClick={() => setLightboxIndex(0)}
            >
              <img
                src={getOptimizedImageUrl(hero, { width: 1000, height: 563, quality: 'auto' })}
                alt={`${title} — hero`}
                loading="lazy"
                className="w-full h-full object-cover"
              />
              {/* "Hero" label */}
              <div
                className="absolute top-3 left-3 text-[9px] font-extrabold uppercase tracking-[0.16em] px-2.5 py-1 rounded-full"
                style={{ backgroundColor: 'rgba(0,0,0,0.4)', color: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(6px)' }}
              >
                Featured
              </div>
              <div className="absolute inset-0 bg-linear-to-t from-black/25 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                <span className="text-white text-xs font-semibold bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full">
                  🔍 Click to zoom
                </span>
              </div>
            </motion.div>

            {/* Rest grid */}
            <div
              className={`grid gap-2.5 ${
                rest.length === 1 ? 'grid-cols-1' :
                rest.length === 2 ? 'grid-cols-2' :
                rest.length === 3 ? 'grid-cols-3' :
                'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
              }`}
            >
              {rest.map((img, i) => {
                const realIndex = i + 1
                const isLast    = i === rest.length - 1
                const remaining = images.length - 5 // images shown: hero + up to 4
                const showOverlay = images.length > 5 && isLast && i === 3

                return (
                  <motion.div
                    key={realIndex}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.25 }}
                    className="relative rounded-xl overflow-hidden cursor-zoom-in"
                    style={{
                      aspectRatio: rest.length <= 2 ? '3/4' : '1/1',
                      backgroundColor: '#F5F2E8',
                      border: '1px solid #E8E4D4',
                      boxShadow: '0 2px 12px rgba(0,52,43,0.06)',
                    }}
                    onClick={() => setLightboxIndex(realIndex)}
                  >
                    <img
                      src={getOptimizedImageUrl(img, { width: 400, height: 400, quality: 'auto' })}
                      alt={`${title} — view ${realIndex + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-250" />

                    {/* "View more" overlay on last visible tile */}
                    {showOverlay && (
                      <div
                        className="absolute inset-0 flex flex-col items-center justify-center gap-1"
                        style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)' }}
                      >
                        <span className="text-white text-xl font-black">+{remaining}</span>
                        <span className="text-white/75 text-[10px] font-semibold uppercase tracking-wider">more photos</span>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}

        {/* Footer hint */}
        {images.length > 1 && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-center text-[11px] mt-3 flex items-center justify-center gap-1.5"
            style={{ color: '#B0A88A' }}
          >
            <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
            </svg>
            Tap any photo to open full-screen viewer
          </motion.p>
        )}
      </motion.div>
    </>
  )
}

export default ImageDetailSection