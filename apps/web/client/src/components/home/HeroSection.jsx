import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useMotionValue, useTransform, useSpring } from "motion/react";

// ─── Floating Fabric Particle System ─────────────────────────────────────────
const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 4 + Math.random() * 12,
  delay: Math.random() * 4,
  duration: 6 + Math.random() * 8,
  opacity: 0.06 + Math.random() * 0.12,
  color: i % 3 === 0 ? "#D4AF37" : i % 3 === 1 ? "#00342B" : "#C8622A",
}));

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
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [to]);

  return (
    <span ref={ref}>
      {prefix}{val}{suffix}
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
      transition={{ duration: 0.7, delay: delay / 1000, ease: [0.16, 1, 0.3, 1] }}
    >
      {word}
    </motion.span>
  );
}

// ─── Canvas Cloth ─────────────────────────────────────────────────────────────
function SilkCanvas() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = canvas.offsetWidth;
    let h = canvas.offsetHeight;
    canvas.width = w;
    canvas.height = h;

    const resize = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w;
      canvas.height = h;
    };
    window.addEventListener("resize", resize);

    const draw = (t) => {
      timeRef.current = t * 0.0004;
      ctx.clearRect(0, 0, w, h);

      const cols = 12;
      const rows = 8;
      const cw = w / cols;
      const ch = h / rows;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cx = c * cw + cw / 2;
          const cy = r * ch + ch / 2;
          const wave = Math.sin(timeRef.current * 1.5 + c * 0.6 + r * 0.4) * 0.5 + 0.5;
          const wave2 = Math.cos(timeRef.current * 0.9 + c * 0.3 - r * 0.5) * 0.5 + 0.5;

          const r1 = Math.floor(0 + wave * 4);
          const g1 = Math.floor(52 + wave2 * 20);
          const b1 = Math.floor(43 + wave * 25);
          const alpha = 0.03 + wave * 0.05;

          ctx.fillStyle = `rgba(${r1},${g1},${b1},${alpha})`;
          ctx.beginPath();
          const rx = cw * 0.6 + wave * cw * 0.3;
          const ry = ch * 0.6 + wave2 * ch * 0.3;
          ctx.ellipse(cx, cy, rx, ry, timeRef.current + c * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Diagonal silk threads
      for (let i = 0; i < 6; i++) {
        const phase = timeRef.current + i * 1.1;
        const x0 = (i / 6) * w * 1.4 - w * 0.2 + Math.sin(phase * 0.7) * 30;
        const gradient = ctx.createLinearGradient(x0, 0, x0 - h * 0.4, h);
        gradient.addColorStop(0, `rgba(212,175,55,0)`);
        gradient.addColorStop(0.4, `rgba(212,175,55,${0.03 + Math.sin(phase) * 0.02})`);
        gradient.addColorStop(0.6, `rgba(0,52,43,${0.04 + Math.cos(phase) * 0.02})`);
        gradient.addColorStop(1, `rgba(0,52,43,0)`);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x0, 0);
        for (let y = 0; y <= h; y += 20) {
          const xOff = Math.sin(timeRef.current * 0.8 + y * 0.015 + i) * 18;
          ctx.lineTo(x0 - y * 0.3 + xOff, y);
        }
        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute", inset: 0, width: "100%", height: "100%",
        opacity: 1, pointerEvents: "none",
      }}
    />
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
        rotateX: rotX, rotateY: rotY, scale,
        transformStyle: "preserve-3d",
        perspective: 800,
        ...style
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
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: 6, padding: "12px 16px",
        background: "rgba(255,255,255,0.7)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(212,175,55,0.2)",
        borderRadius: 12,
        minWidth: 80,
      }}
    >
      <span style={{ fontSize: 20 }}>{icon}</span>
      <span style={{ fontSize: 9, fontWeight: 600, color: "#00342B", letterSpacing: "0.1em", textTransform: "uppercase", textAlign: "center", lineHeight: 1.3 }}>{label}</span>
    </motion.div>
  );
}

