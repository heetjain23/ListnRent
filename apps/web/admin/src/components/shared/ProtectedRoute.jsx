import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { isRestrictedRole } from '../../utils/permissions'

/**
 * ProtectedRoute - Protects routes that require admin authentication and proper role
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, admin } = useAdminAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
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
