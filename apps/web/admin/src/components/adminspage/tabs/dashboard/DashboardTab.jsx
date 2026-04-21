import React from 'react'
import MetricsGrid from './MetricsGrid'
import RecentActivity from './RecentActivity'
import ActionableAlerts from './ActionableAlerts'
import PageHeader from '../../../shared/PageHeader'
import { useAdminAuth } from '../../../../hooks/useAdminAuth'
import { ROLES, isSuperAdmin } from '../../../../utils/permissions'

const DashboardTab = () => {
  const { admin } = useAdminAuth()

  const metrics = [
    {
      icon: '👥',
      label: 'Total Users',
      value: '14,280',
      change: '+2.5%',
      changeType: 'positive',
    },
    {
      icon: '🏠',
      label: 'Active Listings',
      value: '3,892',
      change: '+1.2%',
      changeType: 'positive',
    },
    {
      icon: '📅',
      label: 'Active Rentals',
      value: '1,104',
      change: '+2.8%',
      changeType: 'positive',
    },
    {
      icon: '💰',
      label: 'Total Revenue',
      value: '₹8,42,000',
      change: '+5.3%',
      changeType: 'positive',
    },
    {
      icon: '🏦',
      label: 'Deposits Held',
      value: '₹2,15,500',
      change: '+0.5%',
      changeType: 'positive',
    },
  ]

  const getRoleGreeting = () => {
    if (isSuperAdmin(admin?.role)) {
      return 'You have full access to all features and settings.'
    } else if (admin?.role === ROLES.ADMIN) {
      return 'You have admin access. Some features like Team Management and Settings are restricted.'
    }
    return 'Welcome to ListnRent Admin Panel'
  }

  return (
    <>
      <PageHeader
        title="Overview Dashboard"
        subtitle={getRoleGreeting()}
        actions={
          <button className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition">
            ↓ Download Report
          </button>
        }
      />

      <MetricsGrid metrics={metrics} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>
        <ActionableAlerts />
      </div>

      <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Financial Health Note</h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          Total deposits currently held in escrow account are up by 4% since the last audit.
          All refunded transactions from the Mumbai sector have been processed within the 48-hour
          boutique standard. Revenue projections for the upcoming festival season suggest a 2.7%
          increase in premium garment rentals.
        </p>
        <button className="text-teal-600 hover:text-teal-700 font-semibold text-sm mt-4 transition">
          VIEW DETAILED AUDIT REPORT →
        </button>
      </div>

      {!isSuperAdmin(admin?.role) && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-4">ℹ️ Your Permissions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold text-blue-900 mb-2">✅ Allowed Access:</p>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>📊 Dashboard</li>
                <li>🏪 Marketplace</li>
                <li>⚠️ Disputes</li>
                <li>💰 Finance</li>
                <li>📈 Analytics</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-red-900 mb-2">❌ Restricted Access:</p>
              <ul className="space-y-1 text-sm text-red-800">
                <li>👥 Team Management (Create new admin)</li>
                <li>⚙️ Settings & Configuration</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default DashboardTab
