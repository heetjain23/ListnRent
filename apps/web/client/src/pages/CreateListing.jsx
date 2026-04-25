import React, { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import ConfirmationModal from "../components/ui/ConfirmationModal";
import { listingsApi } from "../services/api";
import { uploadMultipleImages } from "../services/cloudinary";
import {
  CATEGORIES,
  OCCASIONS,
  SIZES,
  GENDER as GENDERS,
  CONDITIONS,
  MATERIALS,
} from "../constants";

const normalizeOptions = (items) => items.filter((item) => item !== "All");

const CATEGORY_OPTIONS = normalizeOptions(CATEGORIES);
const OCCASION_OPTIONS = normalizeOptions(OCCASIONS);
const SIZE_OPTIONS = normalizeOptions(SIZES);
const GENDER_OPTIONS = normalizeOptions(GENDERS);
const CONDITION_OPTIONS = normalizeOptions(CONDITIONS);
const MATERIAL_OPTIONS = normalizeOptions(MATERIALS).includes("Other")
  ? normalizeOptions(MATERIALS)
  : [...normalizeOptions(MATERIALS), "Other"];

const SERVICE_AREA_BOUNDS = {
  // Operational corridor: Virar (north) to Andheri (south)
  northLat: 19.5,
  southLat: 19.1,
  westLng: 72.78,
  eastLng: 72.91,
};

const isWithinServiceArea = (lat, lng) =>
  lat >= SERVICE_AREA_BOUNDS.southLat &&
  lat <= SERVICE_AREA_BOUNDS.northLat &&
  lng >= SERVICE_AREA_BOUNDS.westLng &&
  lng <= SERVICE_AREA_BOUNDS.eastLng;

const getLocationLabel = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=13&addressdetails=1`,
    );
    if (!response.ok) throw new Error("Reverse geocoding failed");
    const data = await response.json();
    const addr = data?.address || {};
    return (
      addr.suburb ||
      addr.neighbourhood ||
      addr.city_district ||
      addr.city ||
      addr.town ||
      data?.display_name ||
      ""
    );
  } catch {
    return "";
  }
};

// ── Step config ───────────────────────────────────────────────────────────────
const STEPS = [
  {
    id: 1,
    key: "photos",
    label: "Photos",
    icon: "📸",
    subtitle: "Showcase your piece",
  },
  {
    id: 2,
    key: "details",
    label: "Details",
    icon: "✦",
    subtitle: "Describe your outfit",
  },
  {
    id: 3,
    key: "pricing",
    label: "Pricing",
    icon: "₹",
    subtitle: "Set your rates",
  },
  {
    id: 4,
    key: "review",
    label: "Review",
    icon: "✓",
    subtitle: "Publish listing",
  },
];

// ── Ambient background (matches homepage) ─────────────────────────────────────
function AmbientAccents() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden z-0"
    >
      <motion.div
        animate={{
          x: [0, 22, -10, 0],
          y: [0, 16, 6, 0],
          opacity: [0.28, 0.44, 0.32, 0.28],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-[12%] -left-[8%] rounded-full blur-[72px]"
        style={{
          width: "min(42vw, 520px)",
          height: "min(42vw, 520px)",
          background:
            "radial-gradient(circle, rgba(0,52,43,0.14) 0%, rgba(0,52,43,0) 72%)",
        }}
      />
      <motion.div
        animate={{
          x: [0, -18, 8, 0],
          y: [0, -14, -4, 0],
          opacity: [0.22, 0.38, 0.28, 0.22],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-[10%] -right-[6%] rounded-full blur-[72px]"
        style={{
          width: "min(36vw, 460px)",
          height: "min(36vw, 460px)",
          background:
            "radial-gradient(circle, rgba(212,175,55,0.18) 0%, rgba(212,175,55,0) 70%)",
        }}
      />
    </div>
  );
}

// ── Step indicator ─────────────────────────────────────────────────────────────
function StepIndicator({ currentStep, completedSteps, onStepClick }) {
  return (
    <div className="relative flex items-center justify-center gap-0">
      {STEPS.map((step, i) => {
        const isComplete = completedSteps.includes(step.id);
        const isCurrent = currentStep === step.id;
        const isClickable = isComplete || isCurrent;

        return (
          <React.Fragment key={step.id}>
            <motion.button
              onClick={() => isClickable && onStepClick(step.id)}
              disabled={!isClickable}
              className="flex flex-col items-center gap-1.5 group"
              whileHover={isClickable ? { y: -2 } : {}}
              transition={{ duration: 0.2 }}
            >
              {/* Circle */}
              <motion.div
                animate={{
                  background: isComplete
                    ? "#00342B"
                    : isCurrent
                      ? "#1A1A1A"
                      : "rgba(232,224,213,0.9)",
                  borderColor: isComplete
                    ? "#00342B"
                    : isCurrent
                      ? "#D4AF37"
                      : "rgba(200,185,165,0.6)",
                  scale: isCurrent ? 1.1 : 1,
                }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold"
                style={{ color: isComplete || isCurrent ? "white" : "#AAA" }}
              >
                {isComplete ? (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    ✓
                  </motion.span>
                ) : (
                  <span style={{ fontSize: 16 }}>{step.icon}</span>
                )}
                {/* Active pulse ring */}
                {isCurrent && (
                  <motion.div
                    className="absolute inset-0 rounded-full border border-[#D4AF37]"
                    animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </motion.div>
              {/* Label */}
              <div className="hidden md:flex flex-col items-center">
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-[0.14em] transition-colors ${isCurrent ? "text-[#1A1A1A]" : isComplete ? "text-[#00342B]" : "text-[#BBB]"}`}
                >
                  {step.label}
                </span>
              </div>
            </motion.button>

            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <div
                className="relative flex-1 mx-2 h-px"
                style={{
                  minWidth: 32,
                  maxWidth: 80,
                  background: "rgba(232,224,213,0.8)",
                }}
              >
                <motion.div
                  className="absolute inset-0 origin-left"
                  animate={{ scaleX: completedSteps.includes(step.id) ? 1 : 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    background: "linear-gradient(90deg, #00342B, #D4AF37)",
                  }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Drag-and-drop photo upload ─────────────────────────────────────────────────
function PhotoUploadStep({ images, onImagesChange }) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const fileInputRef = useRef(null);

  const handleFiles = useCallback(
    (files) => {
      const validFiles = Array.from(files).filter(
        (f) => f instanceof File && f.type.startsWith("image/"),
      );
      const previews = validFiles.map((f) => ({
        url: URL.createObjectURL(f),
        file: f,
        id: Math.random().toString(36),
      }));
      onImagesChange((prev) => [...prev, ...previews].slice(0, 5));
    },
    [onImagesChange],
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = (id) =>
    onImagesChange((prev) => prev.filter((img) => img.id !== id));

  const slots = [
    { label: "Front View", required: true, hint: "Main shot" },
    { label: "Back View", required: true, hint: "Full back" },
    { label: "Side View", required: true, hint: "Profile" },
    { label: "Detail Shot", required: false, hint: "Embroidery / fabric" },
    { label: "Full Look", required: false, hint: "Styled / worn" },
  ];

  return (
    <div className="space-y-8">
      {/* Section header */}
      <div>
        <div className="inline-flex items-center gap-2 mb-3 rounded-full border border-[rgba(212,175,55,0.3)] bg-[rgba(212,175,55,0.08)] py-1 pl-2 pr-4">
          <span className="rounded-full bg-[#D4AF37] px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#1A1A1A]">
            Step 1
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8B7340]">
            Capture Every Angle
          </span>
        </div>
        <h2
          className="text-2xl md:text-3xl font-black text-[#1A1A1A]"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          Show It Off
        </h2>
        <motion.div
          className="mt-2 h-0.5 max-w-20 bg-[linear-gradient(90deg,#D4AF37,#C8622A,transparent)]"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        />
        <p className="mt-3 text-sm text-[#888]">
          Great photos = faster rentals. Upload at least 3 views.
        </p>
      </div>

      {/* Main drop zone */}
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        animate={{
          borderColor: isDragging ? "#D4AF37" : "rgba(212,175,55,0.25)",
          background: isDragging ? "rgba(212,175,55,0.06)" : "transparent",
        }}
        className="relative rounded-2xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <motion.div
          animate={{ y: isDragging ? -8 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="text-4xl mb-3">📷</div>
          <p className="text-sm font-bold text-[#1A1A1A] mb-1">
            Drag & drop your photos here
          </p>
          <p className="text-xs text-[#999]">
            or click to browse — up to 5 images, JPG/PNG
          </p>
        </motion.div>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 rounded-2xl border-2 border-[#D4AF37] pointer-events-none"
          />
        )}
      </motion.div>

      {/* Structured slots */}
      <div className="grid grid-cols-5 gap-3">
        {slots.map((slot, i) => {
          const img = images[i];
          return (
            <div key={slot.label} className="relative">
              <AnimatePresence mode="wait">
                {img ? (
                  <motion.div
                    key="image"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    className="relative group rounded-xl overflow-hidden"
                    style={{ aspectRatio: "3/4", background: "#F0EBE3" }}
                  >
                    <img
                      src={img.url}
                      alt={slot.label}
                      className="w-full h-full object-cover"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage(img.id);
                        }}
                        className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm flex items-center justify-center hover:bg-red-500/80 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                    {/* Label chip */}
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <span className="text-[9px] font-bold text-white/80 uppercase tracking-wide bg-black/30 px-1.5 py-0.5 rounded">
                        {slot.label}
                      </span>
                    </div>
                    {/* Required tick */}
                    {slot.required && (
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#00342B] flex items-center justify-center">
                        <span className="text-white text-[8px]">✓</span>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.button
                    key="empty"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full rounded-xl border-2 border-dashed border-[#E8E0D5] hover:border-[#D4AF37] transition-colors flex flex-col items-center justify-center gap-1 text-[#CCC] hover:text-[#D4AF37]"
                    style={{ aspectRatio: "3/4", background: "#FAFAF8" }}
                  >
                    <span className="text-lg">+</span>
                    <span
                      className="text-[9px] font-semibold uppercase tracking-wide text-center px-1"
                      style={{ color: "inherit" }}
                    >
                      {slot.label}
                    </span>
                    {slot.required && (
                      <span className="text-[8px] text-[#C8622A] font-bold">
                        Required
                      </span>
                    )}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 rounded-full bg-[#E8E0D5] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-[linear-gradient(90deg,#00342B,#D4AF37)]"
            animate={{ width: `${(images.length / 3) * 100}%` }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ maxWidth: "100%" }}
          />
        </div>
        <span className="text-xs font-semibold text-[#999] tabular-nums">
          {images.length}/5
        </span>
        {images.length >= 3 && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-[10px] font-bold text-[#00342B] uppercase tracking-widest"
          >
            ✓ Ready
          </motion.span>
        )}
      </div>
    </div>
  );
}

// ── Details step ───────────────────────────────────────────────────────────────
function DetailsField({ label, error, required, children, span = 1 }) {
  return (
    <div className={span === 2 ? "col-span-2" : ""}>
      <label className="block text-xs font-extrabold uppercase tracking-[0.14em] text-[#888] mb-2">
        {label} {required && <span className="text-[#C8622A]">*</span>}
      </label>
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-[#C8622A] mt-1.5 font-medium"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

function DetailsChipSelect({ name, options, value, onChange, error }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() =>
            onChange({ target: { name, value: value === opt ? "" : opt } })
          }
          className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border transition-all ${value === opt ? "bg-[#00342B] text-white border-[#00342B] shadow-[0_4px_12px_rgba(0,52,43,0.22)]" : `bg-white text-[#666] hover:border-[#D4AF37] hover:text-[#00342B] ${error ? "border-[#C8622A]" : "border-[#E8E0D5]"}`}`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function DetailsStep({
  form,
  onChange,
  errors,
  onUseCurrentLocation,
  locationLoading,
  isLocationVerified,
}) {
  const inputCls = (err) =>
    `w-full px-4 py-3 text-sm bg-white border rounded-xl focus:outline-none placeholder:text-[#CCC] text-[#1A1A1A] transition-all ${err ? "border-[#C8622A] focus:border-[#C8622A] focus:ring-1 focus:ring-[rgba(200,98,42,0.2)]" : "border-[#E8E0D5] focus:border-[#D4AF37] focus:ring-1 focus:ring-[rgba(212,175,55,0.15)]"}`;

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 mb-3 rounded-full border border-[rgba(212,175,55,0.3)] bg-[rgba(212,175,55,0.08)] py-1 pl-2 pr-4">
          <span className="rounded-full bg-[#D4AF37] px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#1A1A1A]">
            Step 2
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8B7340]">
            Tell Its Story
          </span>
        </div>
        <h2
          className="text-2xl md:text-3xl font-black text-[#1A1A1A]"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          The Details
        </h2>
        <motion.div
          className="mt-2 h-0.5 max-w-20 bg-[linear-gradient(90deg,#D4AF37,#C8622A,transparent)]"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        />
      </div>

      {/* Title */}
      <DetailsField label="Outfit Name" error={errors.title} required>
        <input
          name="title"
          value={form.title}
          onChange={onChange}
          placeholder="e.g. Vintage Emerald Banarasi Lehenga with Zari Work"
          className={inputCls(errors.title)}
        />
      </DetailsField>

      {/* Category + Occasion */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DetailsField label="Category" error={errors.category} required>
          <DetailsChipSelect
            name="category"
            options={CATEGORY_OPTIONS}
            value={form.category}
            onChange={onChange}
            error={errors.category}
          />
        </DetailsField>
        <DetailsField
          label="Best For (Occasion)"
          error={errors.occasion}
          required
        >
          <DetailsChipSelect
            name="occasion"
            options={OCCASION_OPTIONS}
            value={form.occasion}
            onChange={onChange}
            error={errors.occasion}
          />
        </DetailsField>
      </div>

      {/* Size + Gender + Condition */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DetailsField label="Size" error={errors.size} required>
          <DetailsChipSelect
            name="size"
            options={SIZE_OPTIONS}
            value={form.size}
            onChange={onChange}
            error={errors.size}
          />
        </DetailsField>
        <DetailsField label="Gender" error={errors.gender} required>
          <DetailsChipSelect
            name="gender"
            options={GENDER_OPTIONS}
            value={form.gender}
            onChange={onChange}
            error={errors.gender}
          />
        </DetailsField>
        <DetailsField label="Condition" error={errors.condition} required>
          <DetailsChipSelect
            name="condition"
            options={CONDITION_OPTIONS}
            value={form.condition}
            onChange={onChange}
            error={errors.condition}
          />
        </DetailsField>
      </div>

      {/* Material */}
      <DetailsField label="Material / Fabric" error={errors.material} required>
        <div className="flex flex-wrap gap-2">
          {MATERIAL_OPTIONS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() =>
                onChange({
                  target: {
                    name: "material",
                    value: form.material === m ? "" : m,
                  },
                })
              }
              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border transition-all ${form.material === m ? "bg-[#1A1A1A] text-white border-[#1A1A1A]" : "bg-white text-[#666] border-[#E8E0D5] hover:border-[#D4AF37]"}`}
            >
              {m}
            </button>
          ))}
        </div>
        {form.material === "Other" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-3"
          >
            <input
              name="customMaterial"
              value={form.customMaterial || ""}
              onChange={onChange}
              placeholder="e.g. Handloom Kantha"
              className={inputCls(errors.customMaterial)}
            />
            {errors.customMaterial && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-[#C8622A] mt-1.5 font-medium"
              >
                {errors.customMaterial}
              </motion.p>
            )}
          </motion.div>
        )}
      </DetailsField>

      {/* Description */}
      <DetailsField label="Description" error={errors.description} required>
        <textarea
          name="description"
          value={form.description}
          onChange={onChange}
          rows={5}
          placeholder="Share the story of this piece — fabric texture, embroidery, occasions it suits, what's included…"
          className={`${inputCls(errors.description)} resize-none leading-relaxed`}
        />
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-[#CCC]">
            Help renters fall in love with it
          </span>
          <span className="text-xs text-[#CCC] tabular-nums">
            {form.description.length}/500
          </span>
        </div>
      </DetailsField>

      {/* Location */}
      <DetailsField label="Your Area / Locality" error={errors.area} required>
        <div className="space-y-2">
          <input
            name="area"
            value={form.area}
            onChange={onChange}
            placeholder="e.g. Andheri West, Bandra, Juhu"
            className={inputCls(errors.area)}
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onUseCurrentLocation}
              disabled={locationLoading}
              className="px-3 py-1.5 rounded-lg border border-[#E8E0D5] bg-white text-xs font-bold tracking-wide text-[#00342B] hover:border-[#D4AF37] disabled:opacity-60"
            >
              {locationLoading
                ? "Checking location..."
                : "Use current location"}
            </button>
            {isLocationVerified && (
              <span className="text-[11px] font-semibold text-[#00342B]">
                Location verified: In service zone
              </span>
            )}
          </div>
        </div>
        <p className="text-xs text-[#AAA] mt-1.5">
          Only locations between Virar and Andheri are serviceable right now.
        </p>
      </DetailsField>
    </div>
  );
}

// ── Pricing step ───────────────────────────────────────────────────────────────
function PricingStep({ form, onChange, errors }) {
  const price = Number(form.pricePerDay) || 0;
  const deposit = price * 2;
  const weeklyEst = price * 3;
  const monthlyEst = price * 8;

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 mb-3 rounded-full border border-[rgba(212,175,55,0.3)] bg-[rgba(212,175,55,0.08)] py-1 pl-2 pr-4">
          <span className="rounded-full bg-[#D4AF37] px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#1A1A1A]">
            Step 3
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8B7340]">
            Set Your Rates
          </span>
        </div>
        <h2
          className="text-2xl md:text-3xl font-black text-[#1A1A1A]"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          Price It Right
        </h2>
        <motion.div
          className="mt-2 h-0.5 max-w-20 bg-[linear-gradient(90deg,#D4AF37,#C8622A,transparent)]"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        />
        <p className="mt-3 text-sm text-[#888]">
          Most listed outfits in Mumbai earn ₹600–₹2,500/day.
        </p>
      </div>

      {/* Price Input */}
      <div>
        <label className="block text-xs font-extrabold uppercase tracking-[0.14em] text-[#888] mb-3">
          Rental Price Per Day <span className="text-[#C8622A]">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-black text-[#1A1A1A]">
            ₹
          </span>
          <input
            name="pricePerDay"
            type="number"
            value={form.pricePerDay}
            onChange={onChange}
            placeholder="0"
            min="1"
            onWheel={(e) => e.currentTarget.blur()}
            className={`w-full pl-12 pr-6 py-5 text-3xl font-black bg-white rounded-2xl border-2 focus:outline-none transition-all text-[#1A1A1A] placeholder:text-[#DDD] ${errors.pricePerDay ? "border-[#C8622A]" : "border-[#E8E0D5] focus:border-[#D4AF37]"}`}
            style={{ fontFamily: "'Georgia', serif" }}
          />
        </div>
        {errors.pricePerDay && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-[#C8622A] mt-2 font-medium"
          >
            {errors.pricePerDay}
          </motion.p>
        )}
      </div>

      {/* Earnings preview cards */}
      <AnimatePresence>
        {price > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="grid grid-cols-3 gap-4"
          >
            {[
              {
                label: "Weekend Rental",
                value: `₹${(price * 2).toLocaleString("en-IN")}`,
                sub: "2 day booking",
              },
              {
                label: "Week Estimate",
                value: `₹${weeklyEst.toLocaleString("en-IN")}`,
                sub: "3 day avg booking",
              },
              {
                label: "Monthly Potential",
                value: `₹${monthlyEst.toLocaleString("en-IN")}`,
                sub: "8 days/month avg",
              },
            ].map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-xl border border-[rgba(212,175,55,0.2)] bg-[rgba(212,175,55,0.05)] p-4 text-center"
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-[#8B7340] mb-2">
                  {card.label}
                </p>
                <p
                  className="text-xl font-black text-[#00342B]"
                  style={{ fontFamily: "'Georgia', serif" }}
                >
                  {card.value}
                </p>
                <p className="text-[10px] text-[#AAA] mt-1">{card.sub}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Security deposit info */}
      <div className="rounded-2xl border border-[#E8E0D5] bg-[#FAFAF8] p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#888] mb-1">
              Security Deposit
            </p>
            <p
              className="text-2xl font-black text-[#1A1A1A]"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              ₹{deposit > 0 ? deposit.toLocaleString("en-IN") : "—"}
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 rounded-full bg-[rgba(0,52,43,0.08)] text-[#00342B] text-xs font-bold uppercase tracking-widest">
              Auto-calculated
            </span>
            <p className="text-xs text-[#888] mt-1">= 2× daily rate</p>
          </div>
        </div>
        <div className="h-0.5 w-full bg-[linear-gradient(90deg,#D4AF37,rgba(212,175,55,0.2),transparent)] mb-4" />
        <p className="text-xs text-[#888] leading-relaxed">
          The security deposit is collected from renters to protect your
          garment. It is fully refunded after a successful return. You're always
          protected.
        </p>
      </div>

      {/* What's included checklist */}
      <div>
        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#888] mb-4">
          What's Included With This Listing
        </p>
        <div className="space-y-2">
          {[
            { label: "Secure payment processing", included: true },
            { label: "Renter identity verification", included: true },
            { label: "Damage protection policy", included: true },
            { label: "ListnRent support for disputes", included: true },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${item.included ? "bg-[#00342B]" : "bg-[#E8E0D5]"}`}
              >
                <span className="text-white text-[8px]">✓</span>
              </div>
              <span className="text-sm text-[#555]">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Review step ────────────────────────────────────────────────────────────────
function ReviewStep({ images, form }) {
  const mainImage = images[0];
  const price = Number(form.pricePerDay) || 0;

  const Row = ({ label, value }) => (
    <div className="flex items-center justify-between py-3 border-b border-[#F0EBE3] last:border-0">
      <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#AAA]">
        {label}
      </span>
      <span className="text-sm font-semibold text-[#1A1A1A] text-right max-w-50">
        {value || "—"}
      </span>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 mb-3 rounded-full border border-[rgba(212,175,55,0.3)] bg-[rgba(212,175,55,0.08)] py-1 pl-2 pr-4">
          <span className="rounded-full bg-[#D4AF37] px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#1A1A1A]">
            Step 4
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8B7340]">
            Almost There
          </span>
        </div>
        <h2
          className="text-2xl md:text-3xl font-black text-[#1A1A1A]"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          Review & Publish
        </h2>
        <motion.div
          className="mt-2 h-0.5 max-w-20 bg-[linear-gradient(90deg,#D4AF37,#C8622A,transparent)]"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        />
      </div>

      {/* Preview card */}
      <div
        className="rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,52,43,0.1),0_0_0_1px_rgba(212,175,55,0.2)]"
        style={{ background: "white" }}
      >
        {/* Image area */}
        <div
          className="relative"
          style={{ aspectRatio: "16/7", background: "#F0EBE3" }}
        >
          {mainImage ? (
            <img
              src={mainImage.url}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">
              🪭
            </div>
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_48%,rgba(0,0,0,0.55)_100%)]" />
          {/* Additional image strip */}
          {images.length > 1 && (
            <div className="absolute bottom-3 right-3 flex gap-1.5">
              {images.slice(1, 4).map((img, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-lg overflow-hidden border border-white/40"
                >
                  <img
                    src={img.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {images.length > 4 && (
                <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/40 flex items-center justify-center text-white text-xs font-bold">
                  +{images.length - 4}
                </div>
              )}
            </div>
          )}
          {/* Category badge */}
          {form.category && (
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-extrabold uppercase tracking-widest text-[#1A1A1A]">
              {form.category}
            </div>
          )}
          {/* Price overlay */}
          {price > 0 && (
            <div className="absolute bottom-4 left-4">
              <span
                className="text-2xl font-black text-white"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                ₹{price.toLocaleString("en-IN")}
              </span>
              <span className="text-white/70 text-sm ml-1">/day</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-6">
          <h3
            className="text-xl font-black text-[#1A1A1A] mb-1"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            {form.title || "Your Listing Title"}
          </h3>
          {form.area && (
            <p className="text-xs text-[#888] mb-4 flex items-center gap-1">
              <span>📍</span> {form.area}, Mumbai
            </p>
          )}
          <div className="h-0.5 bg-[linear-gradient(90deg,#D4AF37,rgba(212,175,55,0.2),transparent)] mb-4" />
          <Row label="Category" value={form.category} />
          <Row label="Occasion" value={form.occasion} />
          <Row label="Size" value={form.size} />
          <Row label="Gender" value={form.gender} />
          <Row
            label="Material"
            value={
              form.material === "Other" ? form.customMaterial : form.material
            }
          />
          <Row label="Condition" value={form.condition} />
          <Row
            label="Security Deposit"
            value={price > 0 ? `₹${(price * 2).toLocaleString("en-IN")}` : "—"}
          />
        </div>
      </div>

      {/* Terms */}
      <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[rgba(212,175,55,0.2)] text-xs text-[#888] leading-relaxed">
        By publishing, you agree to ListnRent's{" "}
        <button className="text-[#C8622A] font-semibold hover:underline">
          Heritage Preservation Terms
        </button>{" "}
        and confirm that this garment belongs to you and is in the described
        condition.
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
const CreateListing = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [published, setPublished] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [isLocationVerified, setIsLocationVerified] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const [form, setForm] = useState({
    title: "",
    category: "",
    occasion: "",
    size: "",
    gender: "",
    condition: "",
    material: "",
    customMaterial: "",
    pricePerDay: "",
    description: "",
    area: "",
  });
  const [errors, setErrors] = useState({});
  const showSaveDraft = !(currentStep === 1 && images.length === 0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === "title" && v) v = v.charAt(0).toUpperCase() + v.slice(1);
    setForm((prev) => ({ ...prev, [name]: v }));
    if (name === "area" && isLocationVerified) setIsLocationVerified(false);
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported on this device.");
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude, longitude } = coords;
        const inService = isWithinServiceArea(latitude, longitude);

        if (!inService) {
          setLocationLoading(false);
          setIsLocationVerified(false);
          setErrors((prev) => ({
            ...prev,
            area: "Location is outside service area",
          }));
          toast.error(
            "Your location is currently out of service range. Service is available from Virar to Andheri.",
          );
          return;
        }

        const areaName = await getLocationLabel(latitude, longitude);
        setForm((prev) => ({
          ...prev,
          area:
            areaName ||
            `Lat ${latitude.toFixed(4)}, Lng ${longitude.toFixed(4)}`,
        }));
        setIsLocationVerified(true);
        setErrors((prev) => ({ ...prev, area: "" }));
        setLocationLoading(false);
        toast.success(
          "Location verified. You are within our current service area.",
        );
      },
      (geoError) => {
        setLocationLoading(false);
        setIsLocationVerified(false);
        if (geoError.code === 1) {
          toast.error(
            "Location permission was denied. Please allow access to continue.",
          );
          return;
        }
        toast.error(
          "Unable to fetch your location right now. Please try again.",
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }, []);

  const validateStep = (step) => {
    const errs = {};
    if (step === 1) {
      if (images.length < 3) errs.images = "Upload at least 3 photos";
    }
    if (step === 2) {
      if (!form.title.trim()) errs.title = "Title is required";
      if (!form.category) errs.category = "Select a category";
      if (!form.occasion) errs.occasion = "Select an occasion";
      if (!form.size) errs.size = "Select a size";
      if (!form.gender) errs.gender = "Select gender";
      if (!form.condition) errs.condition = "Select condition";
      if (!form.material) errs.material = "Select material";
      if (form.material === "Other" && !form.customMaterial.trim())
        errs.customMaterial = "Enter custom material";
      if (!form.description.trim()) errs.description = "Add a description";
      if (!form.area.trim()) errs.area = "Your area is required";
      if (!isLocationVerified)
        errs.area = "Please verify your current location to continue";
    }
    if (step === 3) {
      if (!form.pricePerDay || Number(form.pricePerDay) < 1)
        errs.pricePerDay = "Enter a valid price";
    }
    return errs;
  };

  const handleNext = () => {
    const errs = validateStep(currentStep);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setCompletedSteps((prev) => [...new Set([...prev, currentStep])]);
    setCurrentStep((prev) => Math.min(4, prev + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getFinalMaterial = () =>
    form.material === "Other" ? form.customMaterial.trim() : form.material.trim();

  const uploadListingImages = async () => {
    const files = images
      .map((img) => img?.file)
      .filter((file) => file instanceof File);

    if (files.length === 0) return [];

    return uploadMultipleImages(files);
  };

  const buildListingPayload = async (isDraft = false) => {
    let uploadedImages = [];

    try {
      uploadedImages = await uploadListingImages();
    } catch (error) {
      if (!isDraft) {
        throw error;
      }
      toast.error(
        "Draft saved without uploaded photos. You can add photos later.",
      );
    }

    const pricePerDay = Number(form.pricePerDay) || 0;
    const finalMaterial = getFinalMaterial();

    const payload = { isDraft, isActive: !isDraft };

    const setIfPresent = (key, value) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') {
        payload[key] = value;
      }
    };

    setIfPresent('title', form.title.trim());
    setIfPresent('category', form.category);
    setIfPresent('occasion', form.occasion);
    setIfPresent('size', form.size);
    setIfPresent('gender', form.gender);
    setIfPresent('condition', form.condition);
    setIfPresent('material', finalMaterial);
    setIfPresent('description', form.description.trim());

    if (pricePerDay > 0) {
      payload.pricePerDay = pricePerDay;
      payload.deposit = pricePerDay * 2;
    }

    if (form.area.trim()) {
      payload.location = {
        area: form.area.trim(),
        city: 'Mumbai',
      };
    }

    if (uploadedImages.length > 0) {
      payload.images = uploadedImages;
    }

    return payload;
  };

  const handlePublish = async () => {
    try {
      setSubmitting(true);
      const payload = await buildListingPayload(false);
      await listingsApi.create(payload);
      toast.success("Listing created successfully!");
      setPublished(true);
    } catch {
      toast.error("Failed to create listing. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      setSubmitting(true);
      const payload = await buildListingPayload(true);
      await listingsApi.create(payload);
      toast.success("Draft saved! Closing listing editor...");
      navigate("/dashboard", {
        state: { activeTab: "listings", listingsSubTab: "drafts" },
      });
    } catch {
      toast.error("Failed to save draft. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelListing = () => {
    setShowCancelConfirm(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelConfirm(false);
    toast.info("Listing creation cancelled.");
    navigate("/dashboard");
  };

  // Published success screen
  if (published) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-4 pt-20 relative">
        <AmbientAccents />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="text-7xl mb-6"
          >
            🎉
          </motion.div>
          <h1
            className="text-3xl font-black text-[#1A1A1A] mb-3"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            Your Listing is Live!
          </h1>
          <div className="h-0.5 w-32 mx-auto mb-4 bg-[linear-gradient(90deg,#D4AF37,#C8622A,transparent)]" />
          <p className="text-[#888] mb-8 text-sm leading-relaxed">
            Mumbai's renters can now discover your piece. You'll get notified
            the moment someone books.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 rounded-full bg-[#00342B] text-white text-sm font-bold tracking-wide shadow-[0_8px_24px_rgba(0,52,43,0.25)]"
            >
              View Dashboard
            </button>
            <button
              onClick={() => navigate("/collection")}
              className="px-6 py-3 rounded-full border-2 border-[#D4AF37] text-[#00342B] text-sm font-bold tracking-wide"
            >
              Browse Collection
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] relative">
      <AmbientAccents />

      {/* Page content */}
      <div className="relative z-10 pt-24 pb-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#C8622A] mb-2">
              Start Earning
            </p>
            <h1
              className="text-3xl md:text-4xl font-black text-[#1A1A1A] mb-3"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              Share Your Collection
            </h1>
            <p className="text-sm text-[#888]">
              Turn your wardrobe into a sustainable income stream.
            </p>
          </motion.div>

          {/* Step Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-10 px-4"
          >
            <StepIndicator
              currentStep={currentStep}
              completedSteps={completedSteps}
              onStepClick={setCurrentStep}
            />
          </motion.div>

          {/* Step Content Card */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20, filter: "blur(4px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white rounded-3xl shadow-[0_4px_32px_rgba(0,52,43,0.07),0_0_0_1px_rgba(232,224,213,0.6)] p-6 md:p-10 mb-6"
          >
            {currentStep === 1 && (
              <PhotoUploadStep images={images} onImagesChange={setImages} />
            )}
            {currentStep === 2 && (
              <DetailsStep
                form={form}
                onChange={handleChange}
                errors={errors}
                onUseCurrentLocation={handleUseCurrentLocation}
                locationLoading={locationLoading}
                isLocationVerified={isLocationVerified}
              />
            )}
            {currentStep === 3 && (
              <PricingStep
                form={form}
                onChange={handleChange}
                errors={errors}
              />
            )}
            {currentStep === 4 && <ReviewStep images={images} form={form} />}

            {/* Step 1 error */}
            {currentStep === 1 && errors.images && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-[#C8622A] font-medium mt-4 text-center"
              >
                {errors.images}
              </motion.p>
            )}
          </motion.div>

          {/* Navigation */}
          <div className="space-y-3">
            {/* Next / Publish */}
            <motion.button
              onClick={currentStep < 4 ? handleNext : handlePublish}
              disabled={submitting}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="w-full relative overflow-hidden py-3.5 rounded-xl bg-[#00342B] text-white text-sm font-bold tracking-[0.08em] shadow-[0_8px_24px_rgba(0,52,43,0.28)] disabled:opacity-60"
            >
              <span className="relative z-10">
                {submitting
                  ? "Processing…"
                  : currentStep < 4
                    ? "Continue →"
                    : "🚀 Publish Listing"}
              </span>
              <motion.div
                className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(212,175,55,0.18),transparent)]"
                style={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.5 }}
              />
            </motion.button>

            <div className="grid grid-cols-2 gap-3 md:flex md:items-center">
              {/* Back */}
              {currentStep > 1 ? (
                <button
                  onClick={handleBack}
                  className="px-5 py-3.5 rounded-xl border border-[#E8E0D5] text-sm font-semibold text-[#666] hover:border-[#D4AF37] hover:text-[#1A1A1A] transition-all"
                >
                  ← Back
                </button>
              ) : (
                <div className="hidden md:block w-20" />
              )}

              {/* Save Draft */}
              {showSaveDraft && (
                <button
                  onClick={handleSaveDraft}
                  disabled={submitting}
                  className="px-5 py-3.5 rounded-xl border border-[#E8E0D5] text-sm font-semibold text-[#888] hover:border-[#D4AF37] hover:text-[#1A1A1A] transition-all disabled:opacity-50"
                >
                  Save Draft
                </button>
              )}

              {/* Cancel Listing */}
              <button
                onClick={handleCancelListing}
                disabled={submitting}
                className="px-5 py-3.5 rounded-xl border border-[#E8E0D5] text-sm font-semibold text-[#888] hover:border-[#C8622A] hover:text-[#C8622A] transition-all disabled:opacity-50"
              >
                Cancel Listing
              </button>
            </div>
          </div>

          {/* Step counter */}
          <p className="text-center text-xs text-[#CCC] mt-5 tracking-widest">
            Step {currentStep} of {STEPS.length}
          </p>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showCancelConfirm}
        title="Cancel Listing Creation?"
        message="Your unsaved progress will be lost. Do you want to leave this page?"
        confirmText="Yes, Cancel"
        cancelText="Keep Editing"
        confirmVariant="danger"
        onConfirm={handleConfirmCancel}
        onCancel={() => setShowCancelConfirm(false)}
      />
    </div>
  );
};

export default CreateListing;