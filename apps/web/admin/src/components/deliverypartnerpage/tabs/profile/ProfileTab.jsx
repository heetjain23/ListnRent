import React from 'react'
import { useAdminAuth } from '../../../../hooks/useAdminAuth'
import { adminApi } from '../../../../services/api'
import ProfileFormSubtab from './subtabs/ProfileFormSubtab'

const EMPTY_PROFILE = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
}

const REQUIRED_FIELDS = [
  { key: 'firstName', label: 'First name' },
  { key: 'lastName', label: 'Last name' },
  { key: 'phone', label: 'Phone number' },
  { key: 'address', label: 'Address' },
]

const isMissingValue = (value) => {
  if (value === null || value === undefined) {
    return true
  }

  const normalized = String(value).trim()
  return !normalized || normalized.toUpperCase() === 'N/A'
}

const ProfileTab = () => {
  const { admin } = useAdminAuth()
  const [isEditing, setIsEditing] = React.useState(false)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState('')
  const [successMessage, setSuccessMessage] = React.useState('')
  const [profileData, setProfileData] = React.useState(EMPTY_PROFILE)
  const [profileDraft, setProfileDraft] = React.useState(EMPTY_PROFILE)

  const fetchProfile = React.useCallback(async () => {
    if (!admin?.email) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await adminApi.getDeliveryPartnerProfile(admin.email)
      const fetchedProfile = response.profile || EMPTY_PROFILE

      const normalizedProfile = {
        firstName: fetchedProfile.firstName || '',
        lastName: fetchedProfile.lastName || '',
        email: fetchedProfile.email || admin.email,
        phone: fetchedProfile.phone || '',
        address: fetchedProfile.address || '',
      }

      setProfileData(normalizedProfile)
      setProfileDraft(normalizedProfile)
    } catch (err) {
      setError(err.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [admin?.email])

  React.useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const missingFields = React.useMemo(
    () => REQUIRED_FIELDS.filter((field) => isMissingValue(profileDraft[field.key])),
    [profileDraft]
  )

  React.useEffect(() => {
    if (!loading && missingFields.length > 0) {
      setIsEditing(true)
    }
  }, [loading, missingFields.length])

  const handleCancel = () => {
    setProfileDraft(profileData)
    setSuccessMessage('')
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!admin?.email) return

    setSaving(true)
    setError('')
    setSuccessMessage('')

    try {
      const payload = {
        firstName: profileDraft.firstName.trim(),
        lastName: profileDraft.lastName.trim(),
        phone: profileDraft.phone.trim(),
        address: profileDraft.address.trim(),
      }

      const response = await adminApi.updateDeliveryPartnerProfile(admin.email, payload)
      const updatedProfile = response.profile || payload

      const normalizedProfile = {
        firstName: updatedProfile.firstName || '',
        lastName: updatedProfile.lastName || '',
        email: updatedProfile.email || admin.email,
        phone: updatedProfile.phone || '',
        address: updatedProfile.address || '',
      }

      setProfileData(normalizedProfile)
      setProfileDraft(normalizedProfile)
      setIsEditing(false)
      setSuccessMessage('Profile updated successfully.')
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl">
        <h1 className="text-5xl font-bold leading-none text-teal-950 sm:text-6xl">My Profile</h1>
        <p className="mt-3 text-stone-600">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-5xl font-bold leading-none text-teal-950 sm:text-6xl">My Profile</h1>
          <p className="mt-2 text-stone-600">Manage your personal information and view your performance metrics.</p>
        </div>

        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-full bg-teal-900 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white"
          >
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-full bg-teal-900 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-full bg-stone-300 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-zinc-800"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {successMessage}
        </div>
      )}

      {missingFields.length > 0 && (
        <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">
          Please complete your profile. Missing: {missingFields.map((field) => field.label).join(', ')}.
        </div>
      )}

      <ProfileFormSubtab
        isEditing={isEditing}
        profileDraft={profileDraft}
        setProfileDraft={setProfileDraft}
        missingFields={missingFields.map((field) => field.key)}
      />
    </div>
  )
}

export default ProfileTab
