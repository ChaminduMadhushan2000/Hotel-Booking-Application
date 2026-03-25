import React from 'react'
import { cn } from '@/lib/utils'
import { Spinner } from './spinner'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const variantClasses: Record<'primary' | 'secondary' | 'danger' | 'ghost', string> = {
  primary:
    'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  secondary:
    'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
  danger:
    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
  ghost: 'bg-transparent text-gray-900 hover:bg-gray-100 active:bg-gray-200'
}

const sizeClasses: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'px-3 py-2 text-sm min-h-9',
  md: 'px-4 py-2 text-base min-h-11',
  lg: 'px-6 py-3 text-lg min-h-12'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className,
      disabled,
      children,
      ...props
    },
    ref
  ): JSX.Element => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'font-semibold rounded-lg transition-colors duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <span className="flex items-center justify-center gap-2">
          {isLoading && <Spinner size="sm" />}
          {!isLoading && leftIcon && <span>{leftIcon}</span>}
          {children}
          {!isLoading && rightIcon && <span>{rightIcon}</span>}
        </span>
      </button>
    )
  }
)

Button.displayName = 'Button'
