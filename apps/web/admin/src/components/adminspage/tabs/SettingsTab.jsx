import React from 'react'
import PageHeader from '../../shared/PageHeader'
import { useAdminAuth } from '../../../hooks/useAdminAuth'
import { isSuperAdmin } from '../../../utils/permissions'

const SettingsTab = () => {
  const { admin } = useAdminAuth()
  const isSuper = isSuperAdmin(admin?.role)
  const [settings, setSettings] = React.useState({
    commissionRate: 15,
    securityDepositRate: 20,
    minDeposit: 5000,
    maxDeposit: 500000,
  })

  const handleChange = (key, value) => {
    if (isSuper) {
      setSettings({ ...settings, [key]: value })
    }
  }

  const handleSave = () => {
    if (!isSuper) {
      alert('You do not have permission to modify settings.')
      return
    }
    console.log('Settings saved:', settings)
    alert('Settings updated successfully!')
  }

  return (
    <>
      <PageHeader title="Settings" subtitle="Configure system settings and preferences" />

      {!isSuper && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">
            <span className="font-semibold">🔒 Restricted Access:</span> Only Super Admins can modify settings.
          </p>
        </div>
      )}

      <div className="max-w-2xl">
        <div className={`bg-white border border-gray-200 rounded-lg p-6 mb-6 ${!isSuper ? 'opacity-60' : ''}`}>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Commission Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Commission Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={settings.commissionRate}
                onChange={(e) => handleChange('commissionRate', Number(e.target.value))}
                disabled={!isSuper}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div className={`bg-white border border-gray-200 rounded-lg p-6 mb-6 ${!isSuper ? 'opacity-60' : ''}`}>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Deposit Rules</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Security Deposit Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={settings.securityDepositRate}
                onChange={(e) => handleChange('securityDepositRate', Number(e.target.value))}
                disabled={!isSuper}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Deposit (₹)</label>
                <input
                  type="number"
                  value={settings.minDeposit}
                  onChange={(e) => handleChange('minDeposit', Number(e.target.value))}
                  disabled={!isSuper}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Deposit (₹)</label>
                <input
                  type="number"
                  value={settings.maxDeposit}
                  onChange={(e) => handleChange('maxDeposit', Number(e.target.value))}
                  disabled={!isSuper}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={!isSuper}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
          <button className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition">Cancel</button>
        </div>
      </div>
    </>
  )
}

export default SettingsTab
