import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../hooks/useAdminAuth'
import Layout from '../components/adminspage/layout/Layout'
import DashboardTab from '../components/adminspage/tabs/dashboard/DashboardTab'
import TeamManagementTab from '../components/adminspage/tabs/teammanagement/TeamManagementTab'
import MarketplaceTab from '../components/adminspage/tabs/MarketplaceTab'
import CategoryVideosTab from '../components/adminspage/tabs/CategoryVideosTab'
import DisputesTab from '../components/adminspage/tabs/DisputesTab'
import DeliviresHandlingTab from '../components/adminspage/tabs/DeliviresHandlingTab'
import FinanceTab from '../components/adminspage/tabs/FinanceTab'
import AnalyticsTab from '../components/adminspage/tabs/AnalyticsTab'
import SettingsTab from '../components/adminspage/tabs/SettingsTab'
import { getDashboardForRole, getMenuItemsForRole } from '../utils/permissions'

const AdminsPage = () => {
  const { tab } = useParams()
  const navigate = useNavigate()
  const { admin } = useAdminAuth()

  const menuItems = getMenuItemsForRole(admin?.role)
  const allowedTabs = React.useMemo(() => {
    return menuItems
      .map((item) => {
        if (item.label === 'Delivires Handling') return 'deliviresHandling'
        return item.label.toLowerCase().replace(/\s+/g, '-').replace('team-management', 'team')
      })
  }, [menuItems])

  const requestedTab = tab || 'dashboard'
  const fallbackTab = React.useMemo(() => {
    if (allowedTabs.length === 0) {
      const destination = getDashboardForRole(admin?.role)
      if (destination.startsWith('/admin/')) {
        return destination.split('/').pop()
      }
      return 'dashboard'
    }

    return allowedTabs.includes('dashboard') ? 'dashboard' : allowedTabs[0]
  }, [admin?.role, allowedTabs])

  const currentTab = allowedTabs.includes(requestedTab) ? requestedTab : fallbackTab

  const handleTabChange = (newTab) => {
    if (!allowedTabs.includes(newTab)) {
      const fallback = admin?.role === 'support_team' ? 'disputes' : 'dashboard'
      navigate(`/admin/${fallback}`)
      return
    }

    navigate(`/admin/${newTab}`)
  }

  React.useEffect(() => {
    if (requestedTab !== currentTab) {
      navigate(`/admin/${currentTab}`, { replace: true })
    }
  }, [currentTab, navigate, requestedTab])

  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardTab />
      case 'team':
        return <TeamManagementTab />
      case 'marketplace':
        return <MarketplaceTab />
      case 'category-videos':
        return <CategoryVideosTab />
      case 'disputes':
        return <DisputesTab />
      case 'deliviresHandling':
        return <DeliviresHandlingTab />
      case 'finance':
        return <FinanceTab />
      case 'analytics':
        return <AnalyticsTab />
      case 'settings':
        return <SettingsTab />
      default:
        return <DashboardTab />
    }
  }

  return (
    <Layout currentTab={currentTab} onTabChange={handleTabChange}>
      {renderTabContent()}
    </Layout>
  )
}

export default AdminsPage
