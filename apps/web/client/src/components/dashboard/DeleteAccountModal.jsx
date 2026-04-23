import React, { useState } from 'react'
import { api } from '../../services/api'

const DeleteAccountModal = ({ onClose, onSuccess, user }) => {
  const [confirmText, setConfirmText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const isConfirmed = confirmText.toLowerCase().trim() === 'confirm'

  const handleDeleteAccount = async () => {
    if (!isConfirmed) return

    try {
      setIsLoading(true)
      setError(null)

      // Delete user account and all their listings
      await api('/api/users/account', {
        auth: true,
        method: 'DELETE',
      })

      onSuccess()
    } catch (err) {
      setError(err.message || 'Failed to delete account')
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">Delete Account</h2>

        <p className="text-[#666] mb-6">
          This action cannot be undone. All your listings will be permanently deleted.
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
            To delete account type "confirm" below
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Type 'confirm'"
            className="w-full px-3 py-2 border border-[#E8E0D5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004D40]"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-[#E8E0D5] rounded-lg font-medium text-[#666] hover:bg-[#F5F5F5] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteAccount}
            disabled={!isConfirmed || isLoading}
            className={`flex-1 px-4 py-2 rounded-lg font-medium text-white transition-colors ${
              isConfirmed
                ? 'bg-red-600 hover:bg-red-700 cursor-pointer'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? 'Deleting...' : 'Delete Permanently'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteAccountModal
