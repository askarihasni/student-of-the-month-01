import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  isLoading?: boolean
  icon?: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-1 focus:ring-[#0D99FF] disabled:opacity-40 disabled:cursor-not-allowed select-none rounded-md'

  const sizeStyles = {
    xs: 'text-[11px] px-2 py-0.5 gap-1 h-6',
    sm: 'text-xs px-2.5 py-1 gap-1.5 h-7',
    md: 'text-xs px-3.5 py-1.5 gap-2 h-8 font-medium',
    lg: 'text-sm px-4 py-2 gap-2 h-9',
  }

  const variantStyles = {
    primary: 'bg-[#0D99FF] hover:bg-[#0C8CE9] text-white shadow-sm font-semibold active:bg-[#007BE5] active:scale-[0.98]',
    secondary: 'bg-[#2C2C2C] hover:bg-[#383838] text-white border border-[#383838] active:bg-[#444444] active:scale-[0.98]',
    ghost: 'hover:bg-[#383838] text-[#B3B3B3] hover:text-white active:bg-[#444444]',
    danger: 'bg-red-600 hover:bg-red-500 text-white active:bg-red-700 active:scale-[0.98]',
    icon: 'p-1.5 hover:bg-[#383838] text-[#B3B3B3] hover:text-white rounded',
  }

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-0.5 mr-1.5 h-3.5 w-3.5 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children}
    </button>
  )
}

