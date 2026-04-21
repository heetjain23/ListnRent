// Admin API Service
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export const adminApi = {
  // Initialize admin
  init: async (data) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    const responseData = await response.json()

    // Always return the response, even for non-2xx status
    // The AdminAuthContext will handle the shouldRedirectToClient flag
    return responseData
  },

  // Get admin profile
  getProfile: async (email) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to get profile')
    }

    return response.json()
  },

  // Delivery Partner Methods
  addDeliveryPartner: async (email) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/delivery-partners`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to add delivery partner')
    }

    return data
  },

  getDeliveryPartners: async () => {
    const response = await fetch(`${API_BASE_URL}/api/admin/delivery-partners`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to get delivery partners')
    }

    return response.json()
  },

  removeDeliveryPartner: async (email) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/delivery-partners/${email}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to remove delivery partner')
    }

    return data
  },

  // Admin Methods
  addAdmin: async (email) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/add-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to add admin')
    }

    return data
  },

  getAdmins: async () => {
    const response = await fetch(`${API_BASE_URL}/api/admin/admins`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to get admins')
    }

    return response.json()
  },

  updateAdminStatus: async (email, status) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/admin-status/${email}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update admin status')
    }

    return data
  },

  // Support Team Methods
  addSupportTeamMember: async (email) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/support-team`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to add support team member')
    }

    return data
  },

  getSupportTeam: async () => {
    const response = await fetch(`${API_BASE_URL}/api/admin/support-team`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to get support team')
    }

    return response.json()
  },

  removeSupportTeamMember: async (email) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/support-team/${email}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to remove support team member')
    }

    return data
  },

  // Update Role
  updateAdminRole: async (email, role) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/update-role/${email}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update admin role')
    }

    return data
  },
}
