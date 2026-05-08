import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  useMotionTemplate,
} from "motion/react";
import { getOptimizedImageUrl } from "../../services/cloudinary";

// ─── Floating Fabric Particle System ─────────────────────────────────────────
const AMBIENT_GLOWS = [
  {
    id: "emerald",
    size: "min(46vw, 620px)",
    style: {
      top: "-16%",
      left: "-12%",
      background:
        "radial-gradient(circle, rgba(0,52,43,0.22) 0%, rgba(0,52,43,0.14) 34%, rgba(0,52,43,0) 72%)",
    },
    animate: {
      x: [0, 34, -10, 0],
      y: [0, 22, 8, 0],
      scale: [1, 1.08, 0.97, 1],
      opacity: [0.7, 0.92, 0.78, 0.7],
    },
    transition: { duration: 22, repeat: Infinity, ease: "easeInOut" },
  },
  {
    id: "gold",
    size: "min(40vw, 500px)",
    style: {
      right: "-10%",
      bottom: "-16%",
      background:
        "radial-gradient(circle, rgba(212,175,55,0.24) 0%, rgba(212,175,55,0.14) 30%, rgba(212,175,55,0) 72%)",
    },
    animate: {
      x: [0, -28, 12, 0],
      y: [0, -24, -8, 0],
      scale: [1, 0.94, 1.06, 1],
      opacity: [0.62, 0.86, 0.72, 0.62],
    },
    transition: { duration: 20, repeat: Infinity, ease: "easeInOut" },
  },
  {
    id: "terracotta",
    size: "min(34vw, 420px)",
    style: {
      top: "30%",
      left: "28%",
      background:
        "radial-gradient(circle, rgba(200,98,42,0.16) 0%, rgba(200,98,42,0.1) 34%, rgba(200,98,42,0) 72%)",
    },
    animate: {
      x: [0, 18, -22, 0],
      y: [0, -16, 14, 0],
      scale: [1, 1.05, 0.95, 1],
      opacity: [0.4, 0.54, 0.44, 0.4],
    },
    transition: { duration: 24, repeat: Infinity, ease: "easeInOut" },
  },
];

const BACKGROUND_ACCENTS = [
  {
    id: "glass-panel",
    variant: "glass-panel",
    width: "min(24vw, 290px)",
    height: "min(28vw, 340px)",
    position: { top: "8%", right: "7%" },
    moveX: 28,
    moveY: 18,
    rotate: -12,
    floatRotate: 4,
    duration: 20,
    opacity: 0.84,
    style: {
      borderRadius: 36,
      background:
        "linear-gradient(160deg, rgba(255,255,255,0.58) 0%, rgba(255,255,255,0.16) 34%, rgba(255,255,255,0.05) 100%)",
      border: "1px solid rgba(255,255,255,0.62)",
      boxShadow: "0 30px 80px rgba(0,52,43,0.1)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
    },
  },
  {
    id: "ring",
    variant: "ring",
    width: "min(28vw, 360px)",
    height: "min(28vw, 360px)",
    position: { bottom: "0%", left: "-4%" },
    moveX: 22,
    moveY: 18,
    rotate: 0,
    floatRotate: 0,
    duration: 24,
    opacity: 0.72,
    style: {
      borderRadius: "50%",
      background:
        "radial-gradient(circle, rgba(255,255,255,0) 56%, rgba(0,52,43,0.14) 57%, rgba(0,52,43,0.06) 63%, rgba(255,255,255,0) 66%), radial-gradient(circle at 58% 42%, rgba(212,175,55,0.18), rgba(212,175,55,0) 38%)",
      border: "1px solid rgba(0,52,43,0.08)",
      boxShadow: "inset 0 0 40px rgba(255,255,255,0.26)",
    },
  },
  {
    id: "beam",
    variant: "beam",
    width: "min(42vw, 540px)",
    height: "min(12vw, 140px)",
    position: { top: "56%", left: "18%" },
    moveX: 16,
    moveY: 12,
    rotate: -10,
    floatRotate: 2,
    duration: 18,
    opacity: 0.78,
    style: {
      borderRadius: 999,
      background:
        "linear-gradient(90deg, rgba(212,175,55,0), rgba(212,175,55,0.18), rgba(255,255,255,0.56), rgba(200,98,42,0.16), rgba(212,175,55,0))",
      filter: "blur(5px)",
    },
  },
  {
    id: "halo-panel",
    variant: "halo-panel",
    width: "min(18vw, 220px)",
    height: "min(18vw, 220px)",
    position: { top: "18%", left: "44%" },
    moveX: 14,
    moveY: 10,
    rotate: 14,
    floatRotate: -3,
    duration: 16,
    opacity: 0.74,
    desktopOnly: true,
    style: {
      borderRadius: 30,
      background:
        "linear-gradient(160deg, rgba(255,255,255,0.38), rgba(255,255,255,0.04))",
      border: "1px solid rgba(255,255,255,0.48)",
      boxShadow: "0 18px 50px rgba(212,175,55,0.12)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
    },
  },
];

