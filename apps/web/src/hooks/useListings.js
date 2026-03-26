import { useState, useEffect } from 'react'
import { DUMMY_LISTINGS } from '../constants'

// TODO: Replace dummy data with actual API call when backend is ready
// import { api } from '../services/api'

export const useListings = () => {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true)
        // Future: const data = await api('/listings')
        // Simulating async fetch with dummy data
        await new Promise((r) => setTimeout(r, 300))
        setListings(DUMMY_LISTINGS)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchListings()
  }, [])

  return { listings, loading, error }
}