import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { isRestrictedRole } from '../../utils/permissions'
import Loading from '../ui/Loading'

/**
 * ProtectedRoute - Protects routes that require admin authentication and proper role
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, admin } = useAdminAuth()
  const location = useLocation()

  if (loading) {
    return <Loading message="Loading admin access…" variant="page" />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Check if restricted role trying to access admin pages
  if (isRestrictedRole(admin?.role) && location.pathname.startsWith('/admin')) {
    // Redirect delivery partners to their page
    if (admin?.role === 'delivery_partner') {
      return <Navigate to="/delivery-partner" replace />
    }
  }

  // Check role-based access if allowedRoles is specified
  if (allowedRoles && !allowedRoles.includes(admin?.role)) {
    return <Navigate to="/admin" replace />
  }

  return children
}

export default ProtectedRoute
