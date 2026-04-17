import React from 'react'

const AuthDivider = () => {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px bg-[#DDD]"></div>
      <span className="text-xs text-[#999] font-medium">OR</span>
      <div className="flex-1 h-px bg-[#DDD]"></div>
    </div>
  )
}

export default AuthDivider
