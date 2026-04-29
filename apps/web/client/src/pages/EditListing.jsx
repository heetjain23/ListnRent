import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { toast } from 'sonner'
import { useAuth } from '../hooks/useAuth'
import Loading from '../components/ui/Loading'
import { CATEGORIES, OCCASIONS, GENDER, SIZES, CONDITIONS, MATERIALS } from '../constants'
import { listingsApi } from '../services/api'
import { uploadMultipleImages } from '../services/cloudinary'
import { useSEO } from '../hooks/useSEO'

// ─── Constants ────────────────────────────────────────────────────────────────

const normalizeOptions = (items) => items.filter((i) => i !== 'All')

const CATEGORY_OPTIONS = normalizeOptions(CATEGORIES)
const OCCASION_OPTIONS = normalizeOptions(OCCASIONS)
const SIZE_OPTIONS = normalizeOptions(SIZES)
const GENDER_OPTIONS = normalizeOptions(GENDER)
const CONDITION_OPTIONS = normalizeOptions(CONDITIONS)
const MATERIAL_OPTIONS = [...normalizeOptions(MATERIALS), 'Other']

// ─── Step config ──────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, key: 'photos',  label: 'Photos',  icon: '📸', subtitle: 'Update images'    },
  { id: 2, key: 'details', label: 'Details', icon: '✦',  subtitle: 'Edit your outfit'  },
  { id: 3, key: 'pricing', label: 'Pricing', icon: '₹',  subtitle: 'Update your rates' },
  { id: 4, key: 'review',  label: 'Review',  icon: '✓',  subtitle: 'Save changes'      },
]

// ─── Ambient background ───────────────────────────────────────────────────────

