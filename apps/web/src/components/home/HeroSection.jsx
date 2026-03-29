import React from "react";
import { Link } from "react-router-dom";
import HeroBig from "../../assets/HeroBig.png";
import HeroSml from "../../assets/HeroSml.png";

const HeroSection = () => {
  return (
    <section className="pt-12 md:pt-20 pb-8 md:pb-12 px-4 md:px-6 max-w-7xl mx-auto">
      {/* Mobile Image - Shown on Mobile only, Hidden on MD and up */}
      <div className="md:hidden mb-8 relative flex justify-center">
        <div className="relative w-full max-w-xs">
          <img
            src={HeroBig}
            alt="Premium Ethnic Wear"
            className="w-full h-auto object-cover"
          />
          {/* Small Image - Overlay Bottom Left */}
          <div className="absolute bottom-2 -left-3">
            <img
              src={HeroSml}
              alt="Jewelry Detail"
              className="w-24 h-24 object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 justify-between md:items-center">
        {/* Left Content */}
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-[#D4AF37] mb-3 md:mb-4">
            The Curated Heritage
          </p>
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-black text-[#1A1A1A] leading-tight mb-4 md:mb-6"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            From Ownership to Access:
            <br />
            <span className="text-[#00342B]">Redefining Ethnic Wear</span>
          </h1>
          <p className="text-sm md:text-sm lg:text-lg text-[#666] leading-relaxed mb-6 md:mb-8 max-w-lg">
            Experience the grandeur of Mumbai's finest designer couture without
            the burden of ownership. Sustainable luxury, tailored for your most
            memorable moments.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-3 lg:gap-4 mb-6 md:mb-8">
            <Link
              to="/collection"
              className="inline-flex items-center justify-center gap-2 px-6 md:px-6 lg:px-7 py-2.5 md:py-2.5 lg:py-3 bg-[#00342B] text-white
                text-sm font-semibold rounded-lg hover:bg-[#00695C] transition-colors duration-200 tracking-wide w-full sm:w-auto"
            >
              Explore Collection
            </Link>
            <Link
              to="/create"
              className="inline-flex items-center justify-center gap-2 px-6 md:px-6 lg:px-7 py-2.5 md:py-2.5 lg:py-3 border-2 border-[#D4AF37]
                text-[#00342B] text-sm font-semibold rounded-lg hover:bg-[#D4AF37]/10 transition-colors tracking-wide w-full sm:w-auto"
            >
              How it Works
            </Link>
          </div>
          <div className="flex flex-wrap gap-6 md:gap-8 lg:gap-12">
            {[
              { label: "Outfits Listed", value: "120+" },
              { label: "Happy Renters", value: "340+" },
              { label: "Avg Savings", value: "₹4,200" },
            ].map((stat) => (
              <div key={stat.label}>
                <div
                  className="text-2xl md:text-2xl lg:text-3xl font-black text-[#00342B]"
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

        {/* Desktop Image - Hidden on Mobile, Shown on MD and up */}
        <div className="relative hidden md:block py-4 md:py-6 lg:py-8">
          <div className="aspect-auto relative ml-auto w-fit">
            <img src={HeroBig} alt="Premium Ethnic Wear" className="h-80 md:h-96 lg:h-150" />
            {/* Second Image - Overlay Bottom Left */}
            <div className="absolute bottom-2 md:bottom-2 lg:bottom-3 -left-3 lg:-left-5">
              <img
                src={HeroSml}
                alt="Jewelry Detail"
                className="h-32 md:h-36 lg:h-50"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
