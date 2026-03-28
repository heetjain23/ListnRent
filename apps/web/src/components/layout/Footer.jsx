import React from 'react'
import { Link } from 'react-router-dom'
import { FiShare2, FiGlobe } from 'react-icons/fi'

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-[#00342B] text-white">
      {/* Main Footer Content */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Left Section - Brand Info */}
          <div className="md:col-span-4 flex flex-col gap-6">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight"
                style={{ fontFamily: "'Georgia', serif" }}>
                Rent<span className="text-yellow-50">Fit</span>
              </span>
            </div>

            {/* Description */}
            <p className="text-sm leading-relaxed text-gray-200 font-light">
              The Curated Heritage. Mumbai's premier destination for luxury ethnic rentals. Celebrating tradition, embracing sustainability.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-4 pt-4">
              <button
                className="w-10 h-10 rounded-full border border-white/30 hover:border-white/60 
                  hover:bg-white/10 transition-all duration-300 flex items-center justify-center"
                aria-label="Share"
              >
                <FiShare2 size={18} />
              </button>
              <button
                className="w-10 h-10 rounded-full border border-white/30 hover:border-white/60 
                  hover:bg-white/10 transition-all duration-300 flex items-center justify-center"
                aria-label="Language"
              >
                <FiGlobe size={18} />
              </button>
            </div>
          </div>

          {/* Right Section - Links */}
          <div className="md:col-span-8 grid grid-cols-3 gap-8">
            {/* The Brand */}
            <div>
              <h3 className="text-xs font-black tracking-widest uppercase mb-6 text-yellow-50">
                The Brand
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#sustainability"
                    className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    Sustainability
                  </a>
                </li>
                <li>
                  <a
                    href="#brand-story"
                    className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    Brand Story
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-xs font-black tracking-widest uppercase mb-6 text-yellow-50">
                Support
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#terms"
                    className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#privacy"
                    className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h3 className="text-xs font-black tracking-widest uppercase mb-6 text-yellow-50">
                Connect
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#contact"
                    className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center">
          <p className="text-sm text-gray-300">
            © 2026 RentFit Mumbai. The Curated Heritage.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
