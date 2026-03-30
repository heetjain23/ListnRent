import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import Button from '../components/ui/Button'
import { CATEGORIES, OCCASIONS, GENDER, SIZES, CONDITIONS, MATERIALS } from '../constants'
import { listingsApi } from '../services/api'
import { uploadMultipleImages } from '../services/cloudinary'

const OUTFIT_CATEGORIES = CATEGORIES.filter((c) => c !== 'All')
const OUTFIT_OCCASIONS = OCCASIONS.filter((o) => o !== 'All')
const OUTFIT_SIZES = SIZES.filter((s) => s !== 'All')
const OUTFIT_CONDITIONS = CONDITIONS
const OUTFIT_GENDERS = GENDER.filter((g) => g !== 'All')

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
  const [isDraftSubmitted, setIsDraftSubmitted] = useState(false)

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
    material: '',
    customMaterial: '',
    pricePerDay: '',
    description: '',
    area: '',
  })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    let finalValue = value
    
    // Auto-capitalize title
    if (name === 'title' && value) {
      finalValue = value.charAt(0).toUpperCase() + value.slice(1)
    }
    
    setForm((prev) => ({ ...prev, [name]: finalValue }))
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
    if (!form.material) newErrors.material = 'Required'
    if (form.material === 'Other' && !form.customMaterial.trim()) 
      newErrors.customMaterial = 'Please specify the material'
    if (!form.pricePerDay || isNaN(form.pricePerDay) || Number(form.pricePerDay) < 1)
      newErrors.pricePerDay = 'Valid price required'
    if (!form.description.trim()) newErrors.description = 'Required'
    if (!form.area.trim()) newErrors.area = 'Required'
    return newErrors
  }

  const handleSaveDraft = async () => {
    setSubmitError(null)
    
    setSubmitting(true)
    setUploading(true)
    try {
      let cloudinaryUrls = []
      
      // Upload images if any are provided
      if (imageFiles.length > 0) {
        console.log('[Draft] Uploading', imageFiles.length, 'images to Cloudinary...')
        cloudinaryUrls = await uploadMultipleImages(imageFiles)
      }
      setUploading(false)

      const pricePerDay = form.pricePerDay ? Number(form.pricePerDay) : 0
      const payload = {
        title: form.title || '',
        category: form.category || '',
        occasion: form.occasion || '',
        size: form.size || '',
        condition: form.condition || '',
        gender: form.gender || '',
        material: form.material === 'Other' ? form.customMaterial : form.material,
        pricePerDay: pricePerDay,
        deposit: pricePerDay > 0 ? pricePerDay * 2 : 0,
        description: form.description || '',
        location: { area: form.area || '', city: 'Mumbai' },
        images: cloudinaryUrls,
        userId: user?.uid || 'anonymous',
        isDraft: true, // Mark as draft
      }

      console.log('[Draft] Saving draft listing...')
      const res = await listingsApi.create(payload)
      setIsDraftSubmitted(true)
      setSubmitted(true)
      // Navigate to dashboard after short delay
      setTimeout(() => navigate('/dashboard', { state: { activeTab: 'listings' } }), 1500)
    } catch (err) {
      console.error('[Draft] Error:', err)
      setSubmitError(err.message || 'Failed to save draft')
      setUploading(false)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = async () => {
    setSubmitError(null)
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }

    // Validate images - minimum 3 required
    if (imageFiles.length < 3) {
      setSubmitError('Please upload at least 3 images (front, back, and side views)')
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
        material: form.material === 'Other' ? form.customMaterial : form.material,
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
          {isDraftSubmitted ? 'Draft saved!' : 'Listing published!'}
        </h2>
        <p className="text-sm text-[#888] text-center max-w-sm">
          {isDraftSubmitted ? 'Your draft has been saved. Taking you to the dashboard…' : 'Your outfit is now live. Taking you to the listing…'}
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
    <div className="pt-20 pb-16 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#C8622A] mb-2">
            Start Earning
          </p>
          <h1 className="text-3xl md:text-4xl font-black text-[#1A1A1A]" style={{ fontFamily: "'Georgia', serif" }}>
            Share Your Collection
          </h1>
          <p className="text-sm text-[#888] mt-2">
            Turn your curated wardrobe into a sustainable investment.
          </p>
        </div>

        {/* Main Form Container - Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Left Column - Visual Portfolio (Desktop) / Top (Mobile) */}
          <div className="lg:col-span-1 order-first lg:order-0">
            <VisualPortfolio 
              previewImages={previewImages}
              removeImage={removeImage}
              fileInputRef={fileInputRef}
              handleImageClick={() => fileInputRef.current?.click()}
              handleImageChange={handleImageChange}
              submitting={submitting}
            />
          </div>

          {/* Right Column - Form Fields */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm space-y-8">
              
              {/* The Essentials Section */}
              <FormSection title="The Essentials">
                <div className="space-y-5">
                  {/* Title */}
                  <Field label="Title of the Piece" error={errors.title} required>
                    <input name="title" value={form.title} onChange={handleChange}
                      placeholder="e.g. Vintage Emerald Banarasi Saree with Zari Work"
                      className={inputClass(errors.title)} />
                  </Field>

                  {/* Category + Material */}
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Category" error={errors.category} required>
                      <select name="category" value={form.category} onChange={handleChange}
                        className={inputClass(errors.category)}>
                        <option value="">Select…</option>
                        {OUTFIT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </Field>
                    <Field label="Material" error={errors.material} required>
                      <select name="material" value={form.material} onChange={handleChange}
                        className={inputClass(errors.material)}>
                        <option value="">Select…</option>
                        {MATERIALS.map((m) => <option key={m} value={m}>{m}</option>)}
                        <option value="Other">Other</option>
                      </select>
                    </Field>
                  </div>

                  {/* Custom Material Input - Shown when Other is selected */}
                  {form.material === 'Other' && (
                    <Field label="Specify Material" error={errors.customMaterial} required>
                      <input name="customMaterial" value={form.customMaterial} onChange={handleChange}
                        placeholder="e.g. Handloom, Jute, Tencel, etc."
                        className={inputClass(errors.customMaterial)} />
                    </Field>
                  )}

                  {/* Size + Condition */}
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Size" error={errors.size} required>
                      <select name="size" value={form.size} onChange={handleChange}
                        className={inputClass(errors.size)}>
                        <option value="">Select…</option>
                        {OUTFIT_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </Field>
                    <Field label="Condition" error={errors.condition} required>
                      <select name="condition" value={form.condition} onChange={handleChange}
                        className={inputClass(errors.condition)}>
                        <option value="">Select…</option>
                        {OUTFIT_CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </Field>
                  </div>

                  {/* Best For + Area */}
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Best For" error={errors.occasion} required>
                      <select name="occasion" value={form.occasion} onChange={handleChange}
                        className={inputClass(errors.occasion)}>
                        <option value="">Select…</option>
                        {OUTFIT_OCCASIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </Field>
                    <Field label="Your Area" error={errors.area} required>
                      <input name="area" value={form.area} onChange={handleChange}
                        placeholder="e.g. Andheri West"
                        className={inputClass(errors.area)} />
                    </Field>
                  </div>
                </div>
              </FormSection>

              {/* Curated Context Section */}
              <FormSection title="Curated Context">
                <div className="space-y-5">
                  {/* Gender */}
                  <Field label="Gender" error={errors.gender} required>
                    <select name="gender" value={form.gender} onChange={handleChange}
                      className={inputClass(errors.gender)}>
                      <option value="">Select…</option>
                      {OUTFIT_GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </Field>

                  {/* Description */}
                  <Field label="Description" error={errors.description} required>
                    <textarea name="description" value={form.description} onChange={handleChange}
                      rows={5} placeholder="Fabric, embroidery, occasion suitability, what's included…"
                      className={`${inputClass(errors.description)} resize-none`} />
                    <p className="text-xs text-[#AAA] mt-1 text-right">{form.description.length}/500</p>
                  </Field>
                </div>
              </FormSection>

              {/* Pricing & Security Section */}
              <FormSection title="Pricing & Security">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Price per Day */}
                    <Field label="Price per Day" error={errors.pricePerDay} required>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#1A1A1A]">₹</span>
                        <input name="pricePerDay" type="number" value={form.pricePerDay}
                          onChange={handleChange} placeholder="2,500" min="1"
                          className={`${inputClass(errors.pricePerDay)} pl-7`} />
                      </div>
                    </Field>

                    {/* Security Deposit */}
                    <Field label="Security Deposit" required>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#1A1A1A]">₹</span>
                        <input 
                          disabled 
                          type="number" 
                          value={form.pricePerDay ? Number(form.pricePerDay) * 2 : ''} 
                          placeholder="5,000"
                          className={`${inputClass(null)} pl-7 bg-[#F5F5F5] cursor-not-allowed`} 
                        />
                      </div>
                    </Field>
                  </div>
                  <p className="text-xs text-[#666] bg-[#FEF3EB] p-3 rounded-lg">
                    <strong>ℹ️ Note:</strong> Security deposit is calculated as 2× rental price for heritage preservation and protection.
                  </p>
                </div>
              </FormSection>

              {/* Terms Banner */}
              <div className="p-4 bg-[#FAFAFA] rounded-xl border border-[#E8E0D5] text-xs text-[#666] leading-relaxed">
                By submitting, you agree to our <a href="#" className="text-[#C8622A] font-semibold hover:underline">Heritage Preservation Terms & Condition Guidelines</a>
              </div>

              {/* Submit Error */}
              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
                  {submitError}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={handleSaveDraft}
                  className="flex-1 px-6 py-3 text-sm font-semibold text-[#1A1A1A] bg-[#F5F5F5] 
                    rounded-lg hover:bg-[#EFEFEF] transition-colors disabled:opacity-50"
                  disabled={submitting || uploading}
                >
                  {uploading ? '📸 Uploading...' : submitting ? '⏳ Saving...' : '💾 Save Draft'}
                </button>
                <Button variant="accent" fullWidth size="lg"
                  onClick={handleSubmit} disabled={submitting || uploading}>
                  {uploading ? '📸 Uploading images...' : submitting ? '⏳ Submitting…' : 'Publish Listing →'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper sub-components
const VisualPortfolio = ({ previewImages, removeImage, fileInputRef, handleImageClick, handleImageChange, submitting }) => (
  <div className="sticky top-24 lg:top-32">
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-widest mb-4">
        Visual Portfolio
      </h3>
      
      {/* Guidelines Banner */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
        <strong>📸 Required:</strong> Upload minimum 3 images - Front view, Back view, and Side view
      </div>

      <div className="space-y-3">
        {/* Row 1: Front Image */}
        <div>
          <p className="text-xs font-semibold text-[#666] mb-2">Front View *</p>
          <div className="relative h-32 rounded-xl border-2 border-dashed border-[#E8E0D5] 
            hover:border-[#C8622A] transition-colors group bg-[#FAFAFA] overflow-hidden
            flex items-center justify-center cursor-pointer"
            onClick={handleImageClick}
          >
            {previewImages.length > 0 ? (
              <>
                <img src={previewImages[0]} alt="Front View" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeImage(0)
                  }}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/60 text-white rounded-full
                    text-sm flex items-center justify-center hover:bg-black/80"
                >×</button>
              </>
            ) : (
              <div className="text-center">
                <svg className="w-6 h-6 text-[#CCC] group-hover:text-[#C8622A] mx-auto mb-1" 
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs text-[#AAA] group-hover:text-[#C8622A]">Add front image</p>
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Back and Side Views */}
        <div className="grid grid-cols-2 gap-2">
          {/* Back View */}
          <div>
            <p className="text-xs font-semibold text-[#666] mb-2">Back View *</p>
            <div className="relative h-24 rounded-lg border-2 border-dashed border-[#E8E0D5] 
              hover:border-[#C8622A] transition-colors group bg-[#FAFAFA] overflow-hidden
              flex items-center justify-center cursor-pointer"
              onClick={handleImageClick}
            >
              {previewImages.length > 1 ? (
                <>
                  <img src={previewImages[1]} alt="Back View" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeImage(1)
                    }}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full
                      text-xs flex items-center justify-center hover:bg-black/80"
                  >×</button>
                </>
              ) : (
                <svg className="w-4 h-4 text-[#CCC] group-hover:text-[#C8622A]" 
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )}
            </div>
          </div>

          {/* Side View */}
          <div>
            <p className="text-xs font-semibold text-[#666] mb-2">Side View *</p>
            <div className="relative h-24 rounded-lg border-2 border-dashed border-[#E8E0D5] 
              hover:border-[#C8622A] transition-colors group bg-[#FAFAFA] overflow-hidden
              flex items-center justify-center cursor-pointer"
              onClick={handleImageClick}
            >
              {previewImages.length > 2 ? (
                <>
                  <img src={previewImages[2]} alt="Side View" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeImage(2)
                    }}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full
                      text-xs flex items-center justify-center hover:bg-black/80"
                  >×</button>
                </>
              ) : (
                <svg className="w-4 h-4 text-[#CCC] group-hover:text-[#C8622A]" 
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )}
            </div>
          </div>
        </div>

        {/* Additional Images Grid */}
        <div>
          <p className="text-xs font-semibold text-[#666] mb-2">Additional Images (up to 2 more)</p>
          <div className="grid grid-cols-4 gap-2">
            {previewImages.slice(3).map((src, i) => (
              <div key={i + 3} className="relative h-20 rounded-lg overflow-hidden border border-[#E8E0D5] group">
                <img src={src} alt={`Additional ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i + 3)}
                  className="absolute top-1 right-1 w-4 h-4 bg-black/60 text-white rounded-full
                    text-xs flex items-center justify-center hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity"
                >×</button>
              </div>
            ))}
            
            {/* Add More Images Button */}
            {previewImages.length < 5 && (
              <button
                type="button"
                onClick={handleImageClick}
                disabled={submitting}
                className="h-20 rounded-lg border-2 border-dashed border-[#D5CCC0] 
                  hover:border-[#C8622A] transition-colors flex items-center justify-center
                  text-[#CCC] hover:text-[#C8622A] group disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Info Label */}
        <p className="text-xs text-[#AAA] text-center pt-2">
          {previewImages.length}/5 images uploaded
        </p>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" multiple
        className="hidden" onChange={handleImageChange} />
    </div>
  </div>
)

const FormSection = ({ title, children }) => (
  <div>
    <h2 className="text-sm font-bold text-[#1A1A1A] uppercase tracking-widest mb-5">
      {title}
    </h2>
    {children}
  </div>
)

const Field = ({ label, children, error, required }) => (
  <div>
    <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
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