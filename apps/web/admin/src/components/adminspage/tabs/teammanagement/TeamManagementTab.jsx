import React from 'react'
import PageHeader from '../../../shared/PageHeader'
import Badge from '../../../shared/Badge'
import TableWrapper from '../../../shared/TableWrapper'
import { useAdminAuth } from '../../../../hooks/useAdminAuth'
import { isSuperAdmin } from '../../../../utils/permissions'

const TeamManagementTab = () => {
  const { admin } = useAdminAuth()
  const [activeTab, setActiveTab] = React.useState('users')
  const isSuper = isSuperAdmin(admin?.role)

  const usersData = [
    { id: 1, name: 'Ananya Singhania', email: 'ananya.s@atelier.in', status: 'VERIFIED', rentals: 14, amount: '₹9,40,000', listings: 6 },
    { id: 2, name: 'Kabir Mehra', email: 'kabir.mehra@gmail.com', status: 'PENDING', rentals: 2, amount: '₹45,000', listings: 0 },
    { id: 3, name: 'Rhea Kapoor', email: 'rhea.kdesign-collective.co', status: 'VERIFIED', rentals: 8, amount: '₹12,000', listings: 12 },
    { id: 4, name: 'Varun Dhawan', email: 'varun@lifestyle.com', status: 'VERIFIED', rentals: 21, amount: '₹2,80,000', listings: 4 },
  ]

  const adminsData = [
    { id: 1, name: 'Aryan Malhotra', email: 'aryan@atelier.in', role: 'Lead Director', joinedDate: '2024-01-15', status: 'ACTIVE' },
    { id: 2, name: 'Priya Sharma', email: 'priya@atelier.in', role: 'Finance Manager', joinedDate: '2024-02-20', status: 'ACTIVE' },
  ]

  const deliveryPartnersData = [
    { id: 1, name: 'Rajesh Kumar', email: 'rajesh@delivery.com', phone: '+91-98765-43210', assignedDeliveries: 28, status: 'ACTIVE' },
    { id: 2, name: 'Priya Nair', email: 'priya@delivery.com', phone: '+91-98765-43211', assignedDeliveries: 15, status: 'ACTIVE' },
  ]

  const supportTeamData = [
    { id: 1, name: 'Maya Patel', email: 'maya@support.atelier.in', role: 'Support Lead', permissions: 'Full Access', status: 'ACTIVE' },
    { id: 2, name: 'Rohan Singh', email: 'rohan@support.atelier.in', role: 'Support Agent', permissions: 'Limited', status: 'ACTIVE' },
  ]

  return (
    <>
      <PageHeader title="Team Management" subtitle="Manage users, admins, delivery partners, and support team" />

      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-8 overflow-x-auto">
          {[
            { id: 'users', label: 'Users', count: '1,294' },
            { id: 'admins', label: 'Admins', count: '2' },
            { id: 'delivery_partners', label: 'Delivery Partners', count: '45' },
            { id: 'support_team', label: 'Support Team', count: '8' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-2 font-semibold text-sm border-b-2 transition whitespace-nowrap ${
                activeTab === tab.id ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
              <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded-full">{tab.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        {activeTab === 'users' && (
          <TableWrapper
            columns={[
              { key: 'name', label: 'User Information' },
              { key: 'status', label: 'Status', render: (val) => <Badge variant={val === 'VERIFIED' ? 'success' : 'warning'}>{val}</Badge> },
              { key: 'rentals', label: 'Total Rentals' },
              { key: 'amount', label: 'Total Rental Amount' },
              { key: 'listings', label: 'Total Listings' },
            ]}
            data={usersData}
            actions={() => <button className="text-teal-600 hover:text-teal-700 font-semibold text-sm">View Details</button>}
          />
        )}

        {activeTab === 'admins' && (
          <div>
            {isSuper ? (
              <div className="mb-4">
                <button className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition">+ Add New Admin</button>
              </div>
            ) : (
              <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800"><span className="font-semibold">⚠️ Restricted Access:</span> Only Super Admins can create new admin accounts.</p>
              </div>
            )}
            <TableWrapper
              columns={[
                { key: 'name', label: 'Admin Name' },
                { key: 'email', label: 'Email' },
                { key: 'role', label: 'Role' },
                { key: 'joinedDate', label: 'Joined Date' },
                { key: 'status', label: 'Status', render: (val) => <Badge variant="success">{val}</Badge> },
              ]}
              data={adminsData}
              actions={() => <button className="text-teal-600 hover:text-teal-700 font-semibold text-sm">{isSuper ? 'Edit' : 'View'}</button>}
            />
          </div>
        )}

        {activeTab === 'delivery_partners' && (
          <TableWrapper
            columns={[
              { key: 'name', label: 'Partner Name' },
              { key: 'email', label: 'Email' },
              { key: 'phone', label: 'Phone' },
              { key: 'assignedDeliveries', label: 'Assigned Deliveries' },
              { key: 'status', label: 'Status', render: (val) => <Badge variant="success">{val}</Badge> },
            ]}
            data={deliveryPartnersData}
            actions={() => <button className="text-teal-600 hover:text-teal-700 font-semibold text-sm">View Details</button>}
          />
        )}

        {activeTab === 'support_team' && (
          <div>
            <div className="mb-4">
              <button className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold transition">+ Add Support Member</button>
            </div>
            <TableWrapper
              columns={[
                { key: 'name', label: 'Name' },
                { key: 'email', label: 'Email' },
                { key: 'role', label: 'Role' },
                { key: 'permissions', label: 'Permissions' },
                { key: 'status', label: 'Status', render: (val) => <Badge variant="success">{val}</Badge> },
              ]}
              data={supportTeamData}
              actions={() => <button className="text-teal-600 hover:text-teal-700 font-semibold text-sm">Edit</button>}
            />
          </div>
        )}
      </div>
    </>
  )
}

export default TeamManagementTab
