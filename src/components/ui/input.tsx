import React from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helperText?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, ...props }, ref): JSX.Element => {
    return (
      <div className="flex flex-col gap-2">
        <label
          htmlFor={props.id}
          className="text-sm font-medium text-gray-900 dark:text-gray-100"
        >
          {label}
        </label>
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-2 min-h-11 rounded-lg border-2 transition-colors duration-200',
            'text-base text-gray-900 placeholder-gray-500',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
            'disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50',
            error
              ? 'border-red-500 focus-visible:ring-red-500'
              : 'border-gray-300 focus-visible:ring-blue-500',
            className
          )}
          {...props}
        />
        {error && <span className="text-sm font-medium text-red-600">{error}</span>}
        {!error && helperText && (
          <span className="text-sm text-gray-600 dark:text-gray-400">{helperText}</span>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