// ─── Cursor Follower ──────────────────────────────────────────────────────────
function CursorFollower() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 80, damping: 15 });
  const sy = useSpring(y, { stiffness: 80, damping: 15 });
  const [active, setActive] = useState(false);

  useEffect(() => {
    const move = (e) => { x.set(e.clientX); y.set(e.clientY); };
    const down = () => setActive(true);
    const up = () => setActive(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
    };
  }, []);

  return (
    <>
      <motion.div style={{ x: sx, y: sy, position: "fixed", top: -20, left: -20, width: 40, height: 40, borderRadius: "50%", border: "1.5px solid rgba(212,175,55,0.5)", pointerEvents: "none", zIndex: 9999, scale: active ? 0.6 : 1, transition: "scale 0.15s" }} />
      <motion.div style={{ x, y, position: "fixed", top: -3, left: -3, width: 6, height: 6, borderRadius: "50%", background: "#D4AF37", pointerEvents: "none", zIndex: 9999 }} />
    </>
  );
}

// ─── Stacked Outfit Images (SVG placeholder visualization) ────────────────────
function OutfitShowcase({ compact = false }) {
  const [hovered, setHovered] = useState(null);
  const config = compact
    ? {
        containerWidth: 232,
        containerHeight: 320,
        cardWidth: 178,
        cardHeight: 246,
        leftBase: 12,
        priceRight: -4,
        reviewsLeft: -8,
      }
    : {
        containerWidth: 280,
        containerHeight: 380,
        cardWidth: 220,
        cardHeight: 300,
        leftBase: 20,
        priceRight: -10,
        reviewsLeft: -20,
      };

  const cards = [
    { label: "Lehenga", color: "#8B4513", accent: "#D4AF37", rotate: -8, x: -24, emoji: "🥻" },
    { label: "Sherwani", color: "#00342B", accent: "#D4AF37", rotate: 2, x: 0, emoji: "🧥" },
    { label: "Saree", color: "#C8622A", accent: "#FAF7F2", rotate: 9, x: 24, emoji: "🪭" },
  ];

  return (
    <div
      style={{
        position: "relative",
        width: `min(${config.containerWidth}px, 82vw)`,
        height: `min(${config.containerHeight}px, 92vw)`,
        margin: "0 auto",
      }}
    >
      {cards.map((card, i) => (
        <motion.div
          key={i}
          onHoverStart={() => setHovered(i)}
          onHoverEnd={() => setHovered(null)}
          initial={{ opacity: 0, y: 60, rotate: card.rotate }}
          animate={{
            opacity: 1, y: 0, rotate: hovered === i ? 0 : card.rotate,
            x: hovered === i ? 0 : card.x,
            z: hovered === i ? 50 : i * 5,
            scale: hovered === i ? 1.05 : 1,
          }}
          transition={{ delay: 0.8 + i * 0.12, duration: 0.8, type: "spring", stiffness: 120 }}
          style={{
            position: "absolute",
            top: i * 12,
            left: i * 6 + config.leftBase,
            width: `min(${config.cardWidth}px, 64vw)`,
            height: `min(${config.cardHeight}px, 76vw)`,
            borderRadius: 20,
            background: `linear-gradient(145deg, ${card.color}, ${card.color}dd)`,
            boxShadow: hovered === i ? "0 32px 64px rgba(0,0,0,0.3)" : "0 8px 32px rgba(0,0,0,0.2)",
            cursor: "pointer",
            overflow: "hidden",
            border: `1px solid rgba(255,255,255,0.15)`,
            display: "flex", flexDirection: "column",
            justifyContent: "flex-end", padding: 20,
          }}
        >
          {/* Fabric texture overlay */}
          <div style={{ position: "absolute", inset: 0, background: `repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.03) 3px, rgba(255,255,255,0.03) 6px)` }} />

          {/* Emoji icon */}
          <motion.div
            animate={{ y: hovered === i ? -8 : 0 }}
            style={{ position: "absolute", top: compact ? 22 : 30, left: "50%", transform: "translateX(-50%)", fontSize: compact ? 62 : 80, filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.3))" }}
          >
            {card.emoji}
          </motion.div>

          {/* Card info */}
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ fontSize: compact ? 9 : 10, fontWeight: 700, letterSpacing: "0.18em", color: card.accent, textTransform: "uppercase", marginBottom: 4 }}>{card.label}</div>
            <div style={{ fontSize: compact ? 12 : 13, color: "rgba(255,255,255,0.85)", fontFamily: "'Georgia', serif" }}>From ₹800/day</div>
          </div>

          {/* Gold shimmer line */}
          <motion.div
            animate={{ x: hovered === i ? "200%" : "-100%" }}
            transition={{ duration: 0.8 }}
            style={{ position: "absolute", top: 0, left: 0, width: "60%", height: "100%", background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.15), transparent)", transform: "skewX(-20deg)" }}
          />
        </motion.div>
      ))}

      {/* Floating price badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0, x: 20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ delay: 1.5, type: "spring" }}
        style={{
          position: "absolute", top: compact ? -10 : -16, right: config.priceRight,
          background: "#D4AF37", color: "#1A1A1A",
          padding: compact ? "7px 12px" : "8px 14px", borderRadius: 40,
          fontWeight: 700, fontSize: compact ? 11 : 12, letterSpacing: "0.05em",
          boxShadow: "0 4px 20px rgba(212,175,55,0.4)",
          zIndex: 10, whiteSpace: "nowrap",
        }}
      >
        ✨ 120+ Outfits
      </motion.div>

      {/* Reviews badge */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.8 }}
        style={{
          position: "absolute", bottom: compact ? 10 : 16, left: config.reviewsLeft,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(0,52,43,0.12)",
          padding: compact ? "8px 12px" : "10px 14px", borderRadius: 14,
          zIndex: 10, minWidth: compact ? 104 : 120,
        }}
      >
        <div style={{ display: "flex", gap: 2, marginBottom: 4 }}>
          {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: 10, color: "#D4AF37" }}>★</span>)}
        </div>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#00342B" }}>340+ Happy Renters</div>
        <div style={{ fontSize: 9, color: "#888" }}>Avg ₹4,200 savings</div>
      </motion.div>
    </div>
  );
}