const BACKGROUND_POINTS = [
  {
    id: "point-1",
    top: "18%",
    left: "34%",
    size: 8,
    color: "rgba(0,52,43,0.28)",
    ring: "rgba(0,52,43,0.06)",
    moveX: 10,
    moveY: 8,
    duration: 5.8,
    delay: 0.2,
  },
  {
    id: "point-2",
    top: "24%",
    left: "70%",
    size: 10,
    color: "rgba(212,175,55,0.34)",
    ring: "rgba(212,175,55,0.08)",
    moveX: 14,
    moveY: 10,
    duration: 6.4,
    delay: 0.8,
  },
  {
    id: "point-3",
    top: "42%",
    left: "22%",
    size: 6,
    color: "rgba(200,98,42,0.3)",
    ring: "rgba(200,98,42,0.08)",
    moveX: 12,
    moveY: 9,
    duration: 5.6,
    delay: 1.3,
  },
  {
    id: "point-4",
    top: "62%",
    left: "58%",
    size: 9,
    color: "rgba(0,52,43,0.24)",
    ring: "rgba(0,52,43,0.06)",
    moveX: 16,
    moveY: 12,
    duration: 6.9,
    delay: 0.5,
  },
  {
    id: "point-5",
    top: "70%",
    left: "78%",
    size: 7,
    color: "rgba(212,175,55,0.3)",
    ring: "rgba(212,175,55,0.08)",
    moveX: 12,
    moveY: 10,
    duration: 5.9,
    delay: 1,
  },
];

// ─── Animated Counter ──────────────────────────────────────────────────────────
function AnimatedCounter({ to, suffix = "", prefix = "" }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let start = 0;
          const step = to / 60;
          const timer = setInterval(() => {
            start += step;
            if (start >= to) {
              setVal(to);
              clearInterval(timer);
            } else {
              setVal(Math.floor(start));
            }
          }, 16);
        }
      },
      { threshold: 0.5 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [to]);
  return (
    <span ref={ref}>
      {prefix}
      {val}
      {suffix}
    </span>
  );
}

// ─── Magnetic Button ───────────────────────────────────────────────────────────
function MagneticButton({ children, className, onClick, style }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 20 });
  const sy = useSpring(y, { stiffness: 300, damping: 20 });
  const ref = useRef(null);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.35);
    y.set((e.clientY - cy) * 0.35);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ x: sx, y: sy, ...style }}
      whileTap={{ scale: 0.96 }}
      className={className}
    >
      {children}
    </motion.button>
  );
}

