import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AdminAuthProvider } from './context/AdminAuthContext'
import ProtectedRoute from './components/shared/ProtectedRoute'
import ComingSoon from './pages/ComingSoon'
import AdminLogin from './pages/AdminLogin'
import AdminsPage from './pages/AdminsPage'
import DeliveryPartnerPage from './pages/DeliveryPartnerPage'
import SupportTeamPage from './pages/SupportTeamPage'
import ErrorPage from './pages/ErrorPage'
import TermsAndConditions from './pages/TermsAndConditions'
import PrivacyPolicy from './pages/PrivacyPolicy'
import ContactUsPage from './pages/ContactUsPage'
import { SITE_RENDER_TARGET } from './config/siteMode'

const AdminApplication = () => {
  return (
    <AdminAuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/contact" element={<ContactUsPage />} />
        
        {/* Protected Routes - Admin Dashboard (all tabs) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
              <AdminsPage activeTab="dashboard" />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Admin with tab params */}
        <Route
          path="/admin/:tab"
          element={
            <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
              <AdminsPage />
            </ProtectedRoute>
          }
        />

        {/* Delivery Partner Page */}
        <Route
          path="/delivery-partner"
          element={
            <ProtectedRoute>
              <DeliveryPartnerPage />
            </ProtectedRoute>
          }
        />

        {/* Support Team Page */}
        <Route
          path="/support-team"
          element={
            <ProtectedRoute>
              <SupportTeamPage />
            </ProtectedRoute>
          }
        />

        {/* Error Page */}
        <Route path="/error" element={<ErrorPage />} />

        {/* Default Routes */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="*" element={<Navigate to="/error" replace />} />
      </Routes>
    </AdminAuthProvider>
  )
}

const App = () => {
  return SITE_RENDER_TARGET === 'comingsoon' ? <ComingSoon /> : <AdminApplication />
}

export default App