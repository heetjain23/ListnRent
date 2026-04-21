import { useState, useCallback } from "react";
import { adminApi } from "../services/api";

export const useAdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.getUsers();
      if (response.success) {
        setUsers(response.users || []);
      } else {
        setError(response.message || "Failed to fetch users");
      }
    } catch (err) {
      setError(err.message || "Failed to fetch users");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteUser = useCallback(async (userId) => {
    try {
      await adminApi.deleteUser(userId);
      // Remove the deleted user from the list
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      return { success: true };
    } catch (err) {
      const errorMsg = err.message || "Failed to delete user";
      setError(errorMsg);
      console.error("Error deleting user:", err);
      return { success: false, error: errorMsg };
    }
  }, []);

    const fetchAdmins = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await adminApi.getAllAdmins()
      if (response.success) {
        setAdmins(response.admins || [])
      } else {
        setError(response.message || 'Failed to fetch admins')
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch admins')
      console.error('Error fetching admins:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const addAdmin = useCallback(
    async (email) => {
      try {
        const response = await adminApi.addAdmin(email)
        if (response.success) {
          // Refresh the admin list
          await fetchAdmins()
          return { success: true }
        } else {
          return { success: false, error: response.message }
        }
      } catch (err) {
        const errorMsg = err.message || 'Failed to add admin'
        setError(errorMsg)
        console.error('Error adding admin:', err)
        return { success: false, error: errorMsg }
      }
    },
    [fetchAdmins]
  )

  const deleteAdmin = useCallback(
    async (email) => {
      try {
        await adminApi.deleteAdmin(email)
        // Remove the deleted admin from the list
        setAdmins((prevAdmins) => prevAdmins.filter((admin) => admin.email !== email))
        return { success: true }
      } catch (err) {
        const errorMsg = err.message || 'Failed to delete admin'
        setError(errorMsg)
        console.error('Error deleting admin:', err)
        return { success: false, error: errorMsg }
      }
    },
    []
  )

  const updateAdminEmail = useCallback(
    async (oldEmail, newEmail) => {
      try {
        const response = await adminApi.updateAdminEmail(oldEmail, newEmail)
        if (response.success) {
          // Update the admin in the list
          setAdmins((prevAdmins) =>
            prevAdmins.map((admin) =>
              admin.email === oldEmail ? { ...admin, email: newEmail } : admin
            )
          )
          return { success: true }
        } else {
          return { success: false, error: response.message }
        }
      } catch (err) {
        const errorMsg = err.message || 'Failed to update admin email'
        setError(errorMsg)
        console.error('Error updating admin email:', err)
        return { success: false, error: errorMsg }
      }
    },
    []
  )

  return {
    admins,
    users,
    loading,
    error,
    fetchUsers,
    deleteUser,
    fetchAdmins,
    addAdmin,
    deleteAdmin,
    updateAdminEmail,
  };
};
