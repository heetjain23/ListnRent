import { useState, useEffect } from "react";
import { listingsApi } from "../services/api";

export const useListings = (filters = {}) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const filtersKey = JSON.stringify(filters);

  useEffect(() => {
    const controller = new AbortController();
    const requestFilters = JSON.parse(filtersKey);

    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await listingsApi.getAll(requestFilters, {
          signal: controller.signal,
        });
        setListings(res.data.listings);
      } catch (err) {
        if (err.name === "AbortError") return;
        setError(err.message);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchListings();

    return () => controller.abort();
  }, [filtersKey]);

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
