import React from 'react'
import PageHeader from '../../shared/PageHeader'

const FinanceTab = () => {
  return (
    <>
      <PageHeader title="Finance" subtitle="Monitor financial metrics, transactions, and payments" />
      
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">💰</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Finance Tab</h2>
          <p className="text-gray-600">Finance content will be rendered here</p>
        </div>
      </div>
    </>
  )
}

export default FinanceTab
