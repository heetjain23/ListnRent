import React from 'react'
import Button from '../ui/Button'

const GoogleAuthSection = ({ onGoogleLogin, isLoading, loadingAction }) => {
  return (
    <div className="space-y-4">
      <Button
        onClick={onGoogleLogin}
        disabled={isLoading || loadingAction}
        className="w-full bg-white border-2 border-[#1A1A1A] text-blue-800 hover:bg-[#1A1A1A] hover:text-white"
        size="lg"
      >
        {isLoading ? 'Signing in...' : '🔑 Continue with Google'}
      </Button>
    </div>
  )
}

export default GoogleAuthSection
