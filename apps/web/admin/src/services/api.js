// Admin API Service
import { auth } from './firebase'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const getAuthHeaders = async () => {
  const currentUser = auth.currentUser

  if (!currentUser) {
    return {}
  }

  const token = await currentUser.getIdToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

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

  getAllAdmins: async () => {
    const response = await fetch(`${API_BASE_URL}/api/admin/list`, {
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

  deleteAdmin: async (email) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/admin/${email}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete admin')
    }

    return data
  },

  updateAdminEmail: async (email, newEmail) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/admin-email/${email}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newEmail }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update admin email')
    }

    return data
  },

  // Category Videos Methods
  getCategoryVideos: async () => {
    const response = await fetch(`${API_BASE_URL}/api/category-videos`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get category videos')
    }

    return data
  },

  saveCategoryVideo: async (payload) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(await getAuthHeaders()),
    }

    const response = await fetch(`${API_BASE_URL}/api/category-videos`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to save category video')
    }

    return data
  },

  updateCategoryVideo: async (id, updates) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(await getAuthHeaders()),
    }

    const response = await fetch(`${API_BASE_URL}/api/category-videos/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(updates),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update category video')
    }

    return data
  },

  deleteCategoryVideo: async (id) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(await getAuthHeaders()),
    }

    const response = await fetch(`${API_BASE_URL}/api/category-videos/${id}`, {
      method: 'DELETE',
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete category video')
    }

    return data
  },

  // Users Methods
  getUsers: async () => {
    const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to get users')
    }

    return response.json()
  },

  getDashboardMetrics: async () => {
    const response = await fetch(`${API_BASE_URL}/api/admin/dashboard-metrics`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get dashboard metrics')
    }

    return data
  },

  deleteUser: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete user')
    }

    return data
  },

  // Delivery Partners Methods
  getDeliveryPartners: async () => {
    const response = await fetch(`${API_BASE_URL}/api/admin/delivery-partners`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get delivery partners')
    }

    return data
  },

  addDeliveryPartner: async (partnerData) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/delivery-partners`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(partnerData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to add delivery partner')
    }

    return data
  },

  updateDeliveryPartner: async (partnerId, updates) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/delivery-partners/${partnerId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update delivery partner')
    }

    return data
  },

  deleteDeliveryPartner: async (partnerId) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/delivery-partners/${partnerId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete delivery partner')
    }

    return data
  },

  toggleDeliveryPartnerStatus: async (partnerId) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/delivery-partners/${partnerId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to toggle delivery partner status')
    }

    return data
  },

  getDeliveryPartnerProfile: async (email) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/delivery-partners/profile/${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get delivery partner profile')
    }

    return data
  },

  updateDeliveryPartnerProfile: async (email, updates) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/delivery-partners/profile/${encodeURIComponent(email)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update delivery partner profile')
    }

    return data
  },

  getDeliveryHandlingTasks: async () => {
    const response = await fetch(`${API_BASE_URL}/api/admin/delivery-handling/tasks`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get delivery handling tasks')
    }

    return data
  },

  assignDeliveryPartnerToBooking: async (bookingId, deliveryPartnerId) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/delivery-handling/${bookingId}/assign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ deliveryPartnerId }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to assign delivery partner')
    }

    return data
  },

  updateDeliveryTaskStatus: async (bookingId, deliveryStatus) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/delivery-handling/${bookingId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ deliveryStatus }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update delivery status')
    }

    return data
  },

  getAssignedTasksForDeliveryPartner: async (email) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/delivery-partners/${encodeURIComponent(email)}/tasks`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get assigned delivery tasks')
    }

    return data
  },

  markDeliveryMilestone: async (bookingId, action) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/delivery-handling/${bookingId}/milestone`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to mark delivery milestone')
    }

    return data
  },

  // Support Team Methods
  getSupportTeamMembers: async () => {
    const response = await fetch(`${API_BASE_URL}/api/admin/support-team`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get support team members')
    }

    return data
  },

  addSupportTeamMember: async (memberData) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/support-team`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(memberData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to add support team member')
    }

    return data
  },

  updateSupportTeamMember: async (memberId, updates) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/support-team/${memberId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update support team member')
    }

    return data
  },

  deleteSupportTeamMember: async (memberId) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/support-team/${memberId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete support team member')
    }

    return data
  },

  toggleSupportTeamMemberStatus: async (memberId) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/support-team/${memberId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to toggle support team member status')
    }

    return data
  },
}