// ─── Glitch Text ───────────────────────────────────────────────────────────────
function GlitchWord({ word, delay = 0 }) {
  return (
    <motion.span
      className="relative inline-block"
      initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{
        duration: 0.7,
        delay: delay / 1000,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {word}
    </motion.span>
  );
}

// ─── Canvas Cloth ─────────────────────────────────────────────────────────────
function FloatingAccent({ accent, mouseX, mouseY, isMobile }) {
  const x = useTransform(mouseX, [0, 1], [-accent.moveX, accent.moveX]);
  const y = useTransform(mouseY, [0, 1], [-accent.moveY, accent.moveY]);
  const baseOpacity = accent.opacity ?? 1;

  if (isMobile && accent.desktopOnly) return null;

  return (
    <motion.div
      className="pointer-events-none absolute z-1"
      style={{ x, y, ...accent.position }}
    >
      <motion.div
        animate={{
          y: [0, -10, 0],
          rotate: [
            accent.rotate,
            accent.rotate + (accent.floatRotate ?? 0),
            accent.rotate,
          ],
          scale: [1, 1.03, 0.98, 1],
          opacity: [baseOpacity, Math.min(baseOpacity + 0.08, 1), baseOpacity],
        }}
        transition={{
          duration: accent.duration,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative"
        style={{
          width: accent.width,
          height: accent.height,
          opacity: baseOpacity,
          ...accent.style,
        }}
      >
        {accent.variant === "glass-panel" && (
          <>
            <div className="absolute inset-4.5 rounded-[28px] border border-white/20" />
            <div className="absolute left-7 right-7 top-[26%] h-px bg-[linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,0.82),rgba(255,255,255,0))]" />
            <div className="absolute bottom-7.5 left-7 h-22.5 w-22.5 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.26),rgba(212,175,55,0))]" />
          </>
        )}

        {accent.variant === "halo-panel" && (
          <>
            <div className="absolute inset-4 rounded-3xl border border-[rgba(0,52,43,0.1)]" />
            <div className="absolute left-[24%] top-[24%] h-[52%] w-[52%] rounded-full bg-[radial-gradient(circle,rgba(0,52,43,0.16),rgba(0,52,43,0))]" />
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

function FloatingPoint({ point, mouseX, mouseY }) {
  const x = useTransform(mouseX, [0, 1], [-point.moveX, point.moveX]);
  const y = useTransform(mouseY, [0, 1], [-point.moveY, point.moveY]);

  return (
    <motion.div
      animate={{
        scale: [1, 1.35, 1],
        opacity: [0.48, 0.95, 0.48],
      }}
      transition={{
        duration: point.duration,
        delay: point.delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="pointer-events-none absolute z-1 rounded-full"
      style={{
        top: point.top,
        left: point.left,
        width: point.size,
        height: point.size,
        background: point.color,
        boxShadow: `0 0 0 8px ${point.ring}`,
        x,
        y,
      }}
    />
  );
}

function AmbientGlowBackground({ mouseX, mouseY, isMobile }) {
  const spotlightX = useTransform(mouseX, [0, 1], ["16%", "84%"]);
  const spotlightY = useTransform(mouseY, [0, 1], ["18%", "82%"]);
  const echoX = useTransform(mouseX, [0, 1], ["78%", "26%"]);
  const echoY = useTransform(mouseY, [0, 1], ["20%", "72%"]);
  const gridX = useTransform(mouseX, [0, 1], [-12, 12]);
  const gridY = useTransform(mouseY, [0, 1], [-8, 8]);
  const traceX = useTransform(mouseX, [0, 1], [-18, 18]);
  const traceY = useTransform(mouseY, [0, 1], [-12, 12]);

  const spotlight = useMotionTemplate`radial-gradient(circle at ${spotlightX} ${spotlightY}, rgba(255,255,255,0.94) 0%, rgba(255,255,255,0.52) 14%, rgba(255,255,255,0.14) 28%, rgba(255,255,255,0) 42%)`;
  const echoGlow = useMotionTemplate`radial-gradient(circle at ${echoX} ${echoY}, rgba(0,52,43,0.18) 0%, rgba(0,52,43,0.08) 18%, rgba(0,52,43,0) 40%)`;
  const mask =
    "linear-gradient(180deg, transparent 0%, black 16%, black 80%, transparent 100%), linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)";

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 16% 18%, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0) 32%), radial-gradient(circle at 68% 28%, rgba(255,255,255,0.52) 0%, rgba(255,255,255,0) 22%), linear-gradient(140deg, rgba(255,255,255,0.58) 0%, rgba(255,255,255,0.12) 40%, rgba(240,232,219,0.3) 100%)",
        }}
      />

      <motion.div
        className="absolute inset-[-12%]"
        style={{
          background: spotlight,
          opacity: isMobile ? 0.65 : 1,
        }}
      />

      <motion.div
        className="absolute inset-[-16%]"
        style={{
          background: echoGlow,
          opacity: 0.94,
        }}
      />

      <motion.div
        className="absolute inset-[10%_6%_12%] opacity-20"
        style={{
          x: gridX,
          y: gridY,
          backgroundImage:
            "linear-gradient(rgba(0,52,43,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,52,43,0.06) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage: mask,
          WebkitMaskImage: mask,
        }}
      />

      {AMBIENT_GLOWS.map((glow) => (
        <motion.div
          key={glow.id}
          animate={glow.animate}
          transition={glow.transition}
          className="absolute rounded-full blur-[18px]"
          style={{
            width: glow.size,
            height: glow.size,
            ...glow.style,
          }}
        />
      ))}

      {BACKGROUND_ACCENTS.map((accent) => (
        <FloatingAccent
          key={accent.id}
          accent={accent}
          mouseX={mouseX}
          mouseY={mouseY}
          isMobile={isMobile}
        />
      ))}

      {BACKGROUND_POINTS.map((point) => (
        <FloatingPoint
          key={point.id}
          point={point}
          mouseX={mouseX}
          mouseY={mouseY}
        />
      ))}

      <motion.div
        animate={{ opacity: [0.3, 0.66, 0.3] }}
        transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute left-[12%] right-[40%] top-[33%] h-px"
        style={{
          x: traceX,
          y: traceY,
          background:
            "linear-gradient(90deg, rgba(0,52,43,0), rgba(0,52,43,0.18), rgba(255,255,255,0.82), rgba(212,175,55,0.12), rgba(0,52,43,0))",
        }}
      />

      <motion.div
        animate={{ opacity: [0.22, 0.5, 0.22] }}
        transition={{
          duration: 8.2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.2,
        }}
        className="pointer-events-none absolute bottom-[20%] left-[68%] top-[22%] w-px"
        style={{
          x: useTransform(mouseX, [0, 1], [-10, 10]),
          y: useTransform(mouseY, [0, 1], [-18, 18]),
          background:
            "linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,0.75), rgba(212,175,55,0.14), rgba(255,255,255,0))",
        }}
      />

      <motion.div
        animate={{
          x: ["-4%", "6%", "-2%", "-4%"],
          y: [0, -10, 8, 0],
          opacity: [0.3, 0.44, 0.34, 0.3],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-[16%_14%_auto_12%] h-[44%] rounded-full blur-[22px]"
        style={{
          background:
            "linear-gradient(115deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.08) 42%, rgba(255,255,255,0.36) 100%)",
          transform: "rotate(-8deg)",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(250,247,242,0) 0%, rgba(250,247,242,0.28) 48%, rgba(245,239,230,0.9) 100%)",
        }}
      />
    </div>
  );
}

// ─── 3D Tilt Card ─────────────────────────────────────────────────────────────
function TiltCard({ children, style }) {
  const rotX = useSpring(0, { stiffness: 180, damping: 22 });
  const rotY = useSpring(0, { stiffness: 180, damping: 22 });
  const scale = useSpring(1, { stiffness: 180, damping: 22 });

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    rotX.set(-y * 12);
    rotY.set(x * 12);
    scale.set(1.02);
  };

  const handleLeave = () => {
    rotX.set(0);
    rotY.set(0);
    scale.set(1);
  };

  return (
    <motion.div
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        rotateX: rotX,
        rotateY: rotY,
        scale,
        transformStyle: "preserve-3d",
        perspective: 800,
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}

// ─── Trust Badge ──────────────────────────────────────────────────────────────
function TrustBadge({ icon, label, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5, type: "spring", stiffness: 200 }}
      className="flex min-w-20 flex-col items-center gap-1.5 rounded-xl border border-[rgba(212,175,55,0.2)] bg-white/70 px-4 py-3 backdrop-blur-md"
    >
      <span className="text-[20px]">{icon}</span>
      <span className="text-center text-[9px] font-semibold uppercase leading-[1.3] tracking-widest text-[#00342B]">
        {label}
      </span>
    </motion.div>
  );
}

// ─── Stacked Outfit Images (SVG placeholder visualization) ────────────────────
const FALLBACK_SHOWCASE = [
  {
    id: null,
    title: "Bridal Lehenga",
    category: "Lehenga",
    pricePerDay: 800,
    image: "",
    location: "Mumbai",
    rotate: -8,
    x: -24,
    color: "#8B4513",
  },
  {
    id: null,
    title: "Regal Sherwani",
    category: "Sherwani",
    pricePerDay: 1100,
    image: "",
    location: "Bandra",
    rotate: 2,
    x: 0,
    color: "#00342B",
  },
  {
    id: null,
    title: "Festive Silk Saree",
    category: "Saree",
    pricePerDay: 900,
    image: "",
    location: "Juhu",
    rotate: 9,
    x: 24,
    color: "#C8622A",
  },
];

const LOADING_SHOWCASE = [
  {
    id: "loading-1",
    title: "Loading outfit...",
    category: "Curated",
    pricePerDay: "--",
    image: "",
    location: "Mumbai",
    rotate: -8,
    x: -24,
    color: "#8B4513",
  },
  {
    id: "loading-2",
    title: "Loading outfit...",
    category: "Curated",
    pricePerDay: "--",
    image: "",
    location: "Mumbai",
    rotate: 2,
    x: 0,
    color: "#00342B",
  },
  {
    id: "loading-3",
    title: "Loading outfit...",
    category: "Curated",
    pricePerDay: "--",
    image: "",
    location: "Mumbai",
    rotate: 9,
    x: 24,
    color: "#C8622A",
  },
];

const getListingLocation = (listing) => {
  if (listing?.location?.area) {
    return `${listing.location.area}, ${listing.location.city || "Mumbai"}`;
  }
  return listing?.location || "Mumbai";
};

const buildShowcaseCards = (listings = []) => {
  const realCards = listings
    .filter((listing) => listing?._id || listing?.id)
    .sort(
      (a, b) => Number(Boolean(b.images?.[0])) - Number(Boolean(a.images?.[0])),
    )
    .slice(0, 3)
    .map((listing, index) => ({
      id: listing._id || listing.id,
      title: listing.title || "Designer Outfit",
      category: listing.category || "Curated",
      pricePerDay: listing.pricePerDay || 800,
      image: listing.images?.[0] || "",
      location: getListingLocation(listing),
      rotate: [-8, 2, 9][index],
      x: [-24, 0, 24][index],
      color: ["#8B4513", "#00342B", "#C8622A"][index],
    }));

  return realCards.length ? realCards : FALLBACK_SHOWCASE;
};

function OutfitShowcase({
  compact = false,
  listings = [],
  loading = false,
  onSelectListing,
}) {
  const [hovered, setHovered] = useState(null);
  const config = compact
    ? {
        containerWidth: 272,
        containerHeight: 368,
        cardWidth: 212,
        cardHeight: 292,
        leftBase: 16,
        priceRight: -4,
        reviewsLeft: -8,
      }
    : {
        containerWidth: 392,
        containerHeight: 520,
        cardWidth: 312,
        cardHeight: 424,
        leftBase: 32,
        priceRight: -8,
        reviewsLeft: -16,
      };

  const hasRealListings = listings.some(
    (listing) => listing?._id || listing?.id,
  );
  const cards = hasRealListings
    ? buildShowcaseCards(listings)
    : loading
      ? LOADING_SHOWCASE
      : FALLBACK_SHOWCASE;
  return (
    <div
      className="relative mx-auto"
      style={{
        width: `min(${config.containerWidth}px, 82vw)`,
        height: `min(${config.containerHeight}px, 92vw)`,
      }}
    >
      {cards.map((card, i) => (
        <motion.div
          key={`showcase-slot-${i}`}
          role="button"
          tabIndex={0}
          onClick={() => {
            if (!loading) onSelectListing(card.id);
          }}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !loading)
              onSelectListing(card.id);
          }}
          onHoverStart={() => setHovered(i)}
          onHoverEnd={() => setHovered(null)}
          initial={{ opacity: 0, y: 60, rotate: card.rotate }}
          animate={{
            opacity: 1,
            y: 0,
            rotate: card.rotate,
            x: card.x,
            z: hovered === i ? 50 : i * 5,
            scale: 1,
          }}
          transition={{
            delay: 0.8 + i * 0.12,
            duration: 0.8,
            type: "spring",
            stiffness: 120,
          }}
          className={`absolute flex cursor-pointer flex-col justify-end overflow-hidden border border-white/15 ${compact ? "rounded-[20px] p-5" : "rounded-3xl p-6"}`}
          style={{
            top: i * (compact ? 12 : 16),
            left: i * (compact ? 6 : 10) + config.leftBase,
            width: `min(${config.cardWidth}px, 64vw)`,
            height: `min(${config.cardHeight}px, 76vw)`,
            background: `linear-gradient(145deg, ${card.color}, ${card.color}dd)`,
            boxShadow:
              hovered === i
                ? "0 32px 64px rgba(0,0,0,0.3)"
                : "0 8px 32px rgba(0,0,0,0.2)",
          }}
        >
          {card.image ? (
            <motion.img
              src={getOptimizedImageUrl(card.image, {
                width: compact ? 360 : 520,
                height: compact ? 500 : 700,
              })}
              alt={card.title}
              loading={i === 0 ? "eager" : "lazy"}
              animate={{ scale: hovered === i ? 1.08 : 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: loading
                  ? "linear-gradient(110deg, rgba(255,255,255,0.12), rgba(212,175,55,0.24), rgba(255,255,255,0.12))"
                  : `radial-gradient(circle at 50% 24%, rgba(212,175,55,0.42), transparent 34%), linear-gradient(145deg, ${card.color}, ${card.color}dd)`,
              }}
            />
          )}

          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04)_12%,rgba(0,0,0,0.1)_45%,rgba(0,0,0,0.72)_100%)]" />
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_3px,rgba(255,255,255,0.03)_3px,rgba(255,255,255,0.03)_6px)]" />

          {/* Card info */}
          <div className="relative z-2">
            <div
              className={`flex items-center justify-between gap-2 ${compact ? "mb-2" : "mb-2.5"}`}
            >
              <span
                className={`${compact ? "text-[9px]" : "text-[12px]"} font-extrabold uppercase tracking-[0.18em] text-[#D4AF37]`}
              >
                {card.category}
              </span>
              <span
                className={`${compact ? "px-2 py-1 text-[10px]" : "px-2.5 py-1.5 text-[13px]"} whitespace-nowrap rounded-full bg-[#D4AF37] font-extrabold text-[#1A1A1A]`}
              >
                {loading ? "Loading" : `Rs ${card.pricePerDay}/day`}
              </span>
            </div>
            <div
              className={`${compact ? "mb-1.75 text-[15px]" : "mb-2.5 text-[24px]"} font-serif font-extrabold leading-[1.12] text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.35)]`}
            >
              {card.title}
            </div>
            <div className="flex items-center justify-between gap-2">
              <span
                className={`${compact ? "text-[10px]" : "text-[13px]"} truncate whitespace-nowrap font-semibold text-[rgba(255,255,255,0.82)]`}
              >
                {card.location}
              </span>
              <motion.span
                animate={{ x: hovered === i ? 3 : 0 }}
                className={`${compact ? "text-[11px]" : "text-[13px]"} whitespace-nowrap font-extrabold text-[#FAF7F2]`}
              >
                {loading ? "Loading..." : "View ->"}
              </motion.span>
            </div>
          </div>

          {/* Gold shimmer line */}
          <motion.div
            animate={{ x: hovered === i ? "200%" : "-100%" }}
            transition={{ duration: 0.8 }}
            className="absolute left-0 top-0 h-full w-[60%] -skew-x-20 bg-[linear-gradient(90deg,transparent,rgba(212,175,55,0.15),transparent)]"
          />
        </motion.div>
      ))}

      {/* Floating price badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0, x: 20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ delay: 1.5, type: "spring" }}
        className={`${compact ? "px-3 py-1.75 text-[11px]" : "px-3.5 py-2 text-[14px]"} absolute z-10 whitespace-nowrap rounded-full bg-[#D4AF37] font-bold tracking-[0.05em] text-[#1A1A1A] shadow-[0_4px_20px_rgba(212,175,55,0.4)]`}
        style={{
          top: compact ? -10 : -16,
          right: config.priceRight,
        }}
      >
        {loading
          ? "Fetching outfits..."
          : `${Math.max(listings.length, 120)}+ Outfits`}
      </motion.div>

      {/* Reviews badge */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.8 }}
        className={`${compact ? "min-w-26 px-3 py-2" : "min-w-36 px-4 py-3"} absolute z-10 rounded-[14px] border border-[rgba(0,52,43,0.12)] bg-[rgba(255,255,255,0.92)] backdrop-blur-[10px]`}
        style={{
          bottom: compact ? 10 : 16,
          left: config.reviewsLeft,
        }}
      >
        <div className="mb-1 flex gap-0.5">
          {[1, 2, 3, 4, 5].map((s) => (
            <span
              key={s}
              style={{ fontSize: compact ? 10 : 12, color: "#D4AF37" }}
            >
              ★
            </span>
          ))}
        </div>
        <div
          className={`${compact ? "text-[10px]" : "text-[12px]"} font-bold text-[#00342B]`}
        >
          340+ Happy Renters
        </div>
        <div style={{ fontSize: compact ? 9 : 10, color: "#888" }}>
          Avg ₹4,200 savings
        </div>
      </motion.div>
    </div>
  );
}

