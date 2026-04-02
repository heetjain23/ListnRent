import { useState, useEffect } from "react";
import { listingsApi } from "../services/api";

export const useListings = (filters = {}) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await listingsApi.getAll(filters);
        setListings(res.data.listings);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [JSON.stringify(filters)]);

  return { listings, loading, error };
};

export const useListing = (id) => {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    if (!id) return;

    const fetchListing = async () => {
      try {
        setLoading(true);
        setError(null);
        // Use bypassCache on first load to ensure fresh data (after booking, cache might be stale)
        const res = await listingsApi.getById(id, true);
        setListing(res.data.listing);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id, refetchTrigger]);

  // Method to manually refetch the listing with cache bypass
  const refetch = () => {
    setRefetchTrigger(prev => prev + 1);
  };

  return { listing, loading, error, refetch };
};