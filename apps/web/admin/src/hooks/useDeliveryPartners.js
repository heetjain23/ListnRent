import { useState, useCallback } from "react";
import { adminApi } from "../services/api";

export const useDeliveryPartners = () => {
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDeliveryPartners = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.getDeliveryPartners();
      if (response.success) {
        setDeliveryPartners(response.deliveryPartners || []);
      } else {
        const errorMsg = response.message || "Failed to fetch delivery partners";
        setError(errorMsg);
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to fetch delivery partners";
      setError(errorMsg);
      console.error("Error fetching delivery partners:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addDeliveryPartner = useCallback(
    async (partnerData) => {
      try {
        const response = await adminApi.addDeliveryPartner(partnerData);
        if (response.success) {
          // Add the new partner to the list
          setDeliveryPartners((prevPartners) => [
            response.deliveryPartner,
            ...prevPartners,
          ]);
          return { success: true, partner: response.deliveryPartner };
        } else {
          return { success: false, error: response.message };
        }
      } catch (err) {
        const errorMsg = err.message || "Failed to add delivery partner";
        setError(errorMsg);
        console.error("Error adding delivery partner:", err);
        return { success: false, error: errorMsg };
      }
    },
    []
  );

  const updateDeliveryPartner = useCallback(
    async (partnerId, updates) => {
      try {
        const response = await adminApi.updateDeliveryPartner(partnerId, updates);
        if (response.success) {
          // Update the partner in the list
          setDeliveryPartners((prevPartners) =>
            prevPartners.map((p) =>
              p.id === partnerId ? response.deliveryPartner : p
            )
          );
          return { success: true, partner: response.deliveryPartner };
        } else {
          return { success: false, error: response.message };
        }
      } catch (err) {
        const errorMsg = err.message || "Failed to update delivery partner";
        setError(errorMsg);
        console.error("Error updating delivery partner:", err);
        return { success: false, error: errorMsg };
      }
    },
    []
  );

  const deleteDeliveryPartner = useCallback(async (partnerId) => {
    try {
      const response = await adminApi.deleteDeliveryPartner(partnerId);
      if (response.success) {
        // Remove the deleted partner from the list
        setDeliveryPartners((prevPartners) =>
          prevPartners.filter((p) => p.id !== partnerId)
        );
        return { success: true };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to delete delivery partner";
      setError(errorMsg);
      console.error("Error deleting delivery partner:", err);
      return { success: false, error: errorMsg };
    }
  }, []);

  const toggleDeliveryPartnerStatus = useCallback(async (partnerId) => {
    try {
      const response = await adminApi.toggleDeliveryPartnerStatus(partnerId);
      if (response.success) {
        // Update the partner's status in the list
        setDeliveryPartners((prevPartners) =>
          prevPartners.map((p) =>
            p.id === partnerId ? response.deliveryPartner : p
          )
        );
        return { success: true, partner: response.deliveryPartner };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to toggle delivery partner status";
      setError(errorMsg);
      console.error("Error toggling delivery partner status:", err);
      return { success: false, error: errorMsg };
    }
  }, []);

  return {
    deliveryPartners,
    loading,
    error,
    fetchDeliveryPartners,
    addDeliveryPartner,
    updateDeliveryPartner,
    deleteDeliveryPartner,
    toggleDeliveryPartnerStatus,
  };
};
