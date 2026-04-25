import React, { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { createPortal } from 'react-dom'
import { getOptimizedImageUrl } from '../../services/cloudinary'

const ImageGallerySection = ({ images, activeImage, onImageChange, title }) => {
  const hasImages  = images?.length > 0
  const hasMultiple = images?.length > 1

  // Modal state (mobile)
  const [isModalOpen,      setIsModalOpen]      = useState(false)
  const [modalActiveImage, setModalActiveImage] = useState(activeImage)
  const [modalZoom,        setModalZoom]        = useState(1)
  const [panOffset,        setPanOffset]        = useState({ x: 0, y: 0 })

  const modalImageRef  = useRef(null)
  const containerRef   = useRef(null)
  const lastTapRef     = useRef(0)
  const touchStartRef  = useRef({ x: 0, y: 0 })
  const panStartRef    = useRef({ x: 0, y: 0 })
  const isDraggingRef  = useRef(false)

  const MAX_ZOOM        = 3
  const DOUBLE_TAP_DELAY = 300

  // Magnifier (desktop)
  const [showMagnifier,    setShowMagnifier]    = useState(false)
  const [magnifierPos,     setMagnifierPos]     = useState({ x: 0, y: 0 })
  const imageRef = useRef(null)
  const ZOOM_LEVEL = 3

  useEffect(() => {
    const handleBack = () => { if (isModalOpen) setIsModalOpen(false) }
    window.addEventListener('popstate', handleBack)
    return () => window.removeEventListener('popstate', handleBack)
  }, [isModalOpen])

  const openModal = () => {
    setModalActiveImage(activeImage)
    setModalZoom(1)
    setPanOffset({ x: 0, y: 0 })
    setIsModalOpen(true)
    history.pushState({ modal: true }, '')
  }

  const closeModal = () => {
    setIsModalOpen(false)
    history.back()
  }

  const handleDoubleTap = () => {
    const now = Date.now()
    const tapLength = now - lastTapRef.current
    if (tapLength < DOUBLE_TAP_DELAY && tapLength > 0) {
      if (modalZoom === 1) { setModalZoom(MAX_ZOOM); setPanOffset({ x: 0, y: 0 }) }
      else { setModalZoom(1); setPanOffset({ x: 0, y: 0 }) }
      lastTapRef.current = 0
    } else { lastTapRef.current = now }
  }

  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return
    handleDoubleTap()
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
    panStartRef.current   = { ...panOffset }
    isDraggingRef.current  = true
  }

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current || e.touches.length !== 1 || modalZoom === 1) return
    const touch = e.touches[0]
    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = touch.clientY - touchStartRef.current.y
    if (!modalImageRef.current || !containerRef.current) return
    const maxPanX = (modalImageRef.current.offsetWidth  * modalZoom - containerRef.current.offsetWidth)  / 2
    const maxPanY = (modalImageRef.current.offsetHeight * modalZoom - containerRef.current.offsetHeight) / 2
    setPanOffset({
      x: Math.max(-maxPanX, Math.min(maxPanX, panStartRef.current.x + deltaX)),
      y: Math.max(-maxPanY, Math.min(maxPanY, panStartRef.current.y + deltaY)),
    })
  }

  const handleTouchEnd = () => { isDraggingRef.current = false }

  const handleModalImageChange = (index) => {
    setModalActiveImage(index)
    setModalZoom(1)
    setPanOffset({ x: 0, y: 0 })
  }

  const handleMouseMove = (e) => {
    if (!imageRef.current) return
    const rect = imageRef.current.getBoundingClientRect()
    setMagnifierPos({
      x: ((e.clientX - rect.left) / rect.width)  * 100,
      y: ((e.clientY - rect.top)  / rect.height) * 100,
    })
  }

  const activeImg           = images?.[activeImage]
  const optimized           = activeImg ? getOptimizedImageUrl(activeImg, { width: 800, height: 1067, quality: 'auto' }) : null
  const optimizedMobile     = activeImg ? getOptimizedImageUrl(activeImg, { width: 500, height: 667,  quality: 'auto' }) : null
  const modalImg            = images?.[modalActiveImage]
  const optimizedModal      = modalImg  ? getOptimizedImageUrl(modalImg,  { width: 600, height: 800,  quality: 'auto' }) : null

  const mobileModal = (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="md:hidden fixed inset-0 z-50 bg-[#F5F3EE] flex flex-col"
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 p-3 z-10 flex justify-between items-center bg-linear-to-b from-[#F5F3EE]/95 to-transparent">
            <button
              onClick={closeModal}
              className="text-[#1A1A1A] w-10 h-10 flex items-center justify-center rounded-full bg-white/80 border border-black/10 backdrop-blur-sm text-lg"
              aria-label="Close"
            >
              ←
            </button>
            <span className="text-[#1A1A1A] text-xs font-semibold bg-white/80 border border-black/10 px-2.5 py-1 rounded-full">
              {modalActiveImage + 1} / {images.length}
            </span>
          </div>

          {/* Image */}
          <div
            ref={containerRef}
            className="flex-1 min-h-0 flex items-center justify-center overflow-hidden px-2"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              ref={modalImageRef}
              src={optimizedModal}
              alt={title}
              className="max-w-full max-h-full object-contain select-none"
              style={{
                transform: `scale(${modalZoom}) translate(${panOffset.x}px, ${panOffset.y}px)`,
                transformOrigin: 'center',
                transition: isDraggingRef.current ? 'none' : 'transform 0.2s ease-out',
              }}
              draggable={false}
            />
          </div>

          {/* Thumbnails */}
          {hasMultiple && (
            <div className="bg-[#EFEAE0]/95 px-3 py-3 flex gap-2 overflow-x-auto border-t border-black/5">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => handleModalImageChange(i)}
                  className="shrink-0 rounded-lg overflow-hidden transition-all"
                  style={{
                    width: 56, height: 74,
                    border: modalActiveImage === i ? '2px solid #D4AF37' : '2px solid rgba(0,0,0,0.12)',
                    opacity: modalActiveImage === i ? 1 : 0.55,
                  }}
                >
                  <img src={getOptimizedImageUrl(img, { width: 56, height: 74, quality: 'auto' })} alt="" className="w-full h-full object-cover pointer-events-none" />
                </button>
              ))}
            </div>
          )}

          <div className="bg-[#E8E2D7] text-[#6B655A] text-[11px] px-3 py-2 text-center border-t border-black/5">
            {modalZoom === 1 ? '👆 Double tap to zoom' : '👆 Double tap to zoom out  •  Drag to pan'}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <>
      {/* ── Mobile Modal ── */}
      {typeof document !== 'undefined' ? createPortal(mobileModal, document.body) : null}

      {/* ── Desktop Gallery ── */}
      <div className="flex gap-3">

        {/* Thumbnail strip (md+) */}
        {hasMultiple && (
          <div className="hidden md:flex flex-col gap-2 w-16 shrink-0">
            {images.map((img, i) => (
              <motion.button
                key={i}
                onClick={() => onImageChange(i)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.18 }}
                className="relative w-full overflow-hidden rounded-xl focus:outline-none"
                style={{
                  aspectRatio: '3/4',
                  border: activeImage === i ? '2px solid #004D40' : '2px solid transparent',
                  opacity: activeImage === i ? 1 : 0.55,
                  boxShadow: activeImage === i ? '0 0 0 1px rgba(0,77,64,0.2)' : 'none',
                  transition: 'opacity 0.2s, box-shadow 0.2s',
                }}
                aria-label={`View image ${i + 1}`}
              >
                <img
                  src={getOptimizedImageUrl(img, { width: 100, height: 133, quality: 'auto' })}
                  alt={`${title} — view ${i + 1}`}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
                {/* Active indicator dot */}
                {activeImage === i && (
                  <div
                    className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: '#D4AF37' }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        )}

        {/* Main image */}
        <div className="flex-1 flex flex-col gap-3 relative">
          <div className="relative">
            <motion.div
              ref={imageRef}
              className="rounded-2xl md:rounded-3xl overflow-hidden w-full relative"
              style={{
                aspectRatio: '3/4',
                backgroundColor: '#F5F2E8',
                maxHeight: 'calc(100vh - 120px)',
                cursor: showMagnifier ? 'crosshair' : 'pointer',
                boxShadow: '0 8px 40px rgba(0,52,43,0.1)',
              }}
              onMouseEnter={() => setShowMagnifier(true)}
              onMouseLeave={() => setShowMagnifier(false)}
              onMouseMove={handleMouseMove}
              onClick={openModal}
              whileHover={{ boxShadow: '0 12px 50px rgba(0,52,43,0.15)' }}
              transition={{ duration: 0.3 }}
            >
              {hasImages ? (
                <motion.img
                  key={activeImage}
                  src={optimizedMobile}
                  srcSet={`${optimizedMobile} 500w, ${optimized} 800w`}
                  sizes="(max-width: 768px) 500px, 800px"
                  alt={title}
                  loading="eager"
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full h-full object-cover select-none"
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl select-none">🪭</div>
              )}

              {/* Mobile zoom hint */}
              <div className="md:hidden absolute top-3 left-3 flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ color: '#004D40' }}>
                <span>🔍</span>
                <span>Tap to zoom</span>
              </div>

              {/* Image count badge */}
              {hasMultiple && (
                <div
                  className="md:hidden absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full"
                >
                  {activeImage + 1}/{images.length}
                </div>
              )}
            </motion.div>

            {/* Desktop magnifier */}
            <AnimatePresence>
              {showMagnifier && hasImages && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.18 }}
                  className="hidden lg:block absolute rounded-2xl overflow-hidden"
                  style={{
                    width: 200, aspectRatio: '3/4',
                    border: '2px solid #004D40',
                    backgroundColor: '#F5F2E8',
                    zIndex: 50,
                    right: -220, top: 0,
                    boxShadow: '0 12px 40px rgba(0,77,64,0.2)',
                  }}
                >
                  <img
                    src={optimized}
                    alt="Magnified"
                    className="w-full h-full object-cover"
                    style={{
                      transform: `scale(${ZOOM_LEVEL}) translate(calc(${-magnifierPos.x}%), calc(${-magnifierPos.y}%))`,
                      transformOrigin: '0 0',
                      transition: 'transform 0.05s ease-out',
                    }}
                    draggable={false}
                  />
                  {/* Magnifier label */}
                  <div
                    className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'rgba(0,77,64,0.85)', color: '#D4AF37' }}
                  >
                    {ZOOM_LEVEL}× zoom
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile thumbnails */}
          {hasMultiple && (
            <div className="md:hidden flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => onImageChange(i)}
                  className="shrink-0 overflow-hidden rounded-xl transition-all duration-200"
                  style={{
                    width: 68, height: 68,
                    border: activeImage === i ? '2px solid #004D40' : '2px solid transparent',
                    opacity: activeImage === i ? 1 : 0.55,
                  }}
                >
                  <img
                    src={getOptimizedImageUrl(img, { width: 68, height: 90, quality: 'auto' })}
                    alt={`View ${i + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default ImageGallerySection