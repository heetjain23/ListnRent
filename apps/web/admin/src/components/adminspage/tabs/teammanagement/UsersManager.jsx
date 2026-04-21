import React, { useState, useMemo, useEffect } from "react";
import { useAdminUsers } from "../../../../hooks/useAdminUsers";

const UsersManager = () => {
  const { users, loading, error, fetchUsers, deleteUser } = useAdminUsers();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) {
      return users;
    }

    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query),
    );
  }, [users, searchQuery]);

  const handleDelete = async (userId, userName) => {
    setDeleteConfirm({ userId, userName });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    setDeleting(true);
    const result = await deleteUser(deleteConfirm.userId);
    setDeleting(false);

    if (result.success) {
      setDeleteConfirm(null);
    }
  };

  // Get initials for avatar
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          />
          <svg
            className="absolute right-3 top-3 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Showing {filteredUsers.length} of {users.length} users
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500">Loading users...</div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No users found</p>
        </div>
      )}

      {/* Users Table */}
      {!loading && filteredUsers.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-3 p-4 bg-gray-50 border-b border-gray-200 font-semibold text-xs text-gray-700 uppercase tracking-wider">
            <div className="col-span-1 text-center">Image</div>
            <div className="col-span-2 text-center">Name</div>
            <div className="col-span-3 text-center">Email</div>
            <div className="col-span-2 text-center">Total Rentals</div>
            <div className="col-span-2 text-center">Total Listings</div>
            <div className="col-span-2 text-center">Actions</div>
          </div>

          {/* Table Body */}
          <div>
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-12 gap-3 p-4 border-b border-gray-100 hover:bg-gray-50 transition items-center"
              >
                {/* Profile Image */}
                <div className="col-span-1 flex justify-center">
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      getInitials(user.name)
                    )}
                  </div>
                </div>

                {/* User Name */}
                <div className="col-span-2 text-center">
                  <p className="font-semibold text-gray-900 text-sm">
                    {user.name}
                  </p>
                </div>

                {/* User Email */}
                <div className="col-span-3 text-center">
                  <p className="text-gray-600 text-sm truncate">{user.email}</p>
                </div>

                {/* Total Rentals */}
                <div className="col-span-2">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {String(user.totalRentals).padStart(2, "0")}
                    </div>
                  </div>
                </div>

                {/* Total Listings */}
                <div className="col-span-2">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {String(user.totalListings).padStart(2, "0")}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="col-span-2 text-center">
                  <button
                    onClick={() => handleDelete(user.id, user.name)}
                    className="px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Delete User
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{deleteConfirm.userName}</span>?
              This action cannot be undone. All their listings and bookings will
              also be deleted.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold text-sm"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold text-sm disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManager;
