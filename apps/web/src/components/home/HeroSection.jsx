import React from 'react'
import { Link } from 'react-router-dom'

const HeroSection = () => {
  return (
    <section className="pt-32 pb-16 px-6 max-w-6xl mx-auto">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#C8622A] mb-4">
          Mumbai's Ethnic Wear Circle
        </p>
        <h1
          className="text-5xl md:text-6xl font-black text-[#1A1A1A] leading-tight mb-6"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          Wear it once.
          <br />
          <span className="text-[#C8622A]">Rent it forever.</span>
        </h1>
        <p className="text-[#666] text-lg leading-relaxed mb-8 max-w-lg">
          Rent stunning ethnic wear from people in your city. List your wardrobe, earn from it.
          No waste, just style.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/create"
            className="inline-flex items-center gap-2 px-7 py-3 bg-[#1A1A1A] text-[#FAF7F2]
              text-sm font-semibold rounded-full hover:bg-[#C8622A] transition-colors duration-200 tracking-wide"
          >
            + List Your Outfit
          </Link>
          <a
            href="#listings"
            className="inline-flex items-center gap-2 px-7 py-3 border border-[#CCC]
              text-[#1A1A1A] text-sm font-semibold rounded-full hover:border-[#1A1A1A] transition-colors tracking-wide"
          >
            Browse Rentals ↓
          </a>
        </div>
      </div>

      {/* Stats Row */}
      <div className="mt-14 flex flex-wrap gap-8">
        {[
          { label: 'Outfits Listed', value: '120+' },
          { label: 'Happy Renters', value: '340+' },
          { label: 'Avg Savings', value: '₹4,200' },
        ].map((stat) => (
          <div key={stat.label}>
            <div className="text-2xl font-black text-[#1A1A1A]" style={{ fontFamily: "'Georgia', serif" }}>
              {stat.value}
            </div>
            <div className="text-xs text-[#888] tracking-wide mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default HeroSection
