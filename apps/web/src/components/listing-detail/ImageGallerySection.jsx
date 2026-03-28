import React from 'react'
const ImageGallerySection = ({ images, activeImage, onImageChange, title }) => {
  const hasImages = images?.length > 0
  const hasMultiple = images?.length > 1

  return (
    <div className="flex gap-3">

      {/* ── Thumbnail Strip (only when multiple images) ── */}
      {hasMultiple && (
        <div className="flex flex-col gap-2 w-17 shrink-0">
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

      {/* ── Main Image ── */}
      <div
        className="flex-1 h-140 rounded-2xl overflow-hidden"
        style={{ aspectRatio: '3/4', backgroundColor: '#F0EDE0' }}
      >
        {hasImages ? (
          <img
            src={images[activeImage]}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl select-none">
            🪭
          </div>
        )}
      </div>

    </div>
  )
}

export default ImageGallerySection