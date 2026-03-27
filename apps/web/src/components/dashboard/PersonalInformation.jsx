import React from 'react'

const PersonalInformation = ({ user }) => {
  const formatDate = (date) => {
    if (!date) return 'Not available'
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Personal Information</h2>
        <p className="text-[#666]">Your profile and account details</p>
      </div>

      <div className="bg-white rounded-lg border border-[#E8E0D5] p-8">
        {/* Profile Header */}
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-[#E8E0D5]">
          {user?.photoURL && (
            <img
              src={user.photoURL}
              alt={user.displayName}
              className="w-20 h-20 rounded-full object-cover border-2 border-[#C8622A]"
            />
          )}
          <div>
            <h3 className="text-2xl font-bold text-[#1A1A1A]">{user?.displayName || 'User'}</h3>
            <p className="text-[#666] mt-1">{user?.email || 'No email provided'}</p>
            <p className="text-[#999] text-sm mt-2">UID: {user?.uid}</p>
          </div>
        </div>

        {/* Account Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Email Address</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E8E0D5] rounded-lg text-[#666] cursor-not-allowed"
            />
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Full Name</label>
            <input
              type="text"
              value={user?.displayName || ''}
              disabled
              className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E8E0D5] rounded-lg text-[#666] cursor-not-allowed"
            />
          </div>

          {/* Account Created Date */}
          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Account Created</label>
            <input
              type="text"
              value={formatDate(user?.metadata?.creationTime)}
              disabled
              className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E8E0D5] rounded-lg text-[#666] cursor-not-allowed"
            />
          </div>

          {/* Last Sign In */}
          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Last Sign In</label>
            <input
              type="text"
              value={formatDate(user?.metadata?.lastSignInTime)}
              disabled
              className="w-full px-4 py-3 bg-[#FAF7F2] border border-[#E8E0D5] rounded-lg text-[#666] cursor-not-allowed"
            />
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 pt-8 border-t border-[#E8E0D5]">
          <h4 className="text-lg font-semibold text-[#1A1A1A] mb-4">Account Status</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-700 font-medium">✓ Email Verified</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700 font-medium">✓ Active Account</p>
            </div>
          </div>
        </div>

        {/* Info Note */}
        <div className="mt-8 p-4 bg-[#FFF5EE] border border-[#FFE4D6] rounded-lg">
          <p className="text-sm text-[#AA6B3C]">
            ℹ️ Your profile information is managed by RentFit. To update your name or photo, please visit your account settings.
          </p>
        </div>
      </div>
    </div>
  )
}

export default PersonalInformation
