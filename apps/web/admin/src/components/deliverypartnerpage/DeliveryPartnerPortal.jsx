import React from 'react'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { navTabs } from './mockData'
import DeliveryPartnerLayout from './layout/DeliveryPartnerLayout'
import DeliveriesTab from './tabs/deliveries/DeliveriesTab'
import MessagesTab from './tabs/messages/MessagesTab'
import DashboardTab from './tabs/dashboard/DashboardTab'
import ProfileTab from './tabs/profile/ProfileTab'

const DeliveryPartnerPortal = () => {
  const { logout } = useAdminAuth()
  const [activeTab, setActiveTab] = React.useState('deliveries')

  const renderTab = () => {
    switch (activeTab) {
      case 'deliveries':
        return <DeliveriesTab />
      case 'messages':
        return <MessagesTab />
      case 'dashboard':
        return <DashboardTab />
      case 'profile':
        return <ProfileTab />
      default:
        return <DeliveriesTab />
    }
  }

  return (
    <DeliveryPartnerLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      navTabs={navTabs}
      onLogout={logout}
    >
      {renderTab()}
    </DeliveryPartnerLayout>
  )
}

export default DeliveryPartnerPortal
