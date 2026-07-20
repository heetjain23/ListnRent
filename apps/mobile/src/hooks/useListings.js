import { useState, useEffect } from "react";
import { listingsApi } from "../services/listingsService.js";

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
        setListings(res?.data?.listings || []);
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