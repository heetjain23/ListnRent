import { useState, useCallback } from "react";
import { adminApi } from "../services/api";

export const useSupportTeam = () => {
  const [supportTeamMembers, setSupportTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSupportTeamMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.getSupportTeamMembers();
      if (response.success) {
        setSupportTeamMembers(response.supportTeam || []);
      } else {
        const errorMsg = response.message || "Failed to fetch support team members";
        setError(errorMsg);
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to fetch support team members";
      setError(errorMsg);
      console.error("Error fetching support team members:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addSupportTeamMember = useCallback(
    async (memberData) => {
      try {
        const response = await adminApi.addSupportTeamMember(memberData);
        if (response.success) {
          // Add the new member to the list
          setSupportTeamMembers((prevMembers) => [
            response.supportMember,
            ...prevMembers,
          ]);
          return { success: true, member: response.supportMember };
        } else {
          return { success: false, error: response.message };
        }
      } catch (err) {
        const errorMsg = err.message || "Failed to add support team member";
        setError(errorMsg);
        console.error("Error adding support team member:", err);
        return { success: false, error: errorMsg };
      }
    },
    []
  );

  const updateSupportTeamMember = useCallback(
    async (memberId, updates) => {
      try {
        const response = await adminApi.updateSupportTeamMember(memberId, updates);
        if (response.success) {
          // Update the member in the list
          setSupportTeamMembers((prevMembers) =>
            prevMembers.map((m) =>
              m.id === memberId ? response.supportMember : m
            )
          );
          return { success: true, member: response.supportMember };
        } else {
          return { success: false, error: response.message };
        }
      } catch (err) {
        const errorMsg = err.message || "Failed to update support team member";
        setError(errorMsg);
        console.error("Error updating support team member:", err);
        return { success: false, error: errorMsg };
      }
    },
    []
  );

  const deleteSupportTeamMember = useCallback(async (memberId) => {
    try {
      const response = await adminApi.deleteSupportTeamMember(memberId);
      if (response.success) {
        // Remove the deleted member from the list
        setSupportTeamMembers((prevMembers) =>
          prevMembers.filter((m) => m.id !== memberId)
        );
        return { success: true };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to delete support team member";
      setError(errorMsg);
      console.error("Error deleting support team member:", err);
      return { success: false, error: errorMsg };
    }
  }, []);

  const toggleSupportTeamMemberStatus = useCallback(async (memberId) => {
    try {
      const response = await adminApi.toggleSupportTeamMemberStatus(memberId);
      if (response.success) {
        // Update the member's status in the list
        setSupportTeamMembers((prevMembers) =>
          prevMembers.map((m) =>
            m.id === memberId ? response.supportMember : m
          )
        );
        return { success: true, member: response.supportMember };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to toggle support team member status";
      setError(errorMsg);
      console.error("Error toggling support team member status:", err);
      return { success: false, error: errorMsg };
    }
  }, []);

  return {
    supportTeamMembers,
    loading,
    error,
    fetchSupportTeamMembers,
    addSupportTeamMember,
    updateSupportTeamMember,
    deleteSupportTeamMember,
    toggleSupportTeamMemberStatus,
  };
};
