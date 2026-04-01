import React, { useRef, useState, useEffect } from 'react'
import { getOptimizedImageUrl } from '../../services/cloudinary'

const ImageGallerySection = ({ images, activeImage, onImageChange, title }) => {
  const hasImages = images?.length > 0
  const hasMultiple = images?.length > 1
  
  // Modal state for sm/md screens
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalActiveImage, setModalActiveImage] = useState(activeImage)
  const [modalZoom, setModalZoom] = useState(1)
  const modalImageRef = useRef(null)
  const touchStartDistanceRef = useRef(0)
  const MAX_ZOOM = 3
  const MIN_ZOOM = 1
  const ZOOM_STEP = 0.3

  // Magnifier state (desktop only)
  const [showMagnifier, setShowMagnifier] = useState(false)
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 })
  const imageRef = useRef(null)
  const ZOOM_LEVEL = 3 // Magnification level

  // Handle back button to close modal
  useEffect(() => {
    const handleBackButton = () => {
      if (isModalOpen) {
        setIsModalOpen(false)
      }
    }

    window.addEventListener('popstate', handleBackButton)
    return () => window.removeEventListener('popstate', handleBackButton)
  }, [isModalOpen])

  // Mobile modal handlers
  const openModal = () => {
    setModalActiveImage(activeImage)
    setModalZoom(1)
    setIsModalOpen(true)
    history.pushState({ modal: true }, '')
  }

  const closeModal = () => {
    setIsModalOpen(false)
    history.back()
  }

  const handleModalTouchStart = (e) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )
      touchStartDistanceRef.current = distance
    }
  }

  const handleModalTouchMove = (e) => {
    if (e.touches.length === 2 && touchStartDistanceRef.current > 0) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )
      
      const delta = distance - touchStartDistanceRef.current
      const zoomDelta = delta * 0.01
      
      setModalZoom(prev => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev + zoomDelta)))
    }
  }

  const handleModalTouchEnd = () => {
    touchStartDistanceRef.current = 0
  }

  const handleModalImageChange = (index) => {
    setModalActiveImage(index)
    setModalZoom(1)
  }

  // Desktop magnifier handlers
  const handleMouseEnter = () => {
    setShowMagnifier(true)
  }

  const handleMouseLeave = () => {
    setShowMagnifier(false)
  }

  const handleMouseMove = (e) => {
    if (!imageRef.current) return

    const rect = imageRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Calculate percentage of cursor position
    const xPercent = (x / rect.width) * 100
    const yPercent = (y / rect.height) * 100

    setMagnifierPosition({ x: xPercent, y: yPercent })
  }


  const activeImg = images?.[activeImage]
  const optimizedActiveImage = activeImg ? getOptimizedImageUrl(activeImg, { width: 800, height: 1067, quality: 'auto' }) : null
  const optimizedActiveImageMobile = activeImg ? getOptimizedImageUrl(activeImg, { width: 500, height: 667, quality: 'auto' }) : null

  // Modal image
  const modalImg = images?.[modalActiveImage]
  const optimizedModalImage = modalImg ? getOptimizedImageUrl(modalImg, { width: 600, height: 800, quality: 'auto' }) : null

  return (
    <>
      {/* ── IMAGE MODAL (Mobile/Tablet Only) ── */}
      {isModalOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black flex flex-col">
          {/* Close Button */}
          <div className="absolute top-0 left-0 right-0 p-3 z-10 flex justify-between items-center">
            <button
              onClick={closeModal}
              className="text-white text-2xl w-10 h-10 flex items-center justify-center"
              aria-label="Close image viewer"
            >
              ←
            </button>
            <span className="text-white text-sm">
              {modalActiveImage + 1} / {images.length}
            </span>
          </div>

          {/* Main zoomed image */}
          <div
            className="flex-1 flex items-center justify-center overflow-hidden"
            onTouchStart={handleModalTouchStart}
            onTouchMove={handleModalTouchMove}
            onTouchEnd={handleModalTouchEnd}
          >
            <img
              ref={modalImageRef}
              src={optimizedModalImage}
              alt={title}
              className="w-full h-full object-contain"
              style={{
                transform: `scale(${modalZoom})`,
                transformOrigin: 'center center',
                transition: 'transform 0.1s ease-out',
              }}
              draggable={false}
            />
          </div>

          {/* Image Thumbnail Belt */}
          {hasMultiple && (
            <div className="bg-black/80 px-2 py-3 flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => handleModalImageChange(i)}
                  className="relative shrink-0 rounded-lg overflow-hidden transition-all duration-200"
                  style={{
                    width: '60px',
                    height: '80px',
                    border: modalActiveImage === i
                      ? '2px solid #FFB84D'
                      : '2px solid rgba(255,255,255,0.2)',
                    opacity: modalActiveImage === i ? 1 : 0.6,
                  }}
                  aria-label={`View image ${i + 1}`}
                >
                  <img
                    src={getOptimizedImageUrl(img, { width: 60, height: 80, quality: 'auto' })}
                    alt={`Thumbnail ${i + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Zoom Instruction */}
          <div className="bg-black/80 text-white text-xs px-3 py-2 text-center">
            📌 Use 2 fingers to zoom
          </div>
        </div>
      )}

      {/* ── DESKTOP GALLERY (lg+) ── */}
      <div className="flex flex-col md:flex-row gap-2 md:gap-3">

      {/* ── Thumbnail Strip (only on desktop, shown on md+) ── */}
      {hasMultiple && (
        <div className="hidden md:flex flex-col gap-2 w-17 shrink-0">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => onImageChange(i)}
              className="relative w-full overflow-hidden rounded-xl transition-all duration-200 focus:outline-none"
              style={{
                aspectRatio: '3/4',
                border: activeImage === i
                  ? '2px solid #004D40'
                  : '2px solid transparent',
                opacity: activeImage === i ? 1 : 0.55,
                boxShadow: activeImage === i
                  ? '0 0 0 1px rgba(0,77,64,0.15)'
                  : 'none',
              }}
              aria-label={`View image ${i + 1}`}
            >
              <img
                src={getOptimizedImageUrl(img, { width: 100, height: 133, quality: 'auto' })}
                alt={`${title} — view ${i + 1}`}
                loading="lazy"
                className="w-full h-full object-cover cursor-pointer"
              />
            </button>
          ))}
        </div>
      )}

      {/* ── Main Image Container ── */}
      <div className="flex-1 flex flex-col gap-3 relative">
        {/* Main Image */}
        <div className="relative">
          <div
            ref={imageRef}
            className="rounded-2xl overflow-hidden cursor-pointer w-full relative lg:cursor-grab lg:active:cursor-grabbing"
            style={{ 
              aspectRatio: '3/4', 
              backgroundColor: '#F0EDE0',
              maxHeight: 'calc(100vh - 120px)',
              cursor: showMagnifier ? 'url(data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="13" fill="none" stroke="%23004D40" stroke-width="2"/><line x1="16" y1="10" x2="16" y2="22" stroke="%23004D40" stroke-width="2"/><line x1="10" y1="16" x2="22" y2="16" stroke="%23004D40" stroke-width="2"/></svg>) 16 16, grab' : undefined,
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
            onClick={openModal}
          >
            {hasImages ? (
              <img
                src={optimizedActiveImageMobile}
                srcSet={`${optimizedActiveImageMobile} 500w, ${optimizedActiveImage} 800w`}
                sizes="(max-width: 768px) 500px, 800px"
                alt={title}
                loading="eager"
                className="w-full h-full object-cover select-none"
                draggable={false}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl select-none">
                🪭
              </div>
            )}
          </div>

          {/* Click to Zoom Instruction - Only on sm/md screens */}
          <div className="md:hidden absolute top-3 left-3 flex items-center gap-2 z-10 bg-white/80 px-2 py-1 rounded-full text-xs" style={{ color: '#004D40' }}>
            <span>🔍</span>
            <span>Click to zoom</span>
          </div>
        </div>

        {/* Magnifier Box - Desktop only */}
        {showMagnifier && hasImages && (
          <div 
            className="hidden lg:block absolute rounded-2xl overflow-hidden border-2"
            style={{
              width: '200px',
              aspectRatio: '3/4',
              borderColor: '#004D40',
              backgroundColor: '#F0EDE0',
              zIndex: 50,
              right: '-220px',
              top: '0',
            }}
          >
            <img
              src={optimizedActiveImage}
              alt={`${title} - magnified`}
              className="w-full h-full object-cover"
              style={{
                transform: `scale(${ZOOM_LEVEL}) translate(calc(${-magnifierPosition.x}%), calc(${-magnifierPosition.y}%))`,
                transformOrigin: '0 0',
                transition: 'transform 0.05s ease-out',
              }}
              draggable={false}
            />
          </div>
        )}

        {/* ── Thumbnail Grid (only on mobile, shown below on sm) ── */}
        {hasMultiple && (
          <div className="md:hidden flex gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => onImageChange(i)}
                className="relative shrink-0 overflow-hidden rounded-lg transition-all duration-200 focus:outline-none"
                style={{
                  width: '70px',
                  height: '70px',
                  border: activeImage === i
                    ? '2px solid #004D40'
                    : '2px solid transparent',
                  opacity: activeImage === i ? 1 : 0.6,
                }}
                aria-label={`View image ${i + 1}`}
              >
                <img
                  src={getOptimizedImageUrl(img, { width: 70, height: 93, quality: 'auto' })}
                  alt={`${title} — view ${i + 1}`}
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