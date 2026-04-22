import React from 'react'

const ProfileFormSubtab = ({ isEditing, profileDraft, setProfileDraft, missingFields = [] }) => {
  const isMissing = (field) => missingFields.includes(field)

  const getInputClassName = (field, isTextArea = false) => {
    const baseClass = isTextArea
      ? 'min-h-24 rounded-lg border bg-[#f5f4e8] px-3 py-2 text-base font-semibold text-zinc-800 disabled:opacity-95'
      : 'rounded-lg border bg-[#f5f4e8] px-3 py-2 text-base font-semibold text-zinc-800 disabled:opacity-95'

    return `${baseClass} ${isMissing(field) ? 'border-amber-500' : 'border-stone-300'}`
  }

  return (
    <div className="grid grid-cols-1 gap-3 rounded-xl border border-stone-300 bg-[#f5f4e8] p-4 md:grid-cols-2">
      <label className="grid gap-1 text-[11px] font-bold uppercase tracking-wide text-stone-500">
        First Name
        <input
          type="text"
          disabled={!isEditing}
          value={profileDraft.firstName}
          onChange={(event) => setProfileDraft((prev) => ({ ...prev, firstName: event.target.value }))}
          className={getInputClassName('firstName')}
        />
      </label>

      <label className="grid gap-1 text-[11px] font-bold uppercase tracking-wide text-stone-500">
        Last Name
        <input
          type="text"
          disabled={!isEditing}
          value={profileDraft.lastName}
          onChange={(event) => setProfileDraft((prev) => ({ ...prev, lastName: event.target.value }))}
          className={getInputClassName('lastName')}
        />
      </label>

      <label className="grid gap-1 text-[11px] font-bold uppercase tracking-wide text-stone-500 md:col-span-2">
        Email
        <input
          type="email"
          disabled
          value={profileDraft.email}
          className={getInputClassName('email')}
        />
      </label>

      <label className="grid gap-1 text-[11px] font-bold uppercase tracking-wide text-stone-500 md:col-span-2">
        Phone Number
        <input
          type="text"
          disabled={!isEditing}
          value={profileDraft.phone}
          onChange={(event) => setProfileDraft((prev) => ({ ...prev, phone: event.target.value }))}
          className={getInputClassName('phone')}
        />
      </label>

      <label className="grid gap-1 text-[11px] font-bold uppercase tracking-wide text-stone-500 md:col-span-2">
        Address
        <textarea
          disabled={!isEditing}
          value={profileDraft.address}
          onChange={(event) => setProfileDraft((prev) => ({ ...prev, address: event.target.value }))}
          className={getInputClassName('address', true)}
        />
      </label>
    </div>
  )
}

export default ProfileFormSubtab