// ─── MAIN HERO ────────────────────────────────────────────────────────────────
export default function HeroSection() {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const parallaxX = useTransform(mouseX, [0, 1], [-20, 20]);
  const parallaxY = useTransform(mouseY, [0, 1], [-12, 12]);
  const [mounted, setMounted] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(
    typeof window === "undefined" ? 1280 : window.innerWidth
  );
  const isMobile = viewportWidth < 768;
  const isTablet = viewportWidth >= 768 && viewportWidth < 1100;

  useEffect(() => {
    setMounted(true);
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

  const goToCollection = () => {
    navigate("/collection");
  };

  const goToCreateListing = () => {
    navigate("/create");
  };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", background: "#FAF7F2", overflow: "hidden" }}>
      {/* Custom cursor */}
      {!isMobile && <CursorFollower />}

      {/* ── MAIN HERO SECTION ─────────────────────────────── */}
      <section
        ref={heroRef}
        style={{
          position: "relative",
          minHeight: isMobile ? "auto" : "92vh",
          display: "flex",
          alignItems: "center",
          background: "linear-gradient(135deg, #FAF7F2 0%, #F5EFE6 50%, #F0E8DB 100%)",
          overflow: "hidden",
          padding: isMobile ? "56px 0 40px" : isTablet ? "68px 0 52px" : "80px 0 60px",
        }}
      >
        {/* Animated silk canvas background */}
        <SilkCanvas />

        {/* Floating particles */}
        {mounted && PARTICLES.map((p) => (
          <motion.div
            key={p.id}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: p.color,
              opacity: p.opacity,
              pointerEvents: "none",
              zIndex: 1,
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, Math.sin(p.id) * 20, 0],
              scale: [1, 1.3, 1],
              opacity: [p.opacity, p.opacity * 2, p.opacity],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Large decorative letter */}
        <motion.div
          style={{
            position: "absolute", right: "-2%", top: "8%",
            fontFamily: "'Georgia', serif",
            fontSize: "clamp(180px, 28vw, 380px)",
            fontWeight: 900,
            color: "rgba(0,52,43,0.04)",
            lineHeight: 1,
            pointerEvents: "none",
            userSelect: "none",
            zIndex: 1,
            x: parallaxX,
            y: parallaxY,
            display: isMobile ? "none" : "block",
          }}
        >
          L
        </motion.div>

        {/* Content wrapper */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "0 16px" : "0 24px", width: "100%", position: "relative", zIndex: 2 }}>
          <div style={{ display: "grid", gridTemplateColumns: isTablet || isMobile ? "1fr" : "1fr auto", gap: isMobile ? 28 : 48, alignItems: "center" }}>

            {/* ── LEFT COLUMN ─────────────────────────────── */}
            <div style={{ maxWidth: isTablet || isMobile ? "100%" : 600, textAlign: isMobile ? "center" : "left" }}>
              {/* Tag line */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  marginBottom: 24,
                  padding: "6px 16px 6px 8px",
                  background: "rgba(212,175,55,0.1)",
                  border: "1px solid rgba(212,175,55,0.3)",
                  borderRadius: 40,
                  marginInline: isMobile ? "auto" : 0,
                }}
              >
                <span style={{ padding: "2px 10px", background: "#D4AF37", borderRadius: 30, fontSize: 9, fontWeight: 800, letterSpacing: "0.15em", color: "#1A1A1A", textTransform: "uppercase" }}>New</span>
                <span style={{ fontSize: 11, letterSpacing: "0.12em", color: "#8B7340", fontWeight: 600, textTransform: "uppercase" }}>The Curated Heritage Platform</span>
              </motion.div>

              {/* Headline */}
              <h1 style={{ fontFamily: "'Georgia', serif", fontSize: isMobile ? "clamp(34px, 10.4vw, 48px)" : "clamp(38px, 5.5vw, 72px)", fontWeight: 900, lineHeight: 1.06, color: "#1A1A1A", margin: "0 0 8px", letterSpacing: "-0.02em" }}>
                <div style={{ overflow: "hidden", marginBottom: 2 }}>
                  <GlitchWord word="Rent" delay={200} />
                  <span style={{ color: "#00342B" }}> Mumbai's</span>
                </div>
                <div style={{ overflow: "hidden", marginBottom: 2 }}>
                  <GlitchWord word="Finest" delay={350} />
                  <span style={{ color: "#C8622A" }}> Ethnic</span>
                </div>
                <div style={{ overflow: "hidden" }}>
                  <GlitchWord word="Couture" delay={500} />
                </div>
              </h1>

              {/* Gold underline */}
              <motion.div
                initial={{ scaleX: 0, originX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                style={{ height: 3, background: "linear-gradient(90deg, #D4AF37, #C8622A, transparent)", borderRadius: 2, maxWidth: 320, marginBottom: 24, marginInline: isMobile ? "auto" : 0 }}
              />

              {/* Sub text */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                style={{ fontSize: "clamp(14px, 1.6vw, 17px)", color: "#666", lineHeight: 1.7, marginBottom: 36, maxWidth: 480, marginInline: isMobile ? "auto" : 0 }}
              >
                Experience designer lehengas, sherwanis & sarees without the lifetime cost.
                Sustainable luxury for Mumbai's social season — delivered to your door.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.05, duration: 0.6 }}
                style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 40, justifyContent: isMobile ? "center" : "flex-start" }}
              >
                <MagneticButton
                  onClick={goToCollection}
                  style={{
                    padding: "15px 32px",
                    width: isMobile ? "100%" : "auto",
                    maxWidth: isMobile ? 320 : "none",
                    background: "#00342B",
                    color: "#FAF7F2",
                    border: "none",
                    borderRadius: 50,
                    fontSize: 14,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    cursor: "pointer",
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: "0 8px 32px rgba(0,52,43,0.25)",
                  }}
                >
                  <span style={{ position: "relative", zIndex: 1 }}>Explore Collection →</span>
                  <motion.div
                    style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.15), transparent)", x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.5 }}
                  />
                </MagneticButton>

                <MagneticButton
                  onClick={goToCreateListing}
                  style={{
                    padding: "15px 28px",
                    width: isMobile ? "100%" : "auto",
                    maxWidth: isMobile ? 320 : "none",
                    background: "transparent",
                    color: "#00342B",
                    border: "2px solid #D4AF37",
                    borderRadius: 50,
                    fontSize: 14,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    cursor: "pointer",
                  }}
                >
                  + List Your Outfit
                </MagneticButton>
              </motion.div>

              {/* Stats row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3, duration: 0.6 }}
                style={{ display: "flex", gap: isMobile ? 22 : 32, flexWrap: "wrap", justifyContent: isMobile ? "center" : "flex-start" }}
              >
                {[
                  { value: 120, suffix: "+", label: "Outfits" },
                  { value: 340, suffix: "+", label: "Renters" },
                  { value: 4200, prefix: "₹", label: "Avg Savings" },
                ].map((stat, i) => (
                  <div key={i}>
                    <div style={{ fontFamily: "'Georgia', serif", fontSize: "clamp(22px, 3vw, 34px)", fontWeight: 900, color: "#00342B", lineHeight: 1 }}>
                      <AnimatedCounter to={stat.value} suffix={stat.suffix} prefix={stat.prefix || ""} />
                    </div>
                    <div style={{ fontSize: 11, color: "#999", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 3 }}>{stat.label}</div>
                  </div>
                ))}
              </motion.div>

              {/* Trust badges */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6 }}
                style={{ display: "flex", gap: 10, marginTop: 32, flexWrap: "wrap", justifyContent: isMobile ? "center" : "flex-start" }}
              >
                <TrustBadge icon="🛡️" label="Insured" delay={1.7} />
                <TrustBadge icon="✨" label="Cleaned" delay={1.8} />
                <TrustBadge icon="↩️" label="Easy Returns" delay={1.9} />
                <TrustBadge icon="🚚" label="Mumbai Delivery" delay={2.0} />
              </motion.div>
            </div>

            {/* ── RIGHT COLUMN: Outfit Cards ─────────────── */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              style={{ display: "flex", justifyContent: "center", marginTop: isTablet || isMobile ? 8 : 0, x: useTransform(mouseX, [0,1], [8,-8]), y: useTransform(mouseY, [0,1], [4,-4]) }}
            >
              <TiltCard>
                <OutfitShowcase compact={isMobile} />
              </TiltCard>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        {!isMobile && <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
          style={{
            position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
            zIndex: 3,
          }}
        >
          <span style={{ fontSize: 9, letterSpacing: "0.2em", color: "#999", textTransform: "uppercase" }}>Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ width: 1, height: 32, background: "linear-gradient(to bottom, #D4AF37, transparent)" }}
          />
        </motion.div>}
      </section>

      {/* ── SOCIAL PROOF STRIP ───────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{
          padding: isMobile ? "28px 16px" : "36px 24px",
          background: "#00342B",
          display: "flex",
          justifyContent: "center",
          gap: isMobile ? 20 : 60,
          flexWrap: "wrap",
        }}
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
            style={{ display: "flex", alignItems: "center", gap: 10 }}
          >
            <span style={{ fontSize: isMobile ? 16 : 18 }}>{item.emoji}</span>
            <span style={{ color: "rgba(255,255,255,0.85)", fontSize: isMobile ? 12 : 13, fontWeight: 600, letterSpacing: "0.04em" }}>{item.text}</span>
          </motion.div>
        ))}
      </motion.section>
    </div>
  );
}
