import { useState, useCallback } from 'react'
import { useAuth } from './useAuth'
import { auth } from '../services/firebase'

export const useUserBookings = () => {
  const { user } = useAuth()
  const [bookings, setBookings] = useState([])
  const [renterBookings, setRenterBookings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchUserBookings = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      // Get the current Firebase user to get the ID token
      const currentUser = auth.currentUser
      if (!currentUser) {
        throw new Error('User not authenticated')
      }

      const token = await currentUser.getIdToken()
      const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'
      const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl
      const response = await fetch(`${baseUrl}/api/payments/my-bookings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch bookings')
      }

      const data = await response.json()
      setBookings(data.data.bookings || [])
    } catch (err) {
      setError(err.message)
      console.error('Error fetching user bookings:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  const fetchRenterBookings = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      // Get the current Firebase user to get the ID token
      const currentUser = auth.currentUser
      if (!currentUser) {
        throw new Error('User not authenticated')
      }

      const token = await currentUser.getIdToken()
      const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'
      const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl
      const response = await fetch(`${baseUrl}/api/payments/renter-bookings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch renter bookings')
      }

      const data = await response.json()
      setRenterBookings(data.data.bookings || [])
    } catch (err) {
      setError(err.message)
      console.error('Error fetching renter bookings:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  return {
    bookings,
    renterBookings,
    loading,
    error,
    fetchUserBookings,
    fetchRenterBookings,
  }
}
