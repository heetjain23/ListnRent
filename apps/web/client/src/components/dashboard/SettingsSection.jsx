import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { api, usersApi } from '../../services/api'

const SettingsSection = ({ user, onDeleteAccount, onNameUpdate, onLogout }) => {
  const [isEditingName, setIsEditingName] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Delivery details state
  const [deliveryDetails, setDeliveryDetails] = useState({
    mobileNumber: '',
    deliveryAddress: '',
    landmark: '',
    pincode: '',
  })
  const [isEditingDelivery, setIsEditingDelivery] = useState(false)
  const [deliveryLoading, setDeliveryLoading] = useState(false)
  const [deliveryError, setDeliveryError] = useState(null)
  const [deliverySuccess, setDeliverySuccess] = useState(null)
  const [fetchingUserData, setFetchingUserData] = useState(true)

  // Fetch user profile from database
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const responseData = await usersApi.getProfile()
        const userData = responseData.user || responseData

        if (userData.displayName) {
          setDisplayName(userData.displayName)
        }

        if (userData.deliveryDetails) {
          setDeliveryDetails({
            mobileNumber: userData.deliveryDetails.mobileNumber || '',
            deliveryAddress: userData.deliveryDetails.deliveryAddress || '',
            landmark: userData.deliveryDetails.landmark || '',
            pincode: userData.deliveryDetails.pincode || '',
          })
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err)
      } finally {
        setFetchingUserData(false)
      }
    }

    fetchUserProfile()
  }, [])

  const handleSaveName = async () => {
    if (!displayName.trim()) {
      setUpdateError('Name cannot be empty')
      return
    }

    if (displayName === user?.displayName) {
      setIsEditingName(false)
      return
    }

    try {
      setIsUpdating(true)
      setUpdateError(null)

      await api('/api/users/profile', {
        auth: true,
        method: 'PATCH',
        body: JSON.stringify({ displayName: displayName.trim() }),
      })

      onNameUpdate?.(displayName.trim())
      setIsEditingName(false)
    } catch (err) {
      setUpdateError(err.message || 'Failed to update name')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeliveryInputChange = (e) => {
    const { name, value } = e.target
    setDeliveryDetails((prev) => ({
      ...prev,
      [name]: value,
    }))
    setDeliveryError(null)
  }

  const validateDeliveryDetails = () => {
    if (!deliveryDetails.mobileNumber.match(/^\d{10}$/)) {
      setDeliveryError('Please enter a valid 10-digit mobile number')
      return false
    }
    if (!deliveryDetails.deliveryAddress.trim()) {
      setDeliveryError('Delivery address is required')
      return false
    }
    if (!deliveryDetails.landmark.trim()) {
      setDeliveryError('Landmark is required')
      return false
    }
    if (!deliveryDetails.pincode.match(/^\d{6}$/)) {
      setDeliveryError('Please enter a valid 6-digit pincode')
      return false
    }
    return true
  }

  const handleSaveDeliveryDetails = async () => {
    if (!validateDeliveryDetails()) {
      return
    }

    setDeliveryLoading(true)
    setDeliveryError(null)
    setDeliverySuccess(null)

    try {
      await usersApi.updateDeliveryDetails(deliveryDetails)

      setDeliverySuccess('Delivery details saved successfully!')
      setIsEditingDelivery(false)
      setDeliveryLoading(false)

      // Clear success message after 3 seconds
      setTimeout(() => setDeliverySuccess(null), 3000)
    } catch (err) {
      setDeliveryError(err.message || 'Failed to save delivery details')
      setDeliveryLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Settings</h2>
        <p className="text-[#666]">Manage your profile and account</p>
      </div>

      <div className="bg-white rounded-lg border border-[#E8E0D5] p-6 md:p-8 space-y-6">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 pb-6 border-b border-[#E8E0D5]">
          {user?.photoURL && (
            <img
              src={user.photoURL}
              alt={user.displayName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-[#004D40]"
            />
          )}
          <div className="flex-1">
            <h3 className="text-xl sm:text-2xl font-bold text-[#1A1A1A]">{user?.displayName || 'User'}</h3>
            <p className="text-sm sm:text-base text-[#666] mt-1">{user?.email || 'No email provided'}</p>
          </div>
        </div>

        {/* Missing Phone Number Banner */}
        {!deliveryDetails.mobileNumber && !fetchingUserData && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-xl">📞</span>
              <div className="flex-1">
                <h4 className="font-semibold text-amber-900 mb-1">Add Your Phone Number</h4>
                <p className="text-sm text-amber-800 mb-3">
                  Please add your phone number and delivery address for a smooth checkout experience on your next purchase.
                </p>
                <button
                  onClick={() => setIsEditingDelivery(true)}
                  className="text-sm font-semibold text-amber-900 hover:text-amber-800 underline"
                >
                  Add Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Personal Information Section */}
        <div>
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">Personal Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E8E0D5] rounded-lg text-[#666] cursor-not-allowed text-sm md:text-base"
              />
              <p className="text-xs text-[#999] mt-2">Email cannot be changed</p>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Full Name</label>
              {isEditingName ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-3 border border-[#004D40] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D40] text-sm md:text-base"
                    placeholder="Enter your name"
                  />
                  {updateError && <p className="text-xs text-red-600">{updateError}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveName}
                      disabled={isUpdating}
                      className="flex-1 bg-[#004D40] text-white px-3 py-2 rounded-lg font-medium hover:bg-[#003830] transition-colors disabled:bg-gray-400 text-sm"
                    >
                      {isUpdating ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingName(false)
                        setDisplayName(user?.displayName || '')
                        setUpdateError(null)
                      }}
                      className="flex-1 border border-[#E8E0D5] text-[#666] px-3 py-2 rounded-lg font-medium hover:bg-[#F5F5F5] transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    value={displayName}
                    disabled
                    className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E8E0D5] rounded-lg text-[#1A1A1A] cursor-not-allowed text-sm md:text-base"
                  />
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="mt-2 text-[#004D40] font-medium text-sm hover:underline"
                  >
                    Edit Name
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Delivery Details Section */}
        <div className="border-t border-[#E8E0D5] pt-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-[#1A1A1A]">Delivery Address</h3>
            <button
              onClick={() => setIsEditingDelivery(!isEditingDelivery)}
              className="text-sm font-semibold text-[#004D40] hover:text-[#003830] transition-colors"
            >
              {isEditingDelivery ? '✕ Cancel' : '✎ Edit'}
            </button>
          </div>

          {deliveryError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
              ⚠️ {deliveryError}
            </div>
          )}

          {deliverySuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded text-sm">
              ✓ {deliverySuccess}
            </div>
          )}

          {isEditingDelivery ? (
            <div className="space-y-4">
              {/* Mobile Number */}
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Mobile Number</label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 bg-[#F5F5F5] border border-[#E8E0D5] rounded-l-lg text-sm text-[#666]">
                    +91
                  </span>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={deliveryDetails.mobileNumber}
                    onChange={handleDeliveryInputChange}
                    placeholder="9876543210"
                    maxLength="10"
                    className="flex-1 px-4 py-3 border border-l-0 border-[#E8E0D5] rounded-r-lg focus:outline-none focus:ring-2 focus:ring-[#004D40] placeholder-[#CCC] text-sm md:text-base"
                  />
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Delivery Address (Mumbai only)</label>
                <input
                  type="text"
                  name="deliveryAddress"
                  value={deliveryDetails.deliveryAddress}
                  onChange={handleDeliveryInputChange}
                  placeholder="Flat/House No, Building, Area"
                  className="w-full px-4 py-3 border border-[#E8E0D5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D40] placeholder-[#CCC] text-sm md:text-base"
                />
              </div>

              {/* Landmark and Pincode */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Landmark</label>
                  <input
                    type="text"
                    name="landmark"
                    value={deliveryDetails.landmark}
                    onChange={handleDeliveryInputChange}
                    placeholder="Near Gateway of India"
                    className="w-full px-4 py-3 border border-[#E8E0D5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D40] placeholder-[#CCC] text-sm md:text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={deliveryDetails.pincode}
                    onChange={handleDeliveryInputChange}
                    placeholder="400001"
                    maxLength="6"
                    className="w-full px-4 py-3 border border-[#E8E0D5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D40] placeholder-[#CCC] text-sm md:text-base"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsEditingDelivery(false)}
                  disabled={deliveryLoading}
                  className="flex-1 border border-[#E8E0D5] text-[#666] px-4 py-2 rounded-lg font-medium hover:bg-[#F5F5F5] transition-colors disabled:bg-gray-400 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDeliveryDetails}
                  disabled={deliveryLoading}
                  className="flex-1 bg-[#004D40] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#003830] transition-colors disabled:bg-gray-400 text-sm"
                >
                  {deliveryLoading ? 'Saving...' : 'Save Details'}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Display Mobile Number */}
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Mobile Number</label>
                <div className="px-4 py-3 bg-[#FAF7F2] border border-[#E8E0D5] rounded-lg text-[#1A1A1A] text-sm md:text-base">
                  {deliveryDetails.mobileNumber ? `+91 ${deliveryDetails.mobileNumber}` : 'Not added'}
                </div>
              </div>

              {/* Display Pincode */}
              <div>
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Pincode</label>
                <div className="px-4 py-3 bg-[#FAF7F2] border border-[#E8E0D5] rounded-lg text-[#1A1A1A] text-sm md:text-base">
                  {deliveryDetails.pincode || 'Not added'}
                </div>
              </div>

              {/* Display Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Delivery Address</label>
                <div className="px-4 py-3 bg-[#FAF7F2] border border-[#E8E0D5] rounded-lg text-[#1A1A1A] text-sm md:text-base">
                  {deliveryDetails.deliveryAddress || 'Not added'}
                </div>
              </div>

              {/* Display Landmark */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Landmark</label>
                <div className="px-4 py-3 bg-[#FAF7F2] border border-[#E8E0D5] rounded-lg text-[#1A1A1A] text-sm md:text-base">
                  {deliveryDetails.landmark || 'Not added'}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="pt-6 border-t border-[#E8E0D5] space-y-4">
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">Account Actions</h3>

          {/* Logout */}
          {onLogout && (
            <div>
              <button
                onClick={onLogout}
                className="w-full bg-[#004D40] text-white px-4 py-3 rounded-lg font-medium hover:bg-[#003830] transition-colors text-sm"
              >
                Log Out
              </button>
            </div>
          )}

          {/* Delete Account */}
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <h4 className="font-semibold text-red-900 mb-2">Delete Account</h4>
            <p className="text-sm text-red-800 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors text-sm"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <DeleteAccountConfirmation
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={onDeleteAccount}
        />
      )}
    </div>
  )
}

const DeleteAccountConfirmation = ({ onClose, onConfirm }) => {
  const [confirmText, setConfirmText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (typeof document === 'undefined') return

    const previousOverflow = document.body.style.overflow
    const previousHtmlOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'

    const preventScroll = (event) => {
      event.preventDefault()
    }

    const preventKeyboardScroll = (event) => {
      const scrollKeys = ['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ']
      if (scrollKeys.includes(event.key)) {
        event.preventDefault()
      }
    }

    document.addEventListener('wheel', preventScroll, { passive: false })
    document.addEventListener('touchmove', preventScroll, { passive: false })
    document.addEventListener('keydown', preventKeyboardScroll)

    return () => {
      document.body.style.overflow = previousOverflow
      document.documentElement.style.overflow = previousHtmlOverflow
      document.removeEventListener('wheel', preventScroll)
      document.removeEventListener('touchmove', preventScroll)
      document.removeEventListener('keydown', preventKeyboardScroll)
    }
  }, [])

  const isConfirmed = confirmText.toLowerCase().trim() === 'confirm'

  const handleDelete = async () => {
    if (!isConfirmed) return

    try {
      setIsLoading(true)
      setError(null)
      await onConfirm()
    } catch (err) {
      setError(err.message || 'Failed to delete account')
      setIsLoading(false)
    }
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[calc(100dvh-2rem)] overflow-y-auto">
        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">Delete Account</h2>

        <p className="text-[#666] mb-6">
          This action cannot be undone. All your listings will be permanently deleted.
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
            To delete account type "confirm" below
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type 'confirm'"
            className="w-full px-3 py-2 border border-[#E8E0D5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D40] text-sm"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-[#E8E0D5] rounded-lg font-medium text-[#666] hover:bg-[#F5F5F5] transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={!isConfirmed || isLoading}
            className={`flex-1 px-4 py-2 rounded-lg font-medium text-white transition-colors text-sm ${
              isConfirmed
                ? 'bg-red-600 hover:bg-red-700 cursor-pointer'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? 'Deleting...' : 'Delete Permanently'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default SettingsSection
