import React, { useState, useMemo, useEffect } from "react";
import { useDeliveryPartners } from "../../../../../hooks/useDeliveryPartners";

const DeliveryPartnerManager = () => {
  const {
    deliveryPartners,
    loading,
    error,
    fetchDeliveryPartners,
    addDeliveryPartner,
    updateDeliveryPartner,
    deleteDeliveryPartner,
    toggleDeliveryPartnerStatus,
  } = useDeliveryPartners();

  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPartner, setNewPartner] = useState({
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

  // Fetch delivery partners on component mount
  useEffect(() => {
    fetchDeliveryPartners();
  }, [fetchDeliveryPartners]);

  // Filter delivery partners based on search query
  const filteredPartners = useMemo(() => {
    if (!searchQuery.trim()) {
      return deliveryPartners;
    }

    const query = searchQuery.toLowerCase();
    return deliveryPartners.filter(
      (partner) =>
        partner.name.toLowerCase().includes(query) ||
        partner.email.toLowerCase().includes(query),
    );
  }, [deliveryPartners, searchQuery]);

  const handleAddPartner = async () => {
    if (!newPartner.email.trim() || !newPartner.phone.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    setAdding(true);
    const result = await addDeliveryPartner(newPartner);
    setAdding(false);

    if (result.success) {
      setNewPartner({ email: "", phone: "" });
      setShowAddForm(false);
    } else {
      alert(result.error);
    }
  };

  const handleDeletePartner = (id, name) => {
    setDeleteConfirm({ id, name });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    setDeleting(true);
    const result = await deleteDeliveryPartner(deleteConfirm.id);
    setDeleting(false);

    if (result.success) {
      setDeleteConfirm(null);
    } else {
      alert(result.error);
    }
  };

  const handleToggleStatus = async (id) => {
    const result = await toggleDeliveryPartnerStatus(id);
    if (!result.success) {
      alert(result.error);
    }
  };

  const handleEditPartner = (id, email, phone) => {
    setEditingId(id);
    setEditingEmail(email);
    setEditingPhone(phone);
  };

  const savePartnerChanges = async (id) => {
    if (!editingEmail.trim() || !editingPhone.trim()) {
      alert("Please fill in all fields");
      return;
    }

    setSaving(true);
    const result = await updateDeliveryPartner(id, {
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
          + Add Delivery Partner
        </button>
      </div>

      {/* Add Delivery Partner Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="email"
                placeholder="Partner email..."
                value={newPartner.email}
                onChange={(e) =>
                  setNewPartner({ ...newPartner, email: e.target.value })
                }
                className="px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="tel"
                placeholder="Phone number..."
                value={newPartner.phone}
                onChange={(e) =>
                  setNewPartner({ ...newPartner, phone: e.target.value })
                }
                className="px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAddPartner}
                disabled={adding}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
              >
                {adding ? "Adding..." : "Add Partner"}
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewPartner({ email: "", phone: "" });
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
          <div className="text-gray-500">Loading delivery partners...</div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredPartners.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {searchQuery ? "No delivery partners found" : "No delivery partners yet"}
          </p>
        </div>
      )}

      {/* Delivery Partners Table */}
      {!loading && filteredPartners.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white overflow-x-auto">
          {/* Table Header */}
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-center font-semibold text-xs text-gray-700 uppercase tracking-wider">Image</th>
                <th className="px-4 py-3 text-center font-semibold text-xs text-gray-700 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-center font-semibold text-xs text-gray-700 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-center font-semibold text-xs text-gray-700 uppercase tracking-wider">Phone</th>
                <th className="px-4 py-3 text-center font-semibold text-xs text-gray-700 uppercase tracking-wider">Assigned</th>
                <th className="px-4 py-3 text-center font-semibold text-xs text-gray-700 uppercase tracking-wider">Completed</th>
                <th className="px-4 py-3 text-center font-semibold text-xs text-gray-700 uppercase tracking-wider">Pending</th>
                <th className="px-4 py-3 text-center font-semibold text-xs text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-center font-semibold text-xs text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPartners.map((partner) => (
                <tr key={partner.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  {/* Profile Image */}
                  <td className="px-4 py-3 text-center">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold text-sm shrink-0 mx-auto">
                      {partner.profileImage ? (
                        <img
                          src={partner.profileImage}
                          alt={partner.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        getInitials(partner.name)
                      )}
                    </div>
                  </td>

                  {/* Partner Name */}
                  <td className="px-4 py-3 text-center">
                    <p className="font-semibold text-gray-900 text-sm">
                      {partner.name}
                    </p>
                  </td>

                  {/* Partner Email */}
                  <td className="px-4 py-3 text-center">
                    {editingId === partner.id ? (
                      <input
                        type="email"
                        value={editingEmail}
                        onChange={(e) => setEditingEmail(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        disabled={saving}
                      />
                    ) : (
                      <p className="text-gray-600 text-sm truncate">
                        {partner.email}
                      </p>
                    )}
                  </td>

                  {/* Phone */}
                  <td className="px-4 py-3 text-center">
                    {editingId === partner.id ? (
                      <input
                        type="tel"
                        value={editingPhone}
                        onChange={(e) => setEditingPhone(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                        disabled={saving}
                      />
                    ) : (
                      <p className="text-gray-600 text-sm">{partner.phone}</p>
                    )}
                  </td>

                  {/* Assigned Deliveries */}
                  <td className="px-4 py-3 text-center">
                    <div className="text-lg font-bold text-gray-900">
                      {String(partner.assignedDeliveries).padStart(2, "0")}
                    </div>
                  </td>

                  {/* Completed Deliveries */}
                  <td className="px-4 py-3 text-center">
                    <div className="text-lg font-bold text-green-600">
                      {String(partner.completedDeliveries).padStart(2, "0")}
                    </div>
                  </td>

                  {/* Pending Deliveries */}
                  <td className="px-4 py-3 text-center">
                    <div className="text-lg font-bold text-yellow-600">
                      {String(partner.pendingDeliveries).padStart(2, "0")}
                    </div>
                  </td>

                  {/* Status Toggle */}
                  <td className="px-4 py-3 text-center">
                    <div>
                      <button
                        onClick={() => handleToggleStatus(partner.id)}
                        disabled={editingId !== partner.id}
                        title={editingId !== partner.id ? "Click 'Edit' to change status" : "Click to toggle"}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                          editingId !== partner.id
                            ? partner.status === "ACTIVE"
                              ? "bg-green-100 text-green-700 cursor-not-allowed opacity-60"
                              : "bg-red-100 text-red-700 cursor-not-allowed opacity-60"
                            : partner.status === "ACTIVE"
                              ? "bg-green-100 text-green-700 hover:bg-green-200 cursor-pointer"
                              : "bg-red-100 text-red-700 hover:bg-red-200 cursor-pointer"
                        }`}
                      >
                        {partner.status}
                      </button>
                      {editingId === partner.id && (
                        <p className="text-xs text-gray-500 mt-1">Click to toggle</p>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-center">
                    <div className="flex gap-2 justify-center">
                      {editingId === partner.id ? (
                        <>
                          <button
                            onClick={() => savePartnerChanges(partner.id)}
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
                              handleEditPartner(partner.id, partner.email, partner.phone)
                            }
                            className="px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              handleDeletePartner(partner.id, partner.name)
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
              Delete Delivery Partner
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

export default DeliveryPartnerManager;
