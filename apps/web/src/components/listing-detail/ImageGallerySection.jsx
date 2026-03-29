import React, { useRef, useState } from 'react'

const ImageGallerySection = ({ images, activeImage, onImageChange, title }) => {
  const hasImages = images?.length > 0
  const hasMultiple = images?.length > 1
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].clientX
  }

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX
    handleSwipe()
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
                src={img}
                alt={`${title} — view ${i + 1}`}
                className="w-full h-full object-cover cursor-pointer"
              />
            </button>
          ))}
        </div>
      )}

      {/* ── Main Image with Swipe Navigation ── */}
      <div className="flex-1 flex flex-col gap-3">
        <div className="relative">
          <div
            className="rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing w-full"
            style={{ 
              aspectRatio: '3/4', 
              backgroundColor: '#F0EDE0',
              maxHeight: 'calc(100vh - 120px)'
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {hasImages ? (
              <img
                src={images[activeImage]}
                alt={title}
                className="w-full h-full object-cover select-none"
                draggable={false}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl select-none">
                🪭
              </div>
            )}
          </div>

          {/* Mobile Image Indicator Dots */}
          {hasMultiple && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1 md:hidden">
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
                  src={img}
                  alt={`${title} — view ${i + 1}`}
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