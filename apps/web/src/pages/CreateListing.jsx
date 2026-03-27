import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'
import { CATEGORIES, GENDER } from '../constants'
import { listingsApi } from '../services/api'
import { uploadMultipleImages } from '../services/cloudinary'

const OUTFIT_CATEGORIES = CATEGORIES.filter((c) => c !== 'All')
const OCCASIONS = ['DESIGNER SUIT/ TUXEDO','INDO-WESTERN/ SHERWANI','JODHPURI','KURTA JACKET','BLAZER/ FORMAL SUIT','SAREE','LEHENGA','NAVRATRI',]
const SIZES = ['XS(34)','S(36)','M(38)','L(40)','XL(42)','XXL(44)','3XL(46)','4XL(48)','5XL(50)',]
const CONDITIONS = ['New', 'Like New', 'Used']
const GENDERS = GENDER.filter((g) => g !== 'All')

const CreateListing = () => {
  const navigate = useNavigate()
  const { user, loading, isAuthenticated } = useAuth()
  const fileInputRef = useRef(null)
  const [previewImages, setPreviewImages] = useState([])
  const [imageFiles, setImageFiles] = useState([]) // Track actual file objects
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', {
        state: {
          from: { pathname: '/create' },
          intent: 'create-listing',
        },
      })
    }
  }, [isAuthenticated, loading, navigate])

  const [form, setForm] = useState({
    title: '',
    category: '',
    occasion: '',
    size: '',
    condition: '',
    gender: '',
    pricePerDay: '',
    description: '',
    area: '',
  })
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
    setImageFiles((prev) => [...prev, ...files].slice(0, 5))
  }

  const removeImage = (index) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index))
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const validate = () => {
    const newErrors = {}
    if (!form.title.trim()) newErrors.title = 'Required'
    if (!form.category) newErrors.category = 'Required'
    if (!form.occasion) newErrors.occasion = 'Required'
    if (!form.size) newErrors.size = 'Required'
    if (!form.condition) newErrors.condition = 'Required'
    if (!form.gender) newErrors.gender = 'Required'
    if (!form.pricePerDay || isNaN(form.pricePerDay) || Number(form.pricePerDay) < 1)
      newErrors.pricePerDay = 'Valid price required'
    if (!form.description.trim()) newErrors.description = 'Required'
    if (!form.area.trim()) newErrors.area = 'Required'
    return newErrors
  }

  const handleSubmit = async () => {
    setSubmitError(null)
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }

    // Validate images
    if (imageFiles.length === 0) {
      setSubmitError('Please upload at least one image')
      return
    }

    setSubmitting(true)
    setUploading(true)
    try {
      // Upload images to Cloudinary
      console.log('[Listing] Uploading', imageFiles.length, 'images to Cloudinary...')
      const cloudinaryUrls = await uploadMultipleImages(imageFiles)
      setUploading(false)

      const pricePerDay = Number(form.pricePerDay)
      const payload = {
        title: form.title,
        category: form.category,
        occasion: form.occasion,
        size: form.size,
        condition: form.condition,
        gender: form.gender,
        pricePerDay: pricePerDay,
        deposit: pricePerDay * 2, // Auto-calculate as 2x rental price
        description: form.description,
        location: { area: form.area, city: 'Mumbai' },
        images: cloudinaryUrls, // Use Cloudinary URLs
        userId: user?.uid || 'anonymous', // Include user ID from Firebase
      }

      console.log('[Listing] Creating listing with Cloudinary images...')
      const res = await listingsApi.create(payload)
      setSubmitted(true)
      // Navigate to the new listing after short delay
      setTimeout(() => navigate(`/listing/${res.data.listing._id}`), 1500)
    } catch (err) {
      setSubmitError(err.message)
      setUploading(false)
    } finally {
      setSubmitting(false)
    }
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
          Your outfit is now live. Taking you to the listing…
        </p>
      </div>
    )
  }

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 pt-16 px-6">
        <div className="text-4xl animate-spin mb-4">⏳</div>
        <p className="text-[#666]">Checking your authentication...</p>
      </div>
    )
  }

  // Already redirected to login if not authenticated via useEffect
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="pt-24 pb-20 max-w-2xl mx-auto px-6">
      <div className="mb-8">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#C8622A] mb-2">
          Start Earning
        </p>
        <h1 className="text-3xl font-black text-[#1A1A1A]" style={{ fontFamily: "'Georgia', serif" }}>
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
                >×</button>
              </div>
            ))}
            {previewImages.length < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-24 rounded-xl border-2 border-dashed border-[#D5CCC0]
                  flex flex-col items-center justify-center gap-1 hover:border-[#C8622A] transition-colors group"
              >
                <svg className="w-5 h-5 text-[#CCC] group-hover:text-[#C8622A]" fill="none"
                  stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-xs text-[#BBB] group-hover:text-[#C8622A]">Add</span>
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple
            className="hidden" onChange={handleImageChange} />
        </div>

        <div className="space-y-5">
          {/* Title */}
          <Field label="Outfit Title" error={errors.title} required>
            <input name="title" value={form.title} onChange={handleChange}
              placeholder="e.g. Banarasi Silk Saree — Deep Crimson"
              className={inputClass(errors.title)} />
          </Field>

          {/* Category + Occasion + Gender */}
          <div className="grid grid-cols-3 gap-4">
            <Field label="Category" error={errors.category} required>
              <select name="category" value={form.category} onChange={handleChange}
                className={inputClass(errors.category)}>
                <option value="">Select…</option>
                {OUTFIT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Occasion" error={errors.occasion} required>
              <select name="occasion" value={form.occasion} onChange={handleChange}
                className={inputClass(errors.occasion)}>
                <option value="">Select…</option>
                {OCCASIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Gender" error={errors.gender} required>
              <select name="gender" value={form.gender} onChange={handleChange}
                className={inputClass(errors.gender)}>
                <option value="">Select…</option>
                {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </Field>
          </div>

          {/* Size + Condition */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Size" error={errors.size} required>
              <select name="size" value={form.size} onChange={handleChange}
                className={inputClass(errors.size)}>
                <option value="">Select…</option>
                {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Condition" error={errors.condition} required>
              <select name="condition" value={form.condition} onChange={handleChange}
                className={inputClass(errors.condition)}>
                <option value="">Select…</option>
                {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>

          {/* Price with Deposit Info */}
          <Field label="Rental Price / day (₹)" error={errors.pricePerDay} required>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#AAA]">₹</span>
              <input name="pricePerDay" type="number" value={form.pricePerDay}
                onChange={handleChange} placeholder="e.g. 450" min="1"
                className={`${inputClass(errors.pricePerDay)} pl-7`} />
            </div>
          </Field>
          {form.pricePerDay && !errors.pricePerDay && (
            <p className="text-xs text-[#666] -mt-3 bg-[#FEF3EB] p-2 rounded">
              ✓ Refundable deposit will be <strong>₹{Number(form.pricePerDay) * 2}</strong> (2× rental price)
            </p>
          )}

          {/* Area */}
          <Field label="Your Area" error={errors.area} required>
            <input name="area" value={form.area} onChange={handleChange}
              placeholder="e.g. Andheri West"
              className={inputClass(errors.area)} />
          </Field>

          {/* Description */}
          <Field label="Description" error={errors.description} required>
            <textarea name="description" value={form.description} onChange={handleChange}
              rows={4} placeholder="Fabric, embroidery, occasion suitability, what's included…"
              className={`${inputClass(errors.description)} resize-none`} />
            <p className="text-xs text-[#BBB] mt-1">{form.description.length}/500</p>
          </Field>
        </div>

        {/* Info Banner */}
        <div className="mt-6 p-4 bg-[#FEF3EB] rounded-xl text-xs text-[#B05A22] leading-relaxed">
          <strong>How it works:</strong> Once submitted, your listing goes live instantly.
          A one-time listing fee applies. After each rental, you'll need to relist.
        </div>

        {/* Submit Error */}
        {submitError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
            {submitError}
          </div>
        )}

        <div className="mt-6">
          <Button variant="accent" fullWidth size="lg"
            onClick={handleSubmit} disabled={submitting || uploading}>
            {uploading ? '📸 Uploading images...' : submitting ? '⏳ Submitting…' : 'Submit Listing →'}
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
    error ? 'border-red-300 focus:border-red-400' : 'border-[#E8E0D5] focus:border-[#C8622A]'
  }`

export default CreateListing