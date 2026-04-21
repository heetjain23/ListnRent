import React, { useState, useMemo, useEffect } from "react";
import { useAdminUsers } from "../../../../hooks/useAdminUsers";

const AdminsManager = () => {
  const {
    admins,
    loading,
    error,
    fetchAdmins,
    addAdmin,
    deleteAdmin,
    updateAdminEmail,
  } = useAdminUsers();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editingEmail, setEditingEmail] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [saving, setSaving] = useState(false);

  // Fetch admins on component mount
  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  // Filter admins based on search query
  const filteredAdmins = useMemo(() => {
    if (!searchQuery.trim()) {
      return admins;
    }

    const query = searchQuery.toLowerCase();
    return admins.filter(
      (admin) =>
        admin.name.toLowerCase().includes(query) ||
        admin.email.toLowerCase().includes(query),
    );
  }, [admins, searchQuery]);

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) {
      alert("Please enter an email address");
      return;
    }

    setAdding(true);
    const result = await addAdmin(newAdminEmail);
    setAdding(false);

    if (result.success) {
      setNewAdminEmail("");
      setShowAddForm(false);
    } else {
      alert(result.error);
    }
  };

  const handleDeleteAdmin = (email, name) => {
    setDeleteConfirm({ email, name });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    setDeleting(true);
    const result = await deleteAdmin(deleteConfirm.email);
    setDeleting(false);

    if (result.success) {
      setDeleteConfirm(null);
    }
  };

  const handleEditEmail = (email) => {
    setEditingEmail(email);
    setEditingValue(email);
  };

  const saveEmailChange = async () => {
    if (!editingValue.trim() || editingValue === editingEmail) {
      setEditingEmail(null);
      return;
    }

    setSaving(true);
    const result = await updateAdminEmail(editingEmail, editingValue);
    setSaving(false);

    if (result.success) {
      setEditingEmail(null);
    } else {
      alert(result.error);
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

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div>
      {/* Search Bar and Add Button */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
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
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition"
        >
          + Add Admin
        </button>
      </div>

      {/* Add Admin Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex gap-3">
            <input
              type="email"
              placeholder="Enter admin email..."
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddAdmin}
              disabled={adding}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
            >
              {adding ? "Adding..." : "Add"}
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewAdminEmail("");
              }}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500">Loading admins...</div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredAdmins.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No admins found</p>
        </div>
      )}

      {/* Admins Table */}
      {!loading && filteredAdmins.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-3 p-4 bg-gray-50 border-b border-gray-200 font-semibold text-xs text-gray-700 uppercase tracking-wider">
            <div className="col-span-1 text-center">Image</div>
            <div className="col-span-2 text-center">Name</div>
            <div className="col-span-3 text-center">Email</div>
            <div className="col-span-2 text-center">Joined Date</div>
            <div className="col-span-2 text-center">Actions</div>
          </div>

          {/* Table Body */}
          <div>
            {filteredAdmins.map((admin) => (
              <div
                key={admin.id}
                className="grid grid-cols-12 gap-3 p-4 border-b border-gray-100 hover:bg-gray-50 transition items-center"
              >
                {/* Profile Image */}
                <div className="col-span-1 flex justify-center">
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                    {admin.photoURL ? (
                      <img
                        src={admin.photoURL}
                        alt={admin.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      getInitials(admin.name)
                    )}
                  </div>
                </div>

                {/* Admin Name */}
                <div className="col-span-2 text-center">
                  <p className="font-semibold text-gray-900 text-sm">
                    {admin.name}
                  </p>
                </div>

                {/* Admin Email */}
                <div className="col-span-3 text-center">
                  {editingEmail === admin.email ? (
                    <div className="flex gap-2 items-center justify-center">
                      <input
                        type="email"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        disabled={saving}
                      />
                      <button
                        onClick={saveEmailChange}
                        disabled={saving}
                        className="px-2 py-1 bg-teal-600 text-white rounded text-xs font-semibold hover:bg-teal-700 disabled:opacity-50"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-600 text-sm truncate">
                      {admin.email}
                    </p>
                  )}
                </div>

                {/* Joined Date */}
                <div className="col-span-2 text-center">
                  <p className="text-gray-600 text-sm">
                    {formatDate(admin.joinedDate)}
                  </p>
                </div>

                {/* Actions */}
                <div className="col-span-2 text-center flex gap-2 justify-center">
                  <button
                    onClick={() => handleEditEmail(admin.email)}
                    disabled={
                      editingEmail !== null && editingEmail !== admin.email
                    }
                    className="px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition disabled:opacity-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteAdmin(admin.email, admin.name)}
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
              Delete Admin
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{deleteConfirm.name}</span>? This
              action cannot be undone.
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

export default AdminsManager;
