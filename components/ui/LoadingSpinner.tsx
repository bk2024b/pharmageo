// components/ui/LoadingSpinner.tsx

type SpinnerSize = 'sm' | 'md' | 'lg'

type LoadingSpinnerProps = {
  size?: SpinnerSize
  label?: string
  fullscreen?: boolean
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-3',
}

export const LoadingSpinner = ({
  size = 'md',
  label = 'Chargement...',
  fullscreen = false,
}: LoadingSpinnerProps) => {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeClasses[size]} rounded-full border-gray-200 border-t-green-500 animate-spin`}
      />
      {label && (
        <p className="text-sm text-gray-500">{label}</p>
      )}
    </div>
  )

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {spinner}
      </div>
    )
  }

  return spinner
}