import React from 'react'

/**
 * Loading Component - Full page loader with spinner animation
 */
const Loading = ({ message = 'Loading...', fullScreen = true }) => {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-[#E8D5D1] rounded-full"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-[#C8622A] rounded-full animate-spin"></div>
      </div>
      {message && <p className="text-[#666] text-center">{message}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-20">
        <div className="text-center">{content}</div>
      </div>
    )
  }

  return content
}

export default Loading
