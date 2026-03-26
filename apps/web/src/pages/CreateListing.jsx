import React, { useState, useRef } from 'react'
import Button from '../components/ui/Button'
import { CATEGORIES } from '../constants'

const OUTFIT_CATEGORIES = CATEGORIES.filter((c) => c !== 'All')

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size', 'Custom']

const CreateListing = () => {
  const fileInputRef = useRef(null)
  const [previewImages, setPreviewImages] = useState([])
  const [form, setForm] = useState({
    title: '',
    category: '',
    size: '',
    pricePerDay: '',
    deposit: '',
    description: '',
    location: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    const previews = files.map((f) => URL.createObjectURL(f))
    setPreviewImages((prev) => [...prev, ...previews].slice(0, 5))
  }

  const removeImage = (index) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index))
  }

  const validate = () => {
    const newErrors = {}
    if (!form.title.trim()) newErrors.title = 'Title is required'
    if (!form.category) newErrors.category = 'Category is required'
    if (!form.pricePerDay || isNaN(form.pricePerDay)) newErrors.pricePerDay = 'Valid price required'
    if (!form.deposit || isNaN(form.deposit)) newErrors.deposit = 'Valid deposit required'
    if (!form.description.trim()) newErrors.description = 'Description is required'
    if (!form.location.trim()) newErrors.location = 'Location is required'
    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    // TODO: connect to backend API
    console.log('Form data:', { ...form, images: previewImages })
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 pt-16 px-6">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-3xl mb-2">
          ✓
        </div>
        <h2 className="text-2xl font-black text-[#1A1A1A]" style={{ fontFamily: "'Georgia', serif" }}>
          Listing submitted!
        </h2>
        <p className="text-sm text-[#888] text-center max-w-sm">
          Your outfit has been submitted for review. We'll notify you once it goes live.
        </p>
        <Button variant="primary" onClick={() => setSubmitted(false)} className="mt-2">
          List Another
        </Button>
      </div>
    )
  }

  return (
    <div className="pt-24 pb-20 max-w-2xl mx-auto px-6">
      <div className="mb-8">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#C8622A] mb-2">
          Start Earning
        </p>
        <h1
          className="text-3xl font-black text-[#1A1A1A]"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          List your outfit
        </h1>
        <p className="text-sm text-[#888] mt-2">
          Fill in the details and start renting in minutes. One-time listing fee applies.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
        {/* Image Upload */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-[#1A1A1A] mb-3">
            Photos <span className="text-[#AAA] font-normal text-xs">(up to 5)</span>
          </label>
          <div className="flex flex-wrap gap-3">
            {previewImages.map((src, i) => (
              <div key={i} className="relative w-20 h-24 rounded-xl overflow-hidden border border-[#E8E0D5]">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full
                    text-xs flex items-center justify-center hover:bg-black/80"
                >
                  ×
                </button>
              </div>
            ))}
            {previewImages.length < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-24 rounded-xl border-2 border-dashed border-[#D5CCC0]
                  flex flex-col items-center justify-center gap-1 hover:border-[#C8622A]
                  transition-colors group"
              >
                <svg className="w-5 h-5 text-[#CCC] group-hover:text-[#C8622A]" fill="none"
                  stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-xs text-[#BBB] group-hover:text-[#C8622A]">Add</span>
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

        <div className="space-y-5">
          {/* Title */}
          <Field label="Outfit Title" error={errors.title} required>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Banarasi Silk Saree — Deep Crimson"
              className={inputClass(errors.title)}
            />
          </Field>

          {/* Category + Size */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category" error={errors.category} required>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className={inputClass(errors.category)}
              >
                <option value="">Select…</option>
                {OUTFIT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Size">
              <select
                name="size"
                value={form.size}
                onChange={handleChange}
                className={inputClass()}
              >
                <option value="">Select…</option>
                {SIZES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Price + Deposit */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Rental Price / day (₹)" error={errors.pricePerDay} required>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#AAA]">₹</span>
                <input
                  name="pricePerDay"
                  type="number"
                  value={form.pricePerDay}
                  onChange={handleChange}
                  placeholder="e.g. 450"
                  min="0"
                  className={`${inputClass(errors.pricePerDay)} pl-7`}
                />
              </div>
            </Field>
            <Field label="Refundable Deposit (₹)" error={errors.deposit} required>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#AAA]">₹</span>
                <input
                  name="deposit"
                  type="number"
                  value={form.deposit}
                  onChange={handleChange}
                  placeholder="e.g. 2000"
                  min="0"
                  className={`${inputClass(errors.deposit)} pl-7`}
                />
              </div>
            </Field>
          </div>

          {/* Location */}
          <Field label="Your Location" error={errors.location} required>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g. Andheri West, Mumbai"
              className={inputClass(errors.location)}
            />
          </Field>

          {/* Description */}
          <Field label="Description" error={errors.description} required>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the outfit — fabric, embroidery, occasion, what's included…"
              className={`${inputClass(errors.description)} resize-none`}
            />
            <p className="text-xs text-[#BBB] mt-1">{form.description.length}/500</p>
          </Field>
        </div>

        {/* Info Banner */}
        <div className="mt-6 p-4 bg-[#FEF3EB] rounded-xl text-xs text-[#B05A22] leading-relaxed">
          <strong>How it works:</strong> Once submitted, we review your listing within 24 hours.
          A one-time listing fee applies. After each rental, you'll need to relist the outfit.
        </div>

        <div className="mt-6">
          <Button variant="accent" fullWidth size="lg" onClick={handleSubmit}>
            Submit Listing →
          </Button>
        </div>
      </div>
    </div>
  )
}

// Helper sub-components
const Field = ({ label, children, error, required }) => (
  <div>
    <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">
      {label} {required && <span className="text-[#C8622A]">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
)

const inputClass = (error) =>
  `w-full px-4 py-2.5 text-sm bg-[#FAFAFA] border rounded-lg focus:outline-none
  placeholder:text-[#CCC] text-[#1A1A1A] transition-colors ${
    error
      ? 'border-red-300 focus:border-red-400'
      : 'border-[#E8E0D5] focus:border-[#C8622A]'
  }`

export default CreateListing