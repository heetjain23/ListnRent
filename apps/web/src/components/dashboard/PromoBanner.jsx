import React from 'react'

const PromoBanner = ({ onBoost }) => {
  return (
    <div className="bg-[#1A1A1A] rounded-lg overflow-hidden mt-12">
      <div className="grid grid-cols-2 gap-8 p-12 items-center">
        <div>
          <h3 className="text-3xl font-bold text-white mb-3">
            Maximize your atelier's reach.
          </h3>
          <p className="text-[#CCC] mb-8 leading-relaxed">
            Our new Premium Spotlight feature puts your items at the top of seasonal search results.
          </p>
          <button
            onClick={onBoost}
            className="bg-[#D4AF37] text-[#1A1A1A] px-8 py-3 rounded-lg font-bold hover:bg-[#E5C158] transition-colors"
          >
            Boost Listings
          </button>
        </div>
        <div className="text-right">
          <div className="text-6xl opacity-20">🎯</div>
        </div>
      </div>
    </div>
  )
}

export default PromoBanner
