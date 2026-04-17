import React from 'react'

const AuthDivider = () => {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-slate-300"></div>
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-2 bg-[#FAF7F2] text-slate-600">OR</span>
      </div>
    </div>
  )
}

export default AuthDivider
