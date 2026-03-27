import React from 'react'

const ImageGallerySection = ({ images, activeImage, onImageChange, title }) => {
  return (
    <div>
      <div className="aspect-3/4 rounded-2xl overflow-hidden bg-[#F0EBE3] mb-3">
        {images?.[activeImage] ? (
          <img
            src={images[activeImage]}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">🪭</div>
        )}
      </div>
      {images?.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => onImageChange(i)}
              className={`w-16 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                activeImage === i ? 'border-[#C8622A]' : 'border-transparent'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ImageGallerySection
