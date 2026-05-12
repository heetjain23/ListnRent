import React from 'react'
import MetricsGrid from './MetricsGrid'
import RecentActivity from './RecentActivity'
import ActionableAlerts from './ActionableAlerts'
import PageHeader from '../../../shared/PageHeader'
import { useAdminAuth } from '../../../../hooks/useAdminAuth'
import { adminApi } from '../../../../services/api'
import { ROLES, isSuperAdmin } from '../../../../utils/permissions'

const formatNumber = (value) => Number(value || 0).toLocaleString('en-IN')

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))

const DashboardTab = () => {
  const { admin } = useAdminAuth()
  const [dashboardMetrics, setDashboardMetrics] = React.useState({
    totalUsers: 0,
    activeListings: 0,
    activeRentals: 0,
    totalRentalsDone: 0,
    totalRevenue: 0,
    totalDepositHeld: 0,
  })
  const [loadingMetrics, setLoadingMetrics] = React.useState(true)
  const [metricsError, setMetricsError] = React.useState('')

  const fetchDashboardMetrics = React.useCallback(async () => {
    setLoadingMetrics(true)
    setMetricsError('')

    try {
      const response = await adminApi.getDashboardMetrics()
      if (!response.success) {
        throw new Error(response.message || 'Failed to load dashboard metrics')
      }

      setDashboardMetrics((prev) => ({
        ...prev,
        ...(response.metrics || {}),
      }))
    } catch (error) {
      setMetricsError(error.message || 'Failed to load dashboard metrics')
    } finally {
      setLoadingMetrics(false)
    }
  }, [])

  React.useEffect(() => {
    fetchDashboardMetrics()
  }, [fetchDashboardMetrics])

  const metrics = React.useMemo(() => [
    {
      icon: '👥',
      label: 'Total Users',
      value: formatNumber(dashboardMetrics.totalUsers),
      caption: 'All registered accounts',
    },
    {
      icon: '🏠',
      label: 'Active Listings',
      value: formatNumber(dashboardMetrics.activeListings),
      caption: 'Live + available outfits',
    },
    {
      icon: '📅',
      label: 'Active Rentals',
      value: formatNumber(dashboardMetrics.activeRentals),
      caption: `${formatNumber(dashboardMetrics.totalRentalsDone)} total rentals done`,
    },
    {
      icon: '💰',
      label: 'Total Revenue',
      value: formatCurrency(dashboardMetrics.totalRevenue),
      caption: 'Collected rental amount',
    },
    {
      icon: '🏦',
      label: 'Deposits Held',
      value: formatCurrency(dashboardMetrics.totalDepositHeld),
      caption: 'Deposits not yet returned',
    },
  ], [dashboardMetrics])

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
          <div className="flex items-center gap-2">
            <button
              onClick={fetchDashboardMetrics}
              className="px-4 py-2 border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg font-semibold transition"
            >
              Refresh Metrics
            </button>
            <button className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition">
              ↓ Download Report
            </button>
          </div>
        }
      />

      {metricsError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {metricsError}
        </div>
      )}

      <MetricsGrid metrics={metrics} loading={loadingMetrics} />

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
