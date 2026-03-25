import { cn } from '@/lib/utils'

interface BadgeProps {
  label: string
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  className?: string
}

const variantClasses: Record<'success' | 'warning' | 'danger' | 'info' | 'neutral', string> = {
  success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
}

export function Badge({ label, variant = 'neutral', className }: BadgeProps): JSX.Element {
  return (
    <span
      className={cn(
        'inline-block px-3 py-1 text-sm font-medium rounded-full',
        variantClasses[variant],
        className
      )}
    >
      {label}
    </span>
  )
}
