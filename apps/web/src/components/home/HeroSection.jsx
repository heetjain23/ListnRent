import React from "react";
import { Link } from "react-router-dom";
import HeroBig from "../../assets/HeroBig.png";
import HeroSml from "../../assets/HeroSml.png";

const HeroSection = () => {
  return (
    <section className="pt-20 pb-12 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 justify-between items-center">
        {/* Left Content */}
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#D4AF37] mb-4">
            The Curated Heritage
          </p>
          <h1
            className="text-5xl md:text-6xl font-black text-[#1A1A1A] leading-tight mb-6"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            From Ownership to Access:
            <br />
            <span className="text-[#00342B]">Redefining Ethnic Wear</span>
          </h1>
          <p className="text-[#666] text-lg leading-relaxed mb-8 max-w-lg">
            Experience the grandeur of Mumbai's finest designer couture without
            the burden of ownership. Sustainable luxury, tailored for your most
            memorable moments.
          </p>
          <div className="flex flex-wrap gap-4 mb-6">
            <Link
              to="/collection"
              className="inline-flex items-center gap-2 px-7 py-3 bg-[#00342B] text-white
                text-sm font-semibold rounded-lg hover:bg-[#00695C] transition-colors duration-200 tracking-wide"
            >
              Explore Collection
            </Link>
            <Link
              to="/create"
              className="inline-flex items-center gap-2 px-7 py-3 border-2 border-[#D4AF37]
                text-[#00342B] text-sm font-semibold rounded-lg hover:bg-[#D4AF37]/10 transition-colors tracking-wide"
            >
              How it Works
            </Link>
          </div>
          <div className="flex flex-wrap gap-12">
            {[
              { label: "Outfits Listed", value: "120+" },
              { label: "Happy Renters", value: "340+" },
              { label: "Avg Savings", value: "₹4,200" },
            ].map((stat) => (
              <div key={stat.label}>
                <div
                  className="text-3xl font-black text-[#00342B]"
                  style={{ fontFamily: "'Georgia', serif" }}
                >
                  {stat.value}
                </div>
                <div className="text-xs text-[#888] tracking-wide mt-0.5">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Image */}
        <div className="relative hidden lg:block py-8">
          <div className="aspect-auto relative ml-auto w-fit">
            <img src={HeroBig} alt="Premium Ethnic Wear" className="h-150" />
            {/* Second Image - Overlay Bottom Left */}
            <div className="absolute bottom-3 -left-5">
              <img
                src={HeroSml}
                alt="Jewelry Detail"
                className="h-50"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      {/* <div className="flex flex-wrap gap-12">
        {[
          { label: 'Outfits Listed', value: '120+' },
          { label: 'Happy Renters', value: '340+' },
          { label: 'Avg Savings', value: '₹4,200' },
        ].map((stat) => (
          <div key={stat.label}>
            <div className="text-3xl font-black text-[#00342B]" style={{ fontFamily: "'Georgia', serif" }}>
              {stat.value}
            </div>
            <div className="text-xs text-[#888] tracking-wide mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div> */}
    </section>
  );
};

export default HeroSection;
