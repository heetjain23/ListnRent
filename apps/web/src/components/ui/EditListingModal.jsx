import React, { useState, useEffect } from 'react'
import Button from './Button'

const EditListingModal = ({ listing, onClose, onSave, loading = false }) => {
  const [formData, setFormData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (listing) {
      setFormData({
        title: listing.title || '',
        category: listing.category || '',
        occasion: listing.occasion || '',
        size: listing.size || '',
        gender: listing.gender || '',
        description: listing.description || '',
        pricePerDay: listing.pricePerDay || '',
        condition: listing.condition || '',
        location: {
          area: listing.location?.area || '',
          city: listing.location?.city || 'Mumbai',
        },
      })
    }
  }, [listing])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name.includes('.')) {
      const [parent, key] = name.split('.')
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [key]: value },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    try {
      // Auto-calculate deposit as 2x rental price
      const dataToSave = {
        ...formData,
        deposit: Number(formData.pricePerDay) * 2,
      }
      await onSave(dataToSave)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to update listing')
    }
  }

  if (!formData) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-[#E8E0D5] p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#1A1A1A]">Edit Listing</h2>
          <button
            onClick={onClose}
            className="text-2xl text-[#999] hover:text-[#1A1A1A]"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-[#FFE8E0] text-[#C8622A] rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-[#E8E0D5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8622A]"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-[#E8E0D5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8622A]"
              >
                <option value="">Select Category</option>
                <option value="Tuxedo">DESIGNER SUIT/ TUXEDO</option>
                <option value="Sherwani">INDO-WESTERN/ SHERWANI</option>
                <option value="Jodhpuri">JODHPURI</option>
                <option value="Kurta">KURTA JACKET</option>
                <option value="Blazer">BLAZER/ FORMAL SUIT</option>
                <option value="Saree">SAREE</option>
                <option value="Lehenga">LEHENGA</option>
                <option value="Navratri">NAVRATRI</option>
              </select>
            </div>

            {/* Occasion */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                Occasion *
              </label>
              <select
                name="occasion"
                value={formData.occasion}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-[#E8E0D5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8622A]"
              >
                <option value="">Select Occasion</option>
                <option value="Wedding">Wedding</option>
                <option value="Festive">Festive</option>
                <option value="Party">Party</option>
                <option value="Casual">Casual</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                Gender *
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-[#E8E0D5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8622A]"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* Size */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                Size *
              </label>
              <select
                name="size"
                value={formData.size}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-[#E8E0D5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8622A]"
              >
                <option value="">Select Size</option>
                <option value="XS(34)">XS(34)</option>
                <option value="S(36)">S(36)</option>
                <option value="M(38)">M(38)</option>
                <option value="L(40)">L(40)</option>
                <option value="XL(42)">XL(42)</option>
                <option value="XXL(44)">XXL(44)</option>
                <option value="3XL(46)">3XL(46)</option>
                <option value="4XL(48)">4XL(48)</option>
                <option value="5XL(50)">5XL(50)</option>
              </select>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                Condition *
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-[#E8E0D5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8622A]"
              >
                <option value="">Select Condition</option>
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Used">Used</option>
              </select>
            </div>

            {/* Price Per Day */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                Price Per Day (₹) *
              </label>
              <input
                type="number"
                name="pricePerDay"
                value={formData.pricePerDay}
                onChange={handleInputChange}
                required
                min="1"
                className="w-full px-4 py-2 border border-[#E8E0D5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8622A]"
              />
            </div>

            {/* Deposit Display */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                Refundable Deposit (₹)
              </label>
              <div className="w-full px-4 py-2 border border-[#E8E0D5] rounded-lg bg-[#FAFAFA] text-[#1A1A1A] flex items-center">
                <span className="text-sm" >
                  ₹{formData.pricePerDay ? Number(formData.pricePerDay) * 2 : '0'} (auto-calculated: 2× rental price)
                </span>
              </div>
            </div>

            {/* Area */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                Area/Locality *
              </label>
              <input
                type="text"
                name="location.area"
                value={formData.location.area}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-[#E8E0D5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8622A]"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                City
              </label>
              <input
                type="text"
                name="location.city"
                value={formData.location.city}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-[#E8E0D5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8622A]"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="4"
                className="w-full px-4 py-2 border border-[#E8E0D5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C8622A] resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-[#E8E0D5]">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditListingModal
