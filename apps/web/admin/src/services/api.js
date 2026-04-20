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
}
