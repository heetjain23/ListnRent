import React from 'react'

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  className = '',
}) => {
  const base =
    'inline-flex items-center justify-center font-medium tracking-wide transition-all duration-200 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-[#1A1A1A] text-[#FAF7F2] hover:bg-[#C8622A] focus:ring-[#C8622A]',
    secondary: 'bg-transparent border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#FAF7F2] focus:ring-[#1A1A1A]',
    accent: 'bg-[#C8622A] text-white hover:bg-[#A84E1E] focus:ring-[#C8622A]',
    ghost: 'bg-transparent text-[#555] hover:text-[#1A1A1A] hover:bg-[#F0EBE3] focus:ring-[#C8622A]',
  }

  const sizes = {
    sm: 'text-xs px-4 py-1.5',
    md: 'text-sm px-6 py-2.5',
    lg: 'text-base px-8 py-3',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </button>
  )
}

export default Button