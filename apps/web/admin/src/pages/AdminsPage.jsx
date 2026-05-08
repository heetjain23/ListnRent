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
import { getMenuItemsForRole } from '../utils/permissions'

const AdminsPage = () => {
  const { tab } = useParams()
  const navigate = useNavigate()
  const { admin } = useAdminAuth()
  const [currentTab, setCurrentTab] = React.useState(tab || 'dashboard')

  const menuItems = getMenuItemsForRole(admin?.role)

  // Map menu item labels to tab keys
  const tabMap = {
    'dashboard': 'dashboard',
    'team': 'team',
    'marketplace': 'marketplace',
    'category-videos': 'category-videos',
    'disputes': 'disputes',
    'deliviresHandling': 'deliviresHandling',
    'finance': 'finance',
    'analytics': 'analytics',
    'settings': 'settings',
  }

  const handleTabChange = (newTab) => {
    setCurrentTab(newTab)
    navigate(`/admin/${newTab}`)
  }

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
