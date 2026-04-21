import React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'ghost'
  size?: 'small' | 'medium' | 'large'
  isLoading?: boolean
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled = false,
  children,
  className,
  ...props
}: ButtonProps) {
  const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-600',
    secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 focus-visible:ring-slate-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-600',
    warning: 'bg-amber-400 text-slate-900 hover:bg-amber-500 focus-visible:ring-amber-500',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400',
  }

  const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
    small: 'h-9 px-3 text-sm',
    medium: 'h-10 px-4 text-sm',
    large: 'h-11 px-6 text-base',
  }

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className || ''}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"></span>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  )
}

export default Button
