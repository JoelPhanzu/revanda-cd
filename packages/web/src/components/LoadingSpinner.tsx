export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  message?: string
}

export function LoadingSpinner({ size = 'medium', message }: LoadingSpinnerProps) {
  const sizes = {
    small: 'h-4 w-4 border-2',
    medium: 'h-8 w-8 border-[3px]',
    large: 'h-12 w-12 border-4',
  }

  return (
    <div className="flex flex-col items-center justify-center gap-2 py-6">
      <div
        className={`${sizes[size]} animate-spin rounded-full border-indigo-600 border-r-transparent`}
        role="status"
        aria-label="Loading"
      ></div>
      {message && <p className="text-sm text-slate-600">{message}</p>}
    </div>
  )
}

export default LoadingSpinner
