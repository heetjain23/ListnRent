import React, { useState, useEffect } from 'react'
import { adminApi } from '../services/api'
import { toast } from 'sonner'

const AdminManager = () => {
  const [email, setEmail] = useState('')
  const [admins, setAdmins] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAddingAdmin, setIsAddingAdmin] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch admins on mount
  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      setIsLoading(true)
      const data = await adminApi.getAdmins()
      setAdmins(data.admins || [])
    } catch (err) {
      console.error('Error fetching admins:', err)
      toast.error(err.message || 'Failed to fetch admins')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddAdmin = async (e) => {
    e.preventDefault()

    if (!email.trim()) {
      toast.error('Please enter an email address')
      return
    }

    try {
      setIsAddingAdmin(true)
      const data = await adminApi.addAdmin(email.toLowerCase())
      toast.success(data.message || 'Admin added successfully')
      setEmail('')
      fetchAdmins()
    } catch (err) {
      console.error('Error adding admin:', err)
      toast.error(err.message || 'Failed to add admin')
    } finally {
      setIsAddingAdmin(false)
    }
  }

  const handleUpdateAdminStatus = async (adminEmail, newStatus) => {
    try {
      const data = await adminApi.updateAdminStatus(adminEmail, newStatus)
      toast.success(data.message || 'Admin status updated successfully')
      fetchAdmins()
    } catch (err) {
      console.error('Error updating admin status:', err)
      toast.error(err.message || 'Failed to update admin status')
    }
  }

  const filteredAdmins = admins.filter((admin) =>
    admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (admin.displayName && admin.displayName.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      {/* Add Admin Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-2xl font-bold text-slate-900 mb-6">➕ Add New Admin</h3>

        <form onSubmit={handleAddAdmin} className="space-y-4">
          <div>
            <label htmlFor="admin-email" className="block text-sm font-medium text-slate-700 mb-2">
              Email Address
            </label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={isAddingAdmin}
            />
          </div>

          <button
            type="submit"
            disabled={isAddingAdmin}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            {isAddingAdmin ? 'Adding...' : 'Add Admin'}
          </button>
        </form>
      </div>

      {/* Admins List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">👥 Admins List</h3>

          {/* Search */}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by email or name..."
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-slate-600">Loading admins...</p>
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p>No admins found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Added Date</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmins.map((admin) => (
                  <tr key={admin.email} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-900">{admin.email}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{admin.displayName || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          admin.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : admin.status === 'inactive'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {admin.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-center space-x-2">
                      {admin.status === 'active' ? (
                        <button
                          onClick={() => handleUpdateAdminStatus(admin.email, 'inactive')}
                          className="text-amber-600 hover:text-amber-800 font-semibold text-sm"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateAdminStatus(admin.email, 'active')}
                          className="text-green-600 hover:text-green-800 font-semibold text-sm"
                        >
                          Activate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 text-sm text-slate-600">
          <p>Total admins: <strong>{admins.length}</strong></p>
        </div>
      </div>
    </div>
  )
}

export default AdminManager
