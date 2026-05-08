import React, { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import ListingCard from "../collection/ListingCard";

// ─── Magnetic Nav Button ──────────────────────────────────────────────────────
function MagneticNavBtn({ children, onClick, disabled, className }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 20 });
  const sy = useSpring(y, { stiffness: 300, damping: 20 });
  const ref = useRef(null);

  const handleMouseMove = (e) => {
    if (!ref.current || disabled) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.4);
    y.set((e.clientY - cy) * 0.4);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      type="button"
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      disabled={disabled}
      style={{ x: sx, y: sy }}
      whileTap={{ scale: 0.92 }}
      className={className}
    >
      {children}
    </motion.button>
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard({ index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl bg-[#F0EAE0]"
      style={{ aspectRatio: "3/4" }}
    >
      {/* Shimmer sweep */}
      <motion.div
        animate={{ x: ["-100%", "200%"] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
        className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(212,175,55,0.15),rgba(255,255,255,0.3),transparent)]"
        style={{ skewX: "-20deg" }}
      />
      <div className="absolute inset-0 flex flex-col justify-end p-5">
        <div className="h-3 w-16 rounded-full bg-[rgba(0,52,43,0.1)] mb-3" />
        <div className="h-5 w-32 rounded-full bg-[rgba(0,52,43,0.12)] mb-2" />
        <div className="h-3 w-20 rounded-full bg-[rgba(0,52,43,0.08)]" />
      </div>
    </motion.div>
  );
}

// ─── Ambient Background Decoration ───────────────────────────────────────────
function AmbientAccents() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Soft emerald glow top-left */}
      <motion.div
        animate={{ x: [0, 18, -8, 0], y: [0, 12, 4, 0], opacity: [0.4, 0.6, 0.45, 0.4] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-[10%] -left-[8%] rounded-full blur-[48px]"
        style={{
          width: "min(38vw, 480px)",
          height: "min(38vw, 480px)",
          background: "radial-gradient(circle, rgba(0,52,43,0.14) 0%, rgba(0,52,43,0) 70%)",
        }}
      />
      {/* Gold glow bottom-right */}
      <motion.div
        animate={{ x: [0, -14, 6, 0], y: [0, -10, -4, 0], opacity: [0.35, 0.55, 0.4, 0.35] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-[8%] -right-[6%] rounded-full blur-[48px]"
        style={{
          width: "min(32vw, 400px)",
          height: "min(32vw, 400px)",
          background: "radial-gradient(circle, rgba(212,175,55,0.18) 0%, rgba(212,175,55,0) 70%)",
        }}
      />
      {/* Fine grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,52,43,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,52,43,1) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "linear-gradient(180deg, transparent 0%, black 15%, black 85%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(180deg, transparent 0%, black 15%, black 85%, transparent 100%)",
        }}
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const TrendingNowSection = ({ listings, loading }) => {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const touchStartXRef = useRef(null);
  const touchCurrentXRef = useRef(null);

  const trendingListings = listings.slice(0, 4);
  const maxCarouselIndex = Math.max(0, trendingListings.length - 1);

  useEffect(() => {
    setCarouselIndex((prev) => Math.min(prev, maxCarouselIndex));
  }, [maxCarouselIndex]);

  const handlePrev = () => setCarouselIndex((prev) => Math.max(0, prev - 1));
  const handleNext = () => setCarouselIndex((prev) => Math.min(maxCarouselIndex, prev + 1));

  const handleTouchStart = (e) => {
    const x = e.touches?.[0]?.clientX;
    if (typeof x !== "number") return;
    touchStartXRef.current = x;
    touchCurrentXRef.current = x;
  };

  const handleTouchMove = (e) => {
    const x = e.touches?.[0]?.clientX;
    if (typeof x !== "number") return;
    touchCurrentXRef.current = x;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null || touchCurrentXRef.current === null) return;

    const distance = touchStartXRef.current - touchCurrentXRef.current;
    const swipeThreshold = 50;

    if (distance > swipeThreshold) {
      handleNext();
    } else if (distance < -swipeThreshold) {
      handlePrev();
    }

    touchStartXRef.current = null;
    touchCurrentXRef.current = null;
  };

  // ── Loading skeleton ──
  if (loading) {
    return (
      <section className="relative py-20 px-6 bg-[#FAF7F2] overflow-hidden">
        <AmbientAccents />
        <div className="relative z-10 max-w-6xl mx-auto">
          {/* Header skeleton */}
          <div className="mb-12">
            <div className="h-10 w-48 rounded-full bg-[#E8E0D5] animate-pulse mb-3" />
            <div className="h-1 w-24 rounded-full bg-[rgba(212,175,55,0.3)]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} index={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!trendingListings.length) return null;

  return (
    <section className="relative py-20 px-6 bg-[#FAF7F2] overflow-hidden">
      <AmbientAccents />

      <div className="relative z-10 max-w-6xl mx-auto">

        {/* ── Section Header ── */}
        <div className="flex items-end justify-between mb-12 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Eyebrow tag */}
            <div className="inline-flex items-center gap-2 mb-3 rounded-full border border-[rgba(212,175,55,0.3)] bg-[rgba(212,175,55,0.08)] py-1 pl-2 pr-4">
              <span className="rounded-full bg-[#D4AF37] px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#1A1A1A]">
                Live
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8B7340]">
                Most Loved This Week
              </span>
            </div>

            <h2
              className="text-3xl md:text-4xl font-black text-[#1A1A1A] leading-[1.1]"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              Trending Now
            </h2>

            {/* Gold underline — matches hero */}
            <motion.div
              initial={{ scaleX: 0, originX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="mt-2 h-0.75 max-w-35 rounded-sm bg-[linear-gradient(90deg,#D4AF37,#C8622A,transparent)]"
            />

            <p className="mt-3 text-[14px] text-[#888] hidden md:block tracking-wide">
              Outfits renters are loving right now
            </p>
          </motion.div>

          {/* Desktop: dot count indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="hidden md:flex items-center gap-1.5"
          >
            {trendingListings.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: 6,
                  height: 6,
                  background: "#D4AF37",
                  opacity: 0.25 + (i * 0.25),
                }}
              />
            ))}
          </motion.div>

          {/* Mobile: nav arrows */}
          <div className="md:hidden flex gap-2">
            <MagneticNavBtn
              onClick={handlePrev}
              disabled={carouselIndex === 0}
              className="w-10 h-10 rounded-full border border-[#D4AF37] text-[#00342B] flex items-center justify-center text-lg font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-colors hover:bg-[rgba(212,175,55,0.1)]"
            >
              ‹
            </MagneticNavBtn>
            <MagneticNavBtn
              onClick={handleNext}
              disabled={carouselIndex === maxCarouselIndex}
              className="w-10 h-10 rounded-full border border-[#D4AF37] text-[#00342B] flex items-center justify-center text-lg font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-colors hover:bg-[rgba(212,175,55,0.1)]"
            >
              ›
            </MagneticNavBtn>
          </div>
        </div>

        {/* ── Mobile Carousel ── */}
        <div
          className="md:hidden mb-8 overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ touchAction: "pan-y" }}
        >
          <div
            className="flex gap-4 transition-transform duration-300 ease-out"
            style={{ transform: `translateX(calc(${-carouselIndex} * (100% + 1rem)))` }}
          >
            {trendingListings.map((listing, i) => (
              <motion.div
                key={listing._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="shrink-0 w-full"
              >
                <ListingCard listing={listing} />
              </motion.div>
            ))}
          </div>

          {/* Mobile dot indicators */}
          <div className="flex justify-center gap-2 mt-5">
            {trendingListings.map((_, i) => (
              <button
                key={i}
                onClick={() => setCarouselIndex(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === carouselIndex ? 20 : 6,
                  height: 6,
                  background: i === carouselIndex ? "#D4AF37" : "rgba(212,175,55,0.3)",
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Desktop Grid ── */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingListings.map((listing, i) => (
            <motion.div
              key={listing._id}
              initial={{ opacity: 0, y: 32, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -6 }}
            >
              <ListingCard listing={listing} />
            </motion.div>
          ))}
        </div>

        {/* ── Bottom accent strip (matches hero social proof palette) ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-14 flex flex-wrap justify-center gap-6 md:gap-10 pt-8 border-t border-[rgba(212,175,55,0.2)]"
        >
          {[
            { icon: "🔥", label: "Updated Daily" },
            { icon: "⭐", label: "Top Rated Picks" },
            { icon: "💫", label: "Verified Quality" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.55 + i * 0.08 }}
              className="flex items-center gap-2"
            >
              <span className="text-base text-[#D4AF37]">{item.icon}</span>
              <span className="text-[12px] font-semibold uppercase tracking-widest text-[#888]">
                {item.label}
              </span>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default TrendingNowSection;