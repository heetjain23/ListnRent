import React from "react";

const ProfileCard = ({ user, listings }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-[#E8E0D5] p-6 mb-8">
        <h3 className="font-semibold text-[#1A1A1A] mb-3 text-sm">
          Account Details
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[#999] text-xs uppercase tracking-wide">
              Active Listings
            </p>
            <p className="text-[#1A1A1A] font-medium">
              {listings.filter((l) => l.isActive).length}
            </p>
          </div>
          <div>
            <p className="text-[#999] text-xs uppercase tracking-wide">
              Total Listings
            </p>
            <p className="text-[#1A1A1A] font-medium">{listings.length}</p>
          </div>
      </div>
    </div>
  );
};

export default ProfileCard;
