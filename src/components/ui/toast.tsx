import { Toaster, toast } from 'react-hot-toast'

export function showSuccess(message: string): void {
  toast.success(message)
}

export function showError(message: string): void {
  toast.error(message)
}

export function showInfo(message: string): void {
  toast(message)
}

export function ToastProvider(): JSX.Element {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      toastOptions={{
        duration: 4000,
        className: 'bg-gray-800 text-white',
        success: {
          duration: 3000,
          className: 'bg-green-600 text-white'
        },
        error: {
          duration: 4000,
          className: 'bg-red-600 text-white'
        }
      }}
    />
  )
}
