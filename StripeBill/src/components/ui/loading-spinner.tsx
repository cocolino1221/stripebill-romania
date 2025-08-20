import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  }

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-gray-300 border-t-primary-600',
        sizeClasses[size],
        className
      )}
    />
  )
}

interface LoadingOverlayProps {
  isLoading: boolean
  children: React.ReactNode
  loadingText?: string
}

export function LoadingOverlay({ 
  isLoading, 
  children, 
  loadingText = 'Se încarcă...' 
}: LoadingOverlayProps) {
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <LoadingSpinner size="xl" className="mb-4" />
        <p className="text-gray-600">{loadingText}</p>
      </div>
    )
  }

  return <>{children}</>
}