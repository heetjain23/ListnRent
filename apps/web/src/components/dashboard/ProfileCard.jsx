import React from 'react'

const ProfileCard = ({ user, listings }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#E8E0D5] p-6 mb-8">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          {user.photoURL && (
            <img
              src={user.photoURL}
              alt={user.displayName || 'Profile'}
              className="w-16 h-16 rounded-full object-cover border-2 border-[#C8622A]"
            />
          )}
          <div>
            <h2 className="text-2xl font-bold text-[#1A1A1A]">
              {user.displayName || 'Welcome!'}
            </h2>
            <p className="text-[#666] text-sm">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-[#E8E0D5] pt-4">
        <h3 className="font-semibold text-[#1A1A1A] mb-3 text-sm">Account Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[#999] text-xs uppercase tracking-wide">Email</p>
            <p className="text-[#1A1A1A] font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-[#999] text-xs uppercase tracking-wide">Total Listings</p>
            <p className="text-[#1A1A1A] font-medium">{listings.length}</p>
          </div>
          <div>
            <p className="text-[#999] text-xs uppercase tracking-wide">Active Listings</p>
            <p className="text-[#1A1A1A] font-medium">
              {listings.filter((l) => l.isActive).length}
            </p>
          </div>
          <div>
            <p className="text-[#999] text-xs uppercase tracking-wide">Display Name</p>
            <p className="text-[#1A1A1A] font-medium">{user.displayName || 'Not set'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileCard
