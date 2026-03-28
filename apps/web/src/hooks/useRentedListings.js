import { useState, useCallback } from 'react'
import { useAuth } from './useAuth'
import { auth } from '../services/firebase'

export const useRentedListings = () => {
  const { user } = useAuth()
  const [rentedListings, setRentedListings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchRentedListings = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const currentUser = auth.currentUser
      if (!currentUser) {
        throw new Error('User not authenticated')
      }

      const token = await currentUser.getIdToken()
      const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'
      const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl
      const response = await fetch(`${baseUrl}/api/listings/user/rented-listings`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch rented listings')
      }

      const data = await response.json()
      setRentedListings(data.data.listings || [])
    } catch (err) {
      setError(err.message)
      console.error('Error fetching rented listings:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  const relistListing = useCallback(async (listingId) => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const currentUser = auth.currentUser
      if (!currentUser) {
        throw new Error('User not authenticated')
      }

      const token = await currentUser.getIdToken()
      const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'
      const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl
      const response = await fetch(`${baseUrl}/api/listings/relist/${listingId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to relist')
      }

      const data = await response.json()
      // Update local state
      setRentedListings((prev) => prev.filter((l) => l._id !== listingId))
      return data.data.listing
    } catch (err) {
      setError(err.message)
      console.error('Error relisting:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [user])

  return {
    rentedListings,
    loading,
    error,
    fetchRentedListings,
    relistListing,
  }
}
