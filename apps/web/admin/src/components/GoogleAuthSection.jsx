import React from 'react'

const GoogleAuthSection = ({ onGoogleLogin, isLoading, loadingAction }) => {
  return (
    <button
      onClick={onGoogleLogin}
      disabled={isLoading || loadingAction}
      className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-semibold py-3 px-4 rounded-full transition flex items-center justify-center gap-2"
    >
      {isLoading ? 'Signing in...' : '🔑 Continue with Google'}
    </button>
  )
}

export default GoogleAuthSection
