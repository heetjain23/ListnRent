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
    primary: 'bg-[#00342B] text-white hover:bg-[#00695C] focus:ring-[#00342B]',
    secondary: 'bg-transparent border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#FAF7F2] focus:ring-[#1A1A1A]',
    accent: 'bg-[#004D40] text-[#FAF7F2] hover:bg-[#00695C] focus:ring-[#D4AF37]',
    ghost: 'bg-transparent text-[#555] hover:text-[#1A1A1A] hover:bg-[#FDFAF7] focus:ring-[#00342B]',
    outline: 'bg-transparent border border-[#E8E0D5] text-[#1A1A1A] hover:bg-[#FDFAF7] focus:ring-[#00342B]',
    danger: 'bg-[#EE5A6F] text-white hover:bg-[#D64757] focus:ring-[#EE5A6F]',
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