function AmbientAccents() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      <motion.div
        animate={{ x: [0, 22, -10, 0], y: [0, 16, 6, 0], opacity: [0.28, 0.44, 0.32, 0.28] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-[12%] -left-[8%] rounded-full blur-[72px]"
        style={{
          width: 'min(42vw, 520px)', height: 'min(42vw, 520px)',
          background: 'radial-gradient(circle, rgba(0,52,43,0.14) 0%, rgba(0,52,43,0) 72%)',
        }}
      />
      <motion.div
        animate={{ x: [0, -18, 8, 0], y: [0, -14, -4, 0], opacity: [0.22, 0.38, 0.28, 0.22] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-[10%] -right-[6%] rounded-full blur-[72px]"
        style={{
          width: 'min(36vw, 460px)', height: 'min(36vw, 460px)',
          background: 'radial-gradient(circle, rgba(212,175,55,0.18) 0%, rgba(212,175,55,0) 70%)',
        }}
      />
      {/* Terracotta mid */}
      <motion.div
        animate={{ x: [0, 14, -10, 0], y: [0, -10, 8, 0], opacity: [0.14, 0.24, 0.18, 0.14] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[38%] left-[40%] rounded-full blur-3xl"
        style={{
          width: 'min(28vw, 340px)', height: 'min(28vw, 340px)',
          background: 'radial-gradient(circle, rgba(200,98,42,0.12) 0%, rgba(200,98,42,0) 70%)',
        }}
      />
    </div>
  )
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ currentStep, completedSteps, onStepClick }) {
  return (
    <div className="relative flex items-center justify-center gap-0">
      {STEPS.map((step, i) => {
        const isComplete = completedSteps.includes(step.id)
        const isCurrent = currentStep === step.id
        const isClickable = isComplete || isCurrent

        return (
          <React.Fragment key={step.id}>
            <motion.button
              onClick={() => isClickable && onStepClick(step.id)}
              disabled={!isClickable}
              className="flex flex-col items-center gap-1.5 group"
              whileHover={isClickable ? { y: -2 } : {}}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                animate={{
                  background: isComplete ? '#00342B' : isCurrent ? '#1A1A1A' : 'rgba(232,224,213,0.9)',
                  borderColor: isComplete ? '#00342B' : isCurrent ? '#D4AF37' : 'rgba(200,185,165,0.6)',
                  scale: isCurrent ? 1.1 : 1,
                }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold"
                style={{ color: isComplete || isCurrent ? 'white' : '#AAA' }}
              >
                {isComplete ? (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }}>✓</motion.span>
                ) : (
                  <span style={{ fontSize: 16 }}>{step.icon}</span>
                )}
                {isCurrent && (
                  <motion.div
                    className="absolute inset-0 rounded-full border border-[#D4AF37]"
                    animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </motion.div>
              <div className="hidden md:flex flex-col items-center">
                <span className={`text-[10px] font-extrabold uppercase tracking-[0.14em] transition-colors ${isCurrent ? 'text-[#1A1A1A]' : isComplete ? 'text-[#00342B]' : 'text-[#BBB]'}`}>
                  {step.label}
                </span>
              </div>
            </motion.button>

            {i < STEPS.length - 1 && (
              <div className="relative flex-1 mx-2 h-px" style={{ minWidth: 32, maxWidth: 80, background: 'rgba(232,224,213,0.8)' }}>
                <motion.div
                  className="absolute inset-0 origin-left"
                  animate={{ scaleX: completedSteps.includes(step.id) ? 1 : 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  style={{ background: 'linear-gradient(90deg, #00342B, #D4AF37)' }}
                />
              </div>
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ─── Eyebrow tag ──────────────────────────────────────────────────────────────

function StepEyebrow({ step, tag }) {
  return (
    <div className="inline-flex items-center gap-2 mb-3 rounded-full border border-[rgba(212,175,55,0.3)] bg-[rgba(212,175,55,0.08)] py-1 pl-2 pr-4">
      <span className="rounded-full bg-[#D4AF37] px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#1A1A1A]">
        Step {step}
      </span>
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8B7340]">{tag}</span>
    </div>
  )
}

function StepHeading({ children }) {
  return (
    <>
      <h2 className="text-2xl md:text-3xl font-black text-[#1A1A1A]" style={{ fontFamily: "'Georgia', serif" }}>
        {children}
      </h2>
      <motion.div
        className="mt-2 h-0.5 max-w-20 bg-[linear-gradient(90deg,#D4AF37,#C8622A,transparent)]"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      />
    </>
  )
}

// ─── Chip select ──────────────────────────────────────────────────────────────

function ChipSelect({ name, options, value, onChange, error }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange({ target: { name, value: value === opt ? '' : opt } })}
          className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border transition-all ${
            value === opt
              ? 'bg-[#00342B] text-white border-[#00342B] shadow-[0_4px_12px_rgba(0,52,43,0.22)]'
              : `bg-white text-[#666] hover:border-[#D4AF37] hover:text-[#00342B] ${error ? 'border-[#C8622A]' : 'border-[#E8E0D5]'}`
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({ label, error, required, children }) {
  return (
    <div>
      <label className="block text-xs font-extrabold uppercase tracking-[0.14em] text-[#888] mb-2">
        {label} {required && <span className="text-[#C8622A]">*</span>}
      </label>
      {children}
      {error && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="text-xs text-[#C8622A] mt-1.5 font-medium">
          {error}
        </motion.p>
      )}
    </div>
  )
}

const inputCls = (err) =>
  `w-full px-4 py-3 text-sm bg-white border rounded-xl focus:outline-none placeholder:text-[#CCC] text-[#1A1A1A] transition-all ${
    err
      ? 'border-[#C8622A] focus:border-[#C8622A] focus:ring-1 focus:ring-[rgba(200,98,42,0.2)]'
      : 'border-[#E8E0D5] focus:border-[#D4AF37] focus:ring-1 focus:ring-[rgba(212,175,55,0.15)]'
  }`

// ─── Step 1: Photos ───────────────────────────────────────────────────────────

const PHOTO_SLOTS = [
  { label: 'Front View', required: true },
  { label: 'Back View',  required: true },
  { label: 'Side View',  required: true },
  { label: 'Detail Shot', required: false },
  { label: 'Full Look',   required: false },
]

function PhotosStep({ existingImages, newImageFiles, onAddFiles, onRemoveExisting, onRemoveNew, errors }) {
  const fileInputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  // Combine into a flat preview array: [{src, isExisting, idx}]
  const allPreviews = [
    ...existingImages.map((url, idx) => ({ src: url, isExisting: true, idx })),
    ...newImageFiles.map((f, idx) => ({ src: URL.createObjectURL(f), isExisting: false, idx })),
  ]

  const handleFiles = useCallback((files) => {
    const valid = Array.from(files).filter((f) => f instanceof File && f.type.startsWith('image/'))
    const remaining = 5 - allPreviews.length
    if (remaining <= 0) { toast.error('Maximum 5 images allowed'); return }
    onAddFiles(valid.slice(0, remaining))
  }, [allPreviews.length, onAddFiles])

  const handleDrop = (e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files) }

  const removeAt = (idx) => {
    const item = allPreviews[idx]
    if (item.isExisting) onRemoveExisting(item.idx)
    else onRemoveNew(item.idx)
  }

  return (
    <div className="space-y-8">
      <div>
        <StepEyebrow step={1} tag="Update Your Images" />
        <StepHeading>Photos</StepHeading>
        <p className="mt-3 text-sm text-[#888]">
          Keep at least 3 views. Drag to reorder — first image is your cover.
        </p>
      </div>

      {/* Drop zone */}
      <motion.div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        animate={{
          borderColor: isDragging ? '#D4AF37' : 'rgba(212,175,55,0.25)',
          background: isDragging ? 'rgba(212,175,55,0.06)' : 'transparent',
        }}
        className="relative rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
          onChange={(e) => handleFiles(e.target.files)} />
        <motion.div animate={{ y: isDragging ? -8 : 0 }} transition={{ duration: 0.3 }}>
          <div className="text-4xl mb-3">📷</div>
          <p className="text-sm font-bold text-[#1A1A1A] mb-1">Drag & drop new photos here</p>
          <p className="text-xs text-[#999]">or click to browse — up to 5 images total</p>
        </motion.div>
        {isDragging && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="absolute inset-0 rounded-2xl border-2 border-[#D4AF37] pointer-events-none" />
        )}
      </motion.div>

      {/* Photo slots grid */}
      <div className="grid grid-cols-5 gap-3">
        {PHOTO_SLOTS.map((slot, i) => {
          const item = allPreviews[i]
          return (
            <div key={slot.label} className="relative">
              <AnimatePresence mode="wait">
                {item ? (
                  <motion.div
                    key="filled"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    className="relative group rounded-xl overflow-hidden"
                    style={{ aspectRatio: '3/4', background: '#F0EBE3' }}
                  >
                    <img src={item.src} alt={slot.label} className="w-full h-full object-cover" />
                    {/* Existing badge */}
                    {item.isExisting && (
                      <div className="absolute top-1.5 left-1.5 bg-[#00342B]/80 backdrop-blur-sm text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                        Saved
                      </div>
                    )}
                    {/* New badge */}
                    {!item.isExisting && (
                      <div className="absolute top-1.5 left-1.5 bg-[#D4AF37]/90 text-[#1A1A1A] text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                        New
                      </div>
                    )}
                    {/* Remove overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeAt(i) }}
                        className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center hover:bg-red-500/80 transition-colors text-lg"
                      >×</button>
                    </div>
                    {/* Slot label */}
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <span className="text-[9px] font-bold text-white/80 uppercase tracking-wide bg-black/30 px-1.5 py-0.5 rounded">
                        {slot.label}
                      </span>
                    </div>
                    {slot.required && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#00342B] flex items-center justify-center">
                        <span className="text-white text-[8px]">✓</span>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.button
                    key="empty"
                    type="button"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full rounded-xl border-2 border-dashed border-[#E8E0D5] hover:border-[#D4AF37] transition-colors flex flex-col items-center justify-center gap-1 text-[#CCC] hover:text-[#D4AF37]"
                    style={{ aspectRatio: '3/4', background: '#FAFAF8' }}
                  >
                    <span className="text-lg">+</span>
                    <span className="text-[9px] font-semibold uppercase tracking-wide text-center px-1" style={{ color: 'inherit' }}>
                      {slot.label}
                    </span>
                    {slot.required && <span className="text-[8px] text-[#C8622A] font-bold">Required</span>}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 rounded-full bg-[#E8E0D5] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-[linear-gradient(90deg,#00342B,#D4AF37)]"
            animate={{ width: `${(allPreviews.length / 3) * 100}%` }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ maxWidth: '100%' }}
          />
        </div>
        <span className="text-xs font-semibold text-[#999] tabular-nums">{allPreviews.length}/5</span>
        {allPreviews.length >= 3 && (
          <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            className="text-[10px] font-bold text-[#00342B] uppercase tracking-widest">
            ✓ Ready
          </motion.span>
        )}
      </div>

      {errors.images && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-[#C8622A] font-medium text-center">
          {errors.images}
        </motion.p>
      )}
    </div>
  )
}

// ─── Step 2: Details ──────────────────────────────────────────────────────────

function DetailsStep({ form, onChange, errors }) {
  return (
    <div className="space-y-8">
      <div>
        <StepEyebrow step={2} tag="Tell Its Story" />
        <StepHeading>The Details</StepHeading>
      </div>

      <Field label="Outfit Name" error={errors.title} required>
        <input name="title" value={form.title} onChange={onChange}
          placeholder="e.g. Vintage Emerald Banarasi Lehenga with Zari Work"
          className={inputCls(errors.title)} />
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field label="Category" error={errors.category} required>
          <ChipSelect name="category" options={CATEGORY_OPTIONS} value={form.category} onChange={onChange} error={errors.category} />
        </Field>
        <Field label="Best For (Occasion)" error={errors.occasion} required>
          <ChipSelect name="occasion" options={OCCASION_OPTIONS} value={form.occasion} onChange={onChange} error={errors.occasion} />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Field label="Size" error={errors.size} required>
          <ChipSelect name="size" options={SIZE_OPTIONS} value={form.size} onChange={onChange} error={errors.size} />
        </Field>
        <Field label="Gender" error={errors.gender} required>
          <ChipSelect name="gender" options={GENDER_OPTIONS} value={form.gender} onChange={onChange} error={errors.gender} />
        </Field>
        <Field label="Condition" error={errors.condition} required>
          <ChipSelect name="condition" options={CONDITION_OPTIONS} value={form.condition} onChange={onChange} error={errors.condition} />
        </Field>
      </div>

      <Field label="Material / Fabric" error={errors.material} required>
        <div className="flex flex-wrap gap-2">
          {MATERIAL_OPTIONS.map((m) => (
            <button key={m} type="button"
              onClick={() => onChange({ target: { name: 'material', value: form.material === m ? '' : m } })}
              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border transition-all ${
                form.material === m
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                  : 'bg-white text-[#666] border-[#E8E0D5] hover:border-[#D4AF37]'
              }`}
            >{m}</button>
          ))}
        </div>
        <AnimatePresence>
          {form.material === 'Other' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3">
              <input name="customMaterial" value={form.customMaterial || ''} onChange={onChange}
                placeholder="e.g. Handloom Kantha" className={inputCls(errors.customMaterial)} />
              {errors.customMaterial && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-[#C8622A] mt-1.5 font-medium">{errors.customMaterial}</motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Field>

      <Field label="Description" error={errors.description} required>
        <textarea name="description" value={form.description} onChange={onChange} rows={5}
          placeholder="Share the story of this piece — fabric texture, embroidery, occasions it suits, what's included…"
          className={`${inputCls(errors.description)} resize-none leading-relaxed`} />
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-[#CCC]">Help renters fall in love with it</span>
          <span className="text-xs text-[#CCC] tabular-nums">{form.description.length}/500</span>
        </div>
      </Field>

      <Field label="Your Area / Locality" error={errors.area} required>
        <input name="area" value={form.area} onChange={onChange}
          placeholder="e.g. Andheri West, Bandra, Juhu"
          className={inputCls(errors.area)} />
        <p className="text-xs text-[#AAA] mt-1.5">
          Only locations between Virar and Andheri are serviceable right now.
        </p>
      </Field>
    </div>
  )
}

// ─── Step 3: Pricing ──────────────────────────────────────────────────────────

function PricingStep({ form, onChange, errors }) {
  const price = Number(form.pricePerDay) || 0
  const deposit = price * 2

  return (
    <div className="space-y-8">
      <div>
        <StepEyebrow step={3} tag="Update Your Rates" />
        <StepHeading>Pricing</StepHeading>
        <p className="mt-3 text-sm text-[#888]">Most listed outfits in Mumbai earn ₹600–₹2,500/day.</p>
      </div>

      <div>
        <label className="block text-xs font-extrabold uppercase tracking-[0.14em] text-[#888] mb-3">
          Rental Price Per Day <span className="text-[#C8622A]">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-black text-[#1A1A1A]">₹</span>
          <input
            name="pricePerDay"
            type="number"
            value={form.pricePerDay}
            onChange={onChange}
            placeholder="0"
            min="1"
            onWheel={(e) => e.currentTarget.blur()}
            className={`w-full pl-12 pr-6 py-5 text-3xl font-black bg-white rounded-2xl border-2 focus:outline-none transition-all text-[#1A1A1A] placeholder:text-[#DDD] ${errors.pricePerDay ? 'border-[#C8622A]' : 'border-[#E8E0D5] focus:border-[#D4AF37]'}`}
            style={{ fontFamily: "'Georgia', serif" }}
          />
        </div>
        {errors.pricePerDay && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-[#C8622A] mt-2 font-medium">
            {errors.pricePerDay}
          </motion.p>
        )}
      </div>

      <AnimatePresence>
        {price > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="grid grid-cols-3 gap-4">
            {[
              { label: 'Weekend Rental',   value: `₹${(price * 2).toLocaleString('en-IN')}`,  sub: '2 day booking'     },
              { label: 'Week Estimate',    value: `₹${(price * 3).toLocaleString('en-IN')}`,  sub: '3 day avg booking'  },
              { label: 'Monthly Potential', value: `₹${(price * 8).toLocaleString('en-IN')}`, sub: '8 days/month avg'  },
            ].map((card, i) => (
              <motion.div key={card.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-xl border border-[rgba(212,175,55,0.2)] bg-[rgba(212,175,55,0.05)] p-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#8B7340] mb-2">{card.label}</p>
                <p className="text-xl font-black text-[#00342B]" style={{ fontFamily: "'Georgia', serif" }}>{card.value}</p>
                <p className="text-[10px] text-[#AAA] mt-1">{card.sub}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="rounded-2xl border border-[#E8E0D5] bg-[#FAFAF8] p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#888] mb-1">Security Deposit</p>
            <p className="text-2xl font-black text-[#1A1A1A]" style={{ fontFamily: "'Georgia', serif" }}>
              ₹{deposit > 0 ? deposit.toLocaleString('en-IN') : '—'}
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
          The security deposit is collected from renters to protect your garment. It is fully refunded after a successful return.
        </p>
      </div>
    </div>
  )
}

// ─── Step 4: Review ───────────────────────────────────────────────────────────

function ReviewStep({ existingImages, newImageFiles, form, isDraft }) {
  const allPreviews = [
    ...existingImages,
    ...newImageFiles.map((f) => URL.createObjectURL(f)),
  ]
  const mainSrc = allPreviews[0]
  const price = Number(form.pricePerDay) || 0

  const Row = ({ label, value }) => (
    <div className="flex items-center justify-between py-3 border-b border-[#F0EBE3] last:border-0">
      <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#AAA]">{label}</span>
      <span className="text-sm font-semibold text-[#1A1A1A] text-right max-w-50">{value || '—'}</span>
    </div>
  )

  return (
    <div className="space-y-8">
      <div>
        <StepEyebrow step={4} tag="Almost There" />
        <StepHeading>{isDraft ? 'Review & Publish' : 'Review Changes'}</StepHeading>
      </div>

      {/* Change summary pill */}
      <div className="flex flex-wrap gap-2">
        {newImageFiles.length > 0 && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            {newImageFiles.length} new photo{newImageFiles.length > 1 ? 's' : ''}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[rgba(0,52,43,0.08)] text-[#00342B] border border-[rgba(0,52,43,0.15)]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          {isDraft ? 'Will go live after saving' : 'Updating live listing'}
        </span>
      </div>

      <div className="rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,52,43,0.1),0_0_0_1px_rgba(212,175,55,0.2)]" style={{ background: 'white' }}>
        <div className="relative" style={{ aspectRatio: '16/7', background: '#F0EBE3' }}>
          {mainSrc ? (
            <img src={mainSrc} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl opacity-30">🪭</div>
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_48%,rgba(0,0,0,0.55)_100%)]" />
          {allPreviews.length > 1 && (
            <div className="absolute bottom-3 right-3 flex gap-1.5">
              {allPreviews.slice(1, 4).map((src, i) => (
                <div key={i} className="w-10 h-10 rounded-lg overflow-hidden border border-white/40">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
              {allPreviews.length > 4 && (
                <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/40 flex items-center justify-center text-white text-xs font-bold">
                  +{allPreviews.length - 4}
                </div>
              )}
            </div>
          )}
          {form.category && (
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-extrabold uppercase tracking-widest text-[#1A1A1A]">
              {form.category}
            </div>
          )}
          {price > 0 && (
            <div className="absolute bottom-4 left-4">
              <span className="text-2xl font-black text-white" style={{ fontFamily: "'Georgia', serif" }}>₹{price.toLocaleString('en-IN')}</span>
              <span className="text-white/70 text-sm ml-1">/day</span>
            </div>
          )}
        </div>

        <div className="p-6">
          <h3 className="text-xl font-black text-[#1A1A1A] mb-1" style={{ fontFamily: "'Georgia', serif" }}>
            {form.title || 'Your Listing Title'}
          </h3>
          {form.area && (
            <p className="text-xs text-[#888] mb-4 flex items-center gap-1">
              <span>📍</span> {form.area}, Mumbai
            </p>
          )}
          <div className="h-0.5 bg-[linear-gradient(90deg,#D4AF37,rgba(212,175,55,0.2),transparent)] mb-4" />
          <Row label="Category"  value={form.category} />
          <Row label="Occasion"  value={form.occasion} />
          <Row label="Size"      value={form.size} />
          <Row label="Gender"    value={form.gender} />
          <Row label="Material"  value={form.material === 'Other' ? form.customMaterial : form.material} />
          <Row label="Condition" value={form.condition} />
          <Row label="Security Deposit" value={price > 0 ? `₹${(price * 2).toLocaleString('en-IN')}` : '—'} />
        </div>
      </div>

      <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[rgba(212,175,55,0.2)] text-xs text-[#888] leading-relaxed">
        By saving, you agree to ListnRent's{' '}
        <button className="text-[#C8622A] font-semibold hover:underline">Heritage Preservation Terms</button>{' '}
        and confirm that this garment is in the described condition.
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

const EditListing = () => {
  const navigate = useNavigate()
  const { listingId } = useParams()

  useSEO({
    title: 'Edit Listing',
    description: 'Edit your outfit listing details on ListnRent.',
    canonicalPath: `/edit/${listingId || ''}`,
    noIndex: true,
  })

  const { loading: authLoading, isAuthenticated } = useAuth()

  // Data loading
  const [pageLoading, setPageLoading] = useState(true)
  const [pageError, setPageError]   = useState(null)
  const [isDraft, setIsDraft] = useState(false)

  // Image state
  const [existingImages, setExistingImages] = useState([])  // Cloudinary URLs still kept
  const [newImageFiles, setNewImageFiles]   = useState([])  // File objects to upload

  // Form state
  const [form, setForm] = useState({
    title: '', category: '', occasion: '', size: '', condition: '',
    gender: '', material: '', customMaterial: '', pricePerDay: '',
    description: '', area: '',
  })
  const [errors, setErrors] = useState({})

  // Step state
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState([])

  // Submit state
  const [submitting, setSubmitting] = useState(false)
  const [saved, setSaved] = useState(false)

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate('/login')
  }, [isAuthenticated, authLoading, navigate])

  // Fetch listing
  useEffect(() => {
    if (!listingId) return
    const load = async () => {
      try {
        const res = await listingsApi.getById(listingId)
        const data = res.data.listing
        const isMaterialCustom = data.material && !normalizeOptions(MATERIALS).includes(data.material)
        setIsDraft(data.isDraft || false)
        setExistingImages(data.images || [])
        setForm({
          title:          data.title || '',
          category:       data.category || '',
          occasion:       data.occasion || '',
          size:           data.size || '',
          condition:      data.condition || '',
          gender:         data.gender || '',
          material:       isMaterialCustom ? 'Other' : (data.material || ''),
          customMaterial: isMaterialCustom ? data.material : '',
          pricePerDay:    data.pricePerDay || '',
          description:    data.description || '',
          area:           data.location?.area || '',
        })
        // All steps up to review pre-completed so user can jump around
        setCompletedSteps([1, 2, 3])
      } catch (err) {
        setPageError('Failed to load listing: ' + err.message)
      } finally {
        setPageLoading(false)
      }
    }
    load()
  }, [listingId])

  const handleChange = (e) => {
    const { name, value } = e.target
    let v = value
    if (name === 'title' && v) v = v.charAt(0).toUpperCase() + v.slice(1)
    setForm((prev) => ({ ...prev, [name]: v }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleAddFiles = useCallback((files) => {
    setNewImageFiles((prev) => [...prev, ...files].slice(0, 5 - existingImages.length))
  }, [existingImages.length])

  const handleRemoveExisting = useCallback((idx) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== idx))
  }, [])

  const handleRemoveNew = useCallback((idx) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== idx))
  }, [])

  const totalImages = existingImages.length + newImageFiles.length

  const validateStep = (step) => {
    const errs = {}
    if (step === 1) {
      if (totalImages < 3) errs.images = 'Minimum 3 photos required — Front, Back, and Side view'
    }
    if (step === 2) {
      if (!form.title.trim())   errs.title = 'Title is required'
      if (!form.category)       errs.category = 'Select a category'
      if (!form.occasion)       errs.occasion = 'Select an occasion'
      if (!form.size)           errs.size = 'Select a size'
      if (!form.gender)         errs.gender = 'Select gender'
      if (!form.condition)      errs.condition = 'Select condition'
      if (!form.material)       errs.material = 'Select material'
      if (form.material === 'Other' && !form.customMaterial?.trim()) errs.customMaterial = 'Enter custom material'
      if (!form.description.trim()) errs.description = 'Add a description'
      if (!form.area.trim())    errs.area = 'Your area is required'
    }
    if (step === 3) {
      if (!form.pricePerDay || Number(form.pricePerDay) < 1) errs.pricePerDay = 'Enter a valid price'
    }
    return errs
  }

  const handleNext = () => {
    const errs = validateStep(currentStep)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setCompletedSteps((prev) => [...new Set([...prev, currentStep])])
    setCurrentStep((prev) => Math.min(4, prev + 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const buildPayload = async (asDraft) => {
    let uploadedUrls = [...existingImages]
    if (newImageFiles.length > 0) {
      const newUrls = await uploadMultipleImages(newImageFiles)
      uploadedUrls = [...uploadedUrls, ...newUrls]
    }
    const pricePerDay = Number(form.pricePerDay) || 0
    const finalMaterial = form.material === 'Other' ? form.customMaterial.trim() : form.material
    return {
      title:       form.title.trim(),
      category:    form.category,
      occasion:    form.occasion,
      size:        form.size,
      condition:   form.condition,
      gender:      form.gender,
      material:    finalMaterial,
      description: form.description.trim(),
      pricePerDay,
      deposit:     pricePerDay * 2,
      location:    { area: form.area.trim(), city: 'Mumbai' },
      images:      uploadedUrls,
      isDraft:     asDraft,
      isActive:    !asDraft,
    }
  }

  const handleSave = async (asDraft = false) => {
    // Final validation
    const allErrs = { ...validateStep(1), ...validateStep(2), ...validateStep(3) }
    if (!asDraft && Object.keys(allErrs).length) {
      setErrors(allErrs)
      toast.error('Please fix errors before saving')
      return
    }
    try {
      setSubmitting(true)
      const payload = await buildPayload(asDraft)
      await listingsApi.update(listingId, payload)
      if (asDraft) {
        toast.success('Draft saved!')
        navigate('/dashboard', { state: { activeTab: 'listings' } })
      } else {
        toast.success('✨ Listing updated successfully!')
        setSaved(true)
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Loading / error screens ──
  if (authLoading || pageLoading) return <Loading message="Loading listing details…" />
  if (!isAuthenticated) return null
  if (pageError) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-4 pt-20">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-[#666] mb-6">{pageError}</p>
          <button onClick={() => navigate('/dashboard')}
            className="px-6 py-3 rounded-full bg-[#00342B] text-white text-sm font-bold">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // ── Success screen ──
  if (saved) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-4 pt-20 relative">
        <AmbientAccents />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 text-center max-w-md"
        >
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }} className="text-7xl mb-6">
            ✅
          </motion.div>
          <h1 className="text-3xl font-black text-[#1A1A1A] mb-3" style={{ fontFamily: "'Georgia', serif" }}>
            Listing Updated!
          </h1>
          <div className="h-0.5 w-32 mx-auto mb-4 bg-[linear-gradient(90deg,#D4AF37,#C8622A,transparent)]" />
          <p className="text-[#888] mb-8 text-sm leading-relaxed">
            Your changes are live. Renters will see the updated details immediately.
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate(`/listing/${listingId}`)}
              className="px-6 py-3 rounded-full bg-[#00342B] text-white text-sm font-bold tracking-wide shadow-[0_8px_24px_rgba(0,52,43,0.25)]">
              View Listing
            </button>
            <button onClick={() => navigate('/dashboard')}
              className="px-6 py-3 rounded-full border-2 border-[#D4AF37] text-[#00342B] text-sm font-bold tracking-wide">
              Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── Main render ──
  return (
    <div className="min-h-screen bg-[#FAF7F2] relative">
      <AmbientAccents />

      <div className="relative z-10 pt-24 pb-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#C8622A] mb-2">
              {isDraft ? 'Complete & Publish' : 'Update Listing'}
            </p>
            <h1 className="text-3xl md:text-4xl font-black text-[#1A1A1A] mb-3" style={{ fontFamily: "'Georgia', serif" }}>
              Edit Your Listing
            </h1>
            <p className="text-sm text-[#888]">
              {isDraft ? 'Finish filling in the details to take this live.' : 'Make changes and save to update your live listing.'}
            </p>
          </motion.div>

          {/* Step indicator */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-10 px-4">
            <StepIndicator currentStep={currentStep} completedSteps={completedSteps} onStepClick={setCurrentStep} />
          </motion.div>

          {/* Step content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20, filter: 'blur(4px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -20, filter: 'blur(4px)' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-3xl shadow-[0_4px_32px_rgba(0,52,43,0.07),0_0_0_1px_rgba(232,224,213,0.6)] p-6 md:p-10 mb-6"
            >
              {currentStep === 1 && (
                <PhotosStep
                  existingImages={existingImages}
                  newImageFiles={newImageFiles}
                  onAddFiles={handleAddFiles}
                  onRemoveExisting={handleRemoveExisting}
                  onRemoveNew={handleRemoveNew}
                  errors={errors}
                />
              )}
              {currentStep === 2 && (
                <DetailsStep form={form} onChange={handleChange} errors={errors} />
              )}
              {currentStep === 3 && (
                <PricingStep form={form} onChange={handleChange} errors={errors} />
              )}
              {currentStep === 4 && (
                <ReviewStep
                  existingImages={existingImages}
                  newImageFiles={newImageFiles}
                  form={form}
                  isDraft={isDraft}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="space-y-3">
            {/* Primary CTA */}
            <motion.button
              onClick={currentStep < 4 ? handleNext : () => handleSave(false)}
              disabled={submitting}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="w-full relative overflow-hidden py-3.5 rounded-xl bg-[#00342B] text-white text-sm font-bold tracking-[0.08em] shadow-[0_8px_24px_rgba(0,52,43,0.28)] disabled:opacity-60"
            >
              <span className="relative z-10">
                {submitting ? 'Saving…' : currentStep < 4 ? 'Continue →' : isDraft ? '🚀 Publish Listing' : '💾 Save Changes'}
              </span>
              <motion.div
                className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(212,175,55,0.18),transparent)]"
                style={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.5 }}
              />
            </motion.button>

            <div className="grid grid-cols-2 gap-3 md:flex md:items-center">
              {/* Back */}
              {currentStep > 1 ? (
                <button onClick={handleBack}
                  className="px-5 py-3.5 rounded-xl border border-[#E8E0D5] text-sm font-semibold text-[#666] hover:border-[#D4AF37] hover:text-[#1A1A1A] transition-all">
                  ← Back
                </button>
              ) : (
                <div className="hidden md:block w-20" />
              )}

              {/* Save as draft (only for currently-draft listings) */}
              {isDraft && (
                <button onClick={() => handleSave(true)} disabled={submitting}
                  className="px-5 py-3.5 rounded-xl border border-[#E8E0D5] text-sm font-semibold text-[#888] hover:border-[#D4AF37] hover:text-[#1A1A1A] transition-all disabled:opacity-50">
                  Save Draft
                </button>
              )}

              {/* Cancel */}
              <button onClick={() => navigate('/dashboard')} disabled={submitting}
                className="px-5 py-3.5 rounded-xl border border-[#E8E0D5] text-sm font-semibold text-[#888] hover:border-[#C8622A] hover:text-[#C8622A] transition-all disabled:opacity-50">
                Cancel
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-[#CCC] mt-5 tracking-widest">
            Step {currentStep} of {STEPS.length}
          </p>
        </div>
      </div>
    </div>
  )
}

export default EditListing