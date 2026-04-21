import React from 'react'
import PageHeader from '../../shared/PageHeader'

const AnalyticsTab = () => {
  return (
    <>
      <PageHeader title="Analytics" subtitle="View analytics, reports, and business insights" />
      
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">📈</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics Tab</h2>
          <p className="text-gray-600">Analytics content will be rendered here</p>
        </div>
      </div>
    </>
  )
}

export default AnalyticsTab
