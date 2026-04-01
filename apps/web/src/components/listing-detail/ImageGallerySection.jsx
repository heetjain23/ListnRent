import React, { useRef, useState } from 'react'
import { getOptimizedImageUrl } from '../../services/cloudinary'

const ImageGallerySection = ({ images, activeImage, onImageChange, title }) => {
  const hasImages = images?.length > 0
  const hasMultiple = images?.length > 1
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)
  
  // Magnifier state
  const [showMagnifier, setShowMagnifier] = useState(false)
  const [magnifierPosition, setMagnifierPosition] = useState({ x: 0, y: 0 })
  const imageRef = useRef(null)
  const ZOOM_LEVEL = 3 // Magnification level

  // Zoom state for sm/md screens
  const [imageZoom, setImageZoom] = useState(1)
  const MAX_ZOOM = 3
  const MIN_ZOOM = 1
  const ZOOM_STEP = 0.5

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      // Pinch zoom start
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )
      touchStartX.current = distance
      touchEndX.current = 0
    } else {
      touchStartX.current = e.changedTouches[0].clientX
    }
  }

  const handleTouchEnd = (e) => {
    if (touchEndX.current !== 0) {
      // Handle pinch zoom
      const diff = touchEndX.current - touchStartX.current
      if (Math.abs(diff) > 10) {
        if (diff > 0) {
          handleZoomIn()
        } else {
          handleZoomOut()
        }
      }
      touchEndX.current = 0
    } else {
      // Handle swipe
      touchEndX.current = e.changedTouches[0].clientX
      handleSwipe()
    }
  }

  const handleTouchMove = (e) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )
      touchEndX.current = distance
    }
  }

  // Double tap tracking for reset zoom
  const lastTapRef = useRef(0)
  const handleDoubleTap = () => {
    const now = Date.now()
    if (now - lastTapRef.current < 300 && imageZoom > 1) {
      handleResetZoom()
    }
    lastTapRef.current = now
  }

  const handleSwipe = () => {
    const diff = touchStartX.current - touchEndX.current
    const isLeftSwipe = diff > 50
    const isRightSwipe = diff < -50

    if (isLeftSwipe && activeImage < images.length - 1) {
      onImageChange(activeImage + 1)
    } else if (isRightSwipe && activeImage > 0) {
      onImageChange(activeImage - 1)
    }
  }

  // Magnifier handlers
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

  // Zoom handlers for sm/md screens
  const handleZoomIn = () => {
    setImageZoom(prev => Math.min(prev + ZOOM_STEP, MAX_ZOOM))
  }

  const handleZoomOut = () => {
    setImageZoom(prev => Math.max(prev - ZOOM_STEP, MIN_ZOOM))
  }

  const handleResetZoom = () => {
    setImageZoom(1)
  }

  const activeImg = images?.[activeImage]
  const optimizedActiveImage = activeImg ? getOptimizedImageUrl(activeImg, { width: 800, height: 1067, quality: 'auto' }) : null
  const optimizedActiveImageMobile = activeImg ? getOptimizedImageUrl(activeImg, { width: 500, height: 667, quality: 'auto' }) : null

  return (
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

      {/* ── Main Image Container with Swipe Navigation and Magnifier ── */}
      <div className="flex-1 flex flex-col gap-3 relative">
        {/* Main Image */}
        <div className="relative">
          <div
            ref={imageRef}
            className="rounded-2xl overflow-auto cursor-grab active:cursor-grabbing w-full relative lg:overflow-hidden"
            style={{ 
              aspectRatio: '3/4', 
              backgroundColor: '#F0EDE0',
              maxHeight: 'calc(100vh - 120px)',
              cursor: showMagnifier ? 'url(data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="13" fill="none" stroke="%23004D40" stroke-width="2"/><line x1="16" y1="10" x2="16" y2="22" stroke="%23004D40" stroke-width="2"/><line x1="10" y1="16" x2="22" y2="16" stroke="%23004D40" stroke-width="2"/></svg>) 16 16, grab' : 'grab',
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={handleTouchMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
            onClick={handleDoubleTap}
          >
            {hasImages ? (
              <img
                src={optimizedActiveImageMobile}
                srcSet={`${optimizedActiveImageMobile} 500w, ${optimizedActiveImage} 800w`}
                sizes="(max-width: 768px) 500px, 800px"
                alt={title}
                loading="eager"
                className="w-full h-full object-cover select-none"
                style={{
                  transform: `scale(${imageZoom})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.2s ease-out',
                }}
                draggable={false}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl select-none">
                🪭
              </div>
            )}

            {/* Mobile Image Indicator Dots */}
            {hasMultiple && (
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex justify-center gap-1 md:hidden z-10">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => onImageChange(i)}
                    className="w-2 h-2 rounded-full transition-all"
                    style={{
                      backgroundColor: activeImage === i ? '#004D40' : 'rgba(255,255,255,0.6)',
                    }}
                    aria-label={`Go to image ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Pinch Zoom Instruction - Only on sm/md screens */}
          <div className="lg:hidden absolute top-3 left-3 flex items-center gap-2 z-10 bg-white/80 px-2 py-1 rounded-full text-xs" style={{ color: '#004D40' }}>
            <span>📌</span>
            <span>Pinch to zoom</span>
          </div>
        </div>

        {/* Magnifier Box - Positioned absolutely on top of title/description */}
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
  )
}

export default ImageGallerySection