// ─── MAIN HERO ────────────────────────────────────────────────────────────────
// NOTE: CursorFollower has been removed from here — it is now mounted globally
// in App.jsx so it persists across all pages and sections.
export default function HeroSection({ listings = [], loading = false }) {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const parallaxX = useTransform(mouseX, [0, 1], [-20, 20]);
  const parallaxY = useTransform(mouseY, [0, 1], [-12, 12]);
  const [viewportWidth, setViewportWidth] = useState(
    typeof window === "undefined" ? 1280 : window.innerWidth,
  );
  const isMobile = viewportWidth < 768;
  const isTablet = viewportWidth >= 768 && viewportWidth < 1100;

  useEffect(() => {
    const handleMouse = (e) => {
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const goToCollection = () => navigate("/collection");
  const goToCreateListing = () => navigate("/create");
  const goToListing = (listingId) =>
    navigate(listingId ? `/listing/${listingId}` : "/collection");

  return (
    <div className="overflow-hidden bg-[#FAF7F2] font-sans">
      {/* ── MAIN HERO SECTION ─────────────────────────────── */}
      <section
        ref={heroRef}
        className={`relative flex items-center overflow-hidden bg-[linear-gradient(135deg,#FBF8F3_0%,#F7F1E7_52%,#EFE4D4_100%)] ${
          isMobile
            ? "pb-10 pt-18"
            : isTablet
              ? "min-h-[92vh] pb-13 pt-20"
              : "min-h-[92vh] pb-15 pt-25"
        }`}
      >
        <AmbientGlowBackground
          mouseX={mouseX}
          mouseY={mouseY}
          isMobile={isMobile}
        />

        {/* Large decorative letter */}
        <motion.div
          className={`${isMobile ? "hidden" : "block"} pointer-events-none absolute right-[-2%] top-[8%] z-1 select-none font-serif text-[clamp(180px,28vw,380px)] font-black leading-none text-[rgba(0,52,43,0.05)]`}
          style={{ x: parallaxX, y: parallaxY }}
        >
          L
        </motion.div>

        {/* Content wrapper */}
        <div
          className={`relative z-2 mx-auto w-full max-w-300 ${isMobile ? "px-4" : "px-6"}`}
        >
          <div
            className={`grid items-center ${isMobile ? "grid-cols-1" : "grid-cols-[1fr_auto]"} ${isMobile ? "gap-7" : "gap-12"}`}
          >
            {/* ── LEFT COLUMN ─────────────────────────────── */}
            <div
              className={`${isMobile ? "order-2 max-w-full" : "order-1 max-w-150"} ${isMobile ? "text-center" : "text-left"}`}
            >
              {/* Tag line */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className={`mb-6 inline-flex items-center gap-2.5 rounded-full border border-[rgba(212,175,55,0.3)] bg-[rgba(212,175,55,0.1)] py-1.5 pl-2 pr-4 ${isMobile ? "mx-auto" : "mx-0"}`}
              >
                <span className="rounded-[30px] bg-[#D4AF37] px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#1A1A1A]">
                  New
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8B7340]">
                  The Curated Heritage Platform
                </span>
              </motion.div>

              {/* Headline */}
              <h1 className="mb-2 font-serif text-[clamp(34px,8vw,72px)] font-black leading-[1.06] tracking-[-0.02em] text-[#1A1A1A]">
                <div className="mb-0.5 overflow-hidden">
                  <GlitchWord word="Rent" delay={200} />
                  <span className="text-[#00342B]"> Mumbai&apos;s</span>
                </div>
                <div className="mb-0.5 overflow-hidden">
                  <GlitchWord word="Finest" delay={350} />
                  <span className="text-[#C8622A]"> Ethnic</span>
                </div>
                <div className="overflow-hidden">
                  <GlitchWord word="Couture" delay={500} />
                </div>
              </h1>

              {/* Gold underline */}
              <motion.div
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  delay: 1.1,
                  duration: 0.7,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`mb-6 h-0.75 max-w-80 rounded-sm bg-[linear-gradient(90deg,#D4AF37,#C8622A,transparent)] ${isMobile ? "mx-auto" : "mx-0"}`}
              />

              {/* Sub text */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className={`mb-9 max-w-120 text-[clamp(14px,1.6vw,17px)] leading-[1.7] text-[#666] ${isMobile ? "mx-auto" : "mx-0"}`}
              >
                Experience designer lehengas, sherwanis & sarees without the
                lifetime cost. Sustainable luxury for Mumbai's social season —
                delivered to your door.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.05, duration: 0.6 }}
                className={`mb-10 flex flex-wrap gap-3.5 ${isMobile ? "justify-center" : "justify-start"}`}
              >
                <MagneticButton
                  onClick={goToCollection}
                  className={`relative overflow-hidden rounded-full bg-[#00342B] px-8 py-3.75 text-[14px] font-bold tracking-[0.08em] text-[#FAF7F2] shadow-[0_8px_32px_rgba(0,52,43,0.25)] ${isMobile ? "w-full max-w-[320px]" : "w-auto"}`}
                >
                  <span style={{ position: "relative", zIndex: 1 }}>
                    Explore Collection →
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(212,175,55,0.15),transparent)]"
                    style={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.5 }}
                  />
                </MagneticButton>

                <MagneticButton
                  onClick={goToCreateListing}
                  className={`rounded-full border-2 border-[#D4AF37] bg-transparent px-7 py-3.75 text-[14px] font-bold tracking-[0.06em] text-[#00342B] ${isMobile ? "w-full max-w-[320px]" : "w-auto"}`}
                >
                  + List Your Outfit
                </MagneticButton>
              </motion.div>

              {/* Stats row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3, duration: 0.6 }}
                className={`flex flex-wrap ${isMobile ? "justify-center gap-5.5" : "justify-start gap-8"}`}
              >
                {[
                  { value: 120, suffix: "+", label: "Outfits" },
                  { value: 340, suffix: "+", label: "Renters" },
                  { value: 4200, prefix: "₹", label: "Avg Savings" },
                ].map((stat, i) => (
                  <div key={i}>
                    <div className="font-serif text-[clamp(22px,3vw,34px)] font-black leading-none text-[#00342B]">
                      <AnimatedCounter
                        to={stat.value}
                        suffix={stat.suffix}
                        prefix={stat.prefix || ""}
                      />
                    </div>
                    <div className="mt-0.75 text-[11px] uppercase tracking-[0.12em] text-[#999]">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* ── RIGHT COLUMN: Outfit Cards ─────────────── */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: 0.5,
                duration: 0.9,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={`order-1 flex justify-center ${isMobile ? "mt-2" : "mt-0"}`}
              style={{
                x: useTransform(mouseX, [0, 1], [8, -8]),
                y: useTransform(mouseY, [0, 1], [4, -4]),
              }}
            >
              <TiltCard>
                <OutfitShowcase
                  compact={isMobile}
                  listings={listings}
                  loading={loading}
                  onSelectListing={goToListing}
                />
              </TiltCard>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        {!isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.2 }}
            className="absolute bottom-7 left-1/2 z-3 flex -translate-x-1/2 flex-col items-center gap-1.5"
          >
            <span className="text-[9px] uppercase tracking-[0.2em] text-[#999]">
              Scroll to explore
            </span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="h-8 w-px bg-[linear-gradient(to_bottom,#D4AF37,transparent)]"
            />
          </motion.div>
        )}
      </section>

      {/* ── SOCIAL PROOF STRIP ───────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className={`flex flex-wrap justify-center bg-[#00342B] ${isMobile ? "gap-5 px-4 py-7" : "gap-15 px-6 py-9"}`}
      >
        {[
          { emoji: "🏆", text: "Mumbai's #1 Ethnic Rental" },
          { emoji: "🌿", text: "100% Sustainable Fashion" },
          { emoji: "⭐", text: "4.9 / 5 Customer Rating" },
          { emoji: "⚡", text: "Same-Day Mumbai Delivery" },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-2.5"
          >
            <span
              className={`${isMobile ? "text-base" : "text-lg"} font-semibold text-[#D4AF37]`}
            >
              {item.emoji}
            </span>
            <span
              className={`${isMobile ? "text-[12px]" : "text-[13px]"} font-semibold tracking-[0.04em] text-white/85`}
            >
              {item.text}
            </span>
          </motion.div>
        ))}
      </motion.section>
    </div>
  );
}