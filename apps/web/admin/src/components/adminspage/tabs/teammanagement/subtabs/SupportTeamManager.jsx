import React, { useState, useMemo, useEffect } from "react";
import { useSupportTeam } from "../../../../../hooks/useSupportTeam";

const SupportTeamManager = () => {
  const {
    supportTeamMembers,
    loading,
    error,
    fetchSupportTeamMembers,
    addSupportTeamMember,
    updateSupportTeamMember,
    deleteSupportTeamMember,
    toggleSupportTeamMemberStatus,
  } = useSupportTeam();

  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState({
    email: "",
    phone: "",
  });
  const [adding, setAdding] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingEmail, setEditingEmail] = useState("");
  const [editingPhone, setEditingPhone] = useState("");
  const [saving, setSaving] = useState(false);

  // Fetch support team members on component mount
  useEffect(() => {
    fetchSupportTeamMembers();
  }, [fetchSupportTeamMembers]);

  // Filter support team members based on search query
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) {
      return supportTeamMembers;
    }

    const query = searchQuery.toLowerCase();
    return supportTeamMembers.filter(
      (member) =>
        member.name.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query),
    );
  }, [supportTeamMembers, searchQuery]);

  const handleAddMember = async () => {
    if (!newMember.email.trim() || !newMember.phone.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    setAdding(true);
    const result = await addSupportTeamMember(newMember);
    setAdding(false);

    if (result.success) {
      setNewMember({ email: "", phone: "" });
      setShowAddForm(false);
    } else {
      alert(result.error);
    }
  };

  const handleDeleteMember = (id, name) => {
    setDeleteConfirm({ id, name });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    setDeleting(true);
    const result = await deleteSupportTeamMember(deleteConfirm.id);
    setDeleting(false);

    if (result.success) {
      setDeleteConfirm(null);
    } else {
      alert(result.error);
    }
  };

  const handleToggleStatus = async (id) => {
    const result = await toggleSupportTeamMemberStatus(id);
    if (!result.success) {
      alert(result.error);
    }
  };

  const handleEditMember = (id, email, phone) => {
    setEditingId(id);
    setEditingEmail(email);
    setEditingPhone(phone);
  };

  const saveMemberChanges = async (id) => {
    if (!editingEmail.trim() || !editingPhone.trim()) {
      alert("Please fill in all fields");
      return;
    }

    setSaving(true);
    const result = await updateSupportTeamMember(id, {
      email: editingEmail,
      phone: editingPhone,
    });
    setSaving(false);

    if (result.success) {
      setEditingId(null);
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
          + Add Support Staff
        </button>
      </div>

      {/* Add Support Team Member Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="email"
                placeholder="Support staff email..."
                value={newMember.email}
                onChange={(e) =>
                  setNewMember({ ...newMember, email: e.target.value })
                }
                className="px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="tel"
                placeholder="Phone number..."
                value={newMember.phone}
                onChange={(e) =>
                  setNewMember({ ...newMember, phone: e.target.value })
                }
                className="px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAddMember}
                disabled={adding}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
              >
                {adding ? "Adding..." : "Add Staff"}
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewMember({ email: "", phone: "" });
                }}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg font-semibold transition"
              >
                Cancel
              </button>
            </div>
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
          <div className="text-gray-500">Loading support team members...</div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {searchQuery ? "No support team members found" : "No support team members yet"}
          </p>
        </div>
      )}

      {/* Support Team Table */}
      {!loading && filteredMembers.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white overflow-x-auto">
          {/* Table Header */}
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-center font-semibold text-xs text-gray-700 uppercase tracking-wider">Image</th>
                <th className="px-4 py-3 text-center font-semibold text-xs text-gray-700 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-center font-semibold text-xs text-gray-700 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-center font-semibold text-xs text-gray-700 uppercase tracking-wider">Phone</th>
                <th className="px-4 py-3 text-center font-semibold text-xs text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-center font-semibold text-xs text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  {/* Profile Image */}
                  <td className="px-4 py-3 text-center">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shrink-0 mx-auto">
                      {member.profileImage ? (
                        <img
                          src={member.profileImage}
                          alt={member.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        getInitials(member.name)
                      )}
                    </div>
                  </td>

                  {/* Member Name */}
                  <td className="px-4 py-3 text-center">
                    <p className="font-semibold text-gray-900 text-sm">
                      {member.name}
                    </p>
                  </td>

                  {/* Member Email */}
                  <td className="px-4 py-3 text-center">
                    {editingId === member.id ? (
                      <input
                        type="email"
                        value={editingEmail}
                        onChange={(e) => setEditingEmail(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        disabled={saving}
                      />
                    ) : (
                      <p className="text-gray-600 text-sm truncate">
                        {member.email}
                      </p>
                    )}
                  </td>

                  {/* Phone */}
                  <td className="px-4 py-3 text-center">
                    {editingId === member.id ? (
                      <input
                        type="tel"
                        value={editingPhone}
                        onChange={(e) => setEditingPhone(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        disabled={saving}
                      />
                    ) : (
                      <p className="text-gray-600 text-sm">{member.phone}</p>
                    )}
                  </td>

                  {/* Status Toggle */}
                  <td className="px-4 py-3 text-center">
                    <div>
                      <button
                        onClick={() => handleToggleStatus(member.id)}
                        disabled={editingId !== member.id}
                        title={editingId !== member.id ? "Click 'Edit' to change status" : "Click to toggle"}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                          editingId !== member.id
                            ? member.status === "ACTIVE"
                              ? "bg-green-100 text-green-700 cursor-not-allowed opacity-60"
                              : "bg-red-100 text-red-700 cursor-not-allowed opacity-60"
                            : member.status === "ACTIVE"
                              ? "bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer"
                              : "bg-red-100 text-red-700 hover:bg-red-200 cursor-pointer"
                        }`}
                      >
                        {member.status}
                      </button>
                      {editingId === member.id && (
                        <p className="text-xs text-gray-500 mt-1">Click to toggle</p>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-2 justify-center">
                      {editingId === member.id ? (
                        <>
                          <button
                            onClick={() => saveMemberChanges(member.id)}
                            disabled={saving}
                            className="px-3 py-2 text-sm font-semibold text-green-600 hover:bg-green-50 rounded-lg transition disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            disabled={saving}
                            className="px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-lg transition disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() =>
                              handleEditMember(member.id, member.email, member.phone)
                            }
                            className="px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteMember(member.id, member.name)
                            }
                            className="px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Delete Support Team Member
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

export default SupportTeamManager;
