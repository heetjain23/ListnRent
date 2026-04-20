// Admin API Service
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export const adminApi = {
  // Initialize admin
  init: async (data) => {
    const response = await fetch(`${API_BASE_URL}/admin/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to initialize admin')
    }

    return response.json()
  },

  // Get admin profile
  getProfile: async (email) => {
    const response = await fetch(`${API_BASE_URL}/admin/profile`, {
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
}
