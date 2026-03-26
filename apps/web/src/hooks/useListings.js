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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.category, filters.occasion, filters.city]);

  return { listings, loading, error };
};

export const useListing = (id) => {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchListing = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await listingsApi.getById(id);
        setListing(res.data.listing);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  return { listing, loading, error };
};