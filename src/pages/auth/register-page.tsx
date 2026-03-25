import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/use-auth'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { showError } from '@/components/ui/toast'

const registerSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required').max(100, 'First name too long'),
    lastName: z.string().min(1, 'Last name is required').max(100, 'Last name too long'),
    email: z.string().email('Invalid email address').max(255, 'Email too long'),
    password: z
      .string()
      .min(8, 'Minimum 8 characters')
      .max(100, 'Password too long')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })

type RegisterFormValues = z.infer<typeof registerSchema>

function getPasswordStrength(password: string): {
  metCount: number
  label: 'weak' | 'medium' | 'strong'
  widthClass: string
  colorClass: string
} {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password)
  ]
  const metCount = checks.filter(Boolean).length

  if (metCount === 4) {
    return { metCount, label: 'strong', widthClass: 'w-full', colorClass: 'bg-green-500' }
  }

  if (metCount >= 2) {
    return {
      metCount,
      label: 'medium',
      widthClass: metCount === 3 ? 'w-3/4' : 'w-1/2',
      colorClass: 'bg-amber-500'
    }
  }

  return {
    metCount,
    label: 'weak',
    widthClass: metCount === 1 ? 'w-1/4' : 'w-0',
    colorClass: 'bg-red-500'
  }
}

export function RegisterPage(): JSX.Element {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const { register: registerUser } = useAuth()

  const {
    register,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema)
  })

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const password = watch('password', '')
  const strength = getPasswordStrength(password)

  const onSubmit = async (data: RegisterFormValues): Promise<void> => {
    try {
      const { confirmPassword, ...dto } = data
      void confirmPassword
      await registerUser(dto)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed'
      showError(message)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Hotel Booking</h1>
          <h2 className="mt-6 text-xl font-semibold text-gray-900">Create your account</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input label="First name" error={errors.firstName?.message} {...register('firstName')} />
          <Input label="Last name" error={errors.lastName?.message} {...register('lastName')} />
          <Input label="Email address" type="email" error={errors.email?.message} {...register('email')} />
          <Input label="Password" type="password" error={errors.password?.message} {...register('password')} />

          <div className="space-y-2" aria-live="polite">
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${strength.widthClass} ${strength.colorClass}`}
              />
            </div>
            <p className="text-xs font-medium text-gray-600">Password strength: {strength.label}</p>
          </div>

          <Input
            label="Confirm password"
            type="password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button type="submit" className="w-full" isLoading={isSubmitting} disabled={isSubmitting}>
            Create account
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
