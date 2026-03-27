import React from 'react'

const ErrorMessage = ({ error }) => {
  if (!error) return null

  return (
    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-sm text-red-700">{error}</p>
    </div>
  )
}

export default ErrorMessage
