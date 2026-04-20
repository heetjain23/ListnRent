import React, { useState, useEffect } from 'react'
import { adminApi } from '../services/api'
import { toast } from 'sonner'

const DeliveryPartnerManager = () => {
  const [email, setEmail] = useState('')
  const [deliveryPartners, setDeliveryPartners] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAddingPartner, setIsAddingPartner] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch delivery partners on mount
  useEffect(() => {
    fetchDeliveryPartners()
  }, [])

  const fetchDeliveryPartners = async () => {
    try {
      setIsLoading(true)
      const data = await adminApi.getDeliveryPartners()
      setDeliveryPartners(data.deliveryPartners || [])
    } catch (err) {
      console.error('Error fetching delivery partners:', err)
      toast.error(err.message || 'Failed to fetch delivery partners')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddPartner = async (e) => {
    e.preventDefault()

    if (!email.trim()) {
      toast.error('Please enter an email address')
      return
    }

    try {
      setIsAddingPartner(true)
      const data = await adminApi.addDeliveryPartner(email.toLowerCase())
      toast.success(data.message || 'Delivery partner added successfully')
      setEmail('')
      fetchDeliveryPartners()
    } catch (err) {
      console.error('Error adding delivery partner:', err)
      toast.error(err.message || 'Failed to add delivery partner')
    } finally {
      setIsAddingPartner(false)
    }
  }

  const handleRemovePartner = async (partnerEmail) => {
    if (!window.confirm(`Are you sure you want to remove ${partnerEmail}?`)) {
      return
    }

    try {
      const data = await adminApi.removeDeliveryPartner(partnerEmail)
      toast.success(data.message || 'Delivery partner removed successfully')
      fetchDeliveryPartners()
    } catch (err) {
      console.error('Error removing delivery partner:', err)
      toast.error(err.message || 'Failed to remove delivery partner')
    }
  }

  const filteredPartners = deliveryPartners.filter((partner) =>
    partner.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Add Delivery Partner Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-2xl font-bold text-slate-900 mb-6">➕ Add Delivery Partner</h3>

        <form onSubmit={handleAddPartner} className="space-y-4">
          <div>
            <label htmlFor="partner-email" className="block text-sm font-medium text-slate-700 mb-2">
              Email Address
            </label>
            <input
              id="partner-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="partner@example.com"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isAddingPartner}
            />
          </div>

          <button
            type="submit"
            disabled={isAddingPartner}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            {isAddingPartner ? 'Adding...' : 'Add Delivery Partner'}
          </button>
        </form>
      </div>

      {/* Delivery Partners List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">📋 Delivery Partners List</h3>

          {/* Search */}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by email..."
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-slate-600">Loading delivery partners...</p>
          </div>
        ) : filteredPartners.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p>No delivery partners found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Added Date</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-slate-900">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPartners.map((partner) => (
                  <tr key={partner.email} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-900">{partner.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          partner.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {partner.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {partner.createdAt ? new Date(partner.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleRemovePartner(partner.email)}
                        className="text-red-600 hover:text-red-800 font-semibold text-sm"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 text-sm text-slate-600">
          <p>Total delivery partners: <strong>{deliveryPartners.length}</strong></p>
        </div>
      </div>
    </div>
  )
}

export default DeliveryPartnerManager
