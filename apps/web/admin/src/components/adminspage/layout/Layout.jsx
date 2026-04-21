import React from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { getMenuItemsForRole } from '../../../utils/permissions'
import { useAdminAuth } from '../../../hooks/useAdminAuth'

const Layout = ({ children, currentTab, onTabChange }) => {
  const { admin } = useAdminAuth()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const menuItems = getMenuItemsForRole(admin?.role)

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        menuItems={menuItems}
        currentTab={currentTab}
        onTabChange={onTabChange}
      />

      <div className="flex-1 flex flex-col ml-0 lg:ml-64">
        <Topbar
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          title={currentTab.charAt(0).toUpperCase() + currentTab.slice(1).replace(/([A-Z])/g, ' $1')}
        />

        {/* Main content */}
        <main className="flex-1 overflow-auto pt-16">
          <div className="p-4 lg:p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}

export default Layout
