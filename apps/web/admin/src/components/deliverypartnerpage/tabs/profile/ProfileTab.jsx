import React from 'react'
import { profileData } from '../../mockData'
import ProfileFormSubtab from './subtabs/ProfileFormSubtab'

const ProfileTab = () => {
  const [isEditing, setIsEditing] = React.useState(false)
  const [profileDraft, setProfileDraft] = React.useState(profileData)

  const handleCancel = () => {
    setProfileDraft(profileData)
    setIsEditing(false)
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
              onClick={() => setIsEditing(false)}
              className="rounded-full bg-teal-900 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white"
            >
              Save
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

      <ProfileFormSubtab
        isEditing={isEditing}
        profileDraft={profileDraft}
        setProfileDraft={setProfileDraft}
      />
    </div>
  )
}

export default ProfileTab
