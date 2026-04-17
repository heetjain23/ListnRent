import { useState, useCallback } from "react";
import { listingsApi } from "../services/api";

export const useUserListings = (shouldFetch = true) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserListings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await listingsApi.getUserListings();
      setListings(res.data.listings);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateListing = useCallback(
    async (id, data) => {
      try {
        setError(null);
        const res = await listingsApi.update(id, data);
        // Update local state
        setListings(
          listings.map((listing) =>
            listing._id === id ? res.data.listing : listing
          )
        );
        return res.data.listing;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [listings]
  );

  const deleteListing = useCallback(
    async (id) => {
      try {
        setError(null);
        await listingsApi.delete(id);
        // Update local state
        setListings(listings.filter((listing) => listing._id !== id));
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [listings]
  );

  const toggleListingActive = useCallback(
    async (id, isActive) => {
      try {
        setError(null);
        const res = await listingsApi.update(id, { isActive: !isActive });
        // Update local state
        setListings(
          listings.map((listing) =>
            listing._id === id ? res.data.listing : listing
          )
        );
        return res.data.listing;
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [listings]
  );

  return {
    listings,
    loading,
    error,
    fetchUserListings,
    updateListing,
    deleteListing,
    toggleListingActive,
  };
};
