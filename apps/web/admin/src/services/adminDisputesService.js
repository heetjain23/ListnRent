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

const apiRequest = async (path, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(await getAuthHeaders()),
    ...(options.headers || {}),
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data?.message || 'Request failed')
  }

  return data
}

export const getAdminDisputeMetrics = async () =>
  apiRequest('/api/admin/disputes/metrics', { method: 'GET' })

export const getAdminDisputes = async (params = {}) => {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value))
    }
  })

  const suffix = query.toString() ? `?${query.toString()}` : ''
  return apiRequest(`/api/admin/disputes${suffix}`, { method: 'GET' })
}

export const getAdminDisputeById = async (id) =>
  apiRequest(`/api/admin/disputes/${id}`, { method: 'GET' })

export const getAdminDisputeMessages = async (id, page = 1, limit = 30) =>
  apiRequest(`/api/admin/disputes/${id}/messages?page=${page}&limit=${limit}`, { method: 'GET' })

export const sendAdminDisputeMessage = async (id, message) =>
  apiRequest(`/api/admin/disputes/${id}/message`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  })

export const updateAdminDisputeStatus = async (id, status) =>
  apiRequest(`/api/admin/disputes/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })

export const resolveAdminDispute = async (id) =>
  apiRequest(`/api/admin/disputes/${id}/resolve`, {
    method: 'PATCH',
  })

export const assignAdminDispute = async (id, assigneeId) =>
  apiRequest(`/api/admin/disputes/${id}/assign`, {
    method: 'PATCH',
    body: JSON.stringify({ assigneeId }),
  })
