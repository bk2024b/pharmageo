// components/ui/GuardBadge.tsx

type GuardBadgeProps = {
  compact?: boolean
}

export const GuardBadge = ({ compact = false }: GuardBadgeProps) => {
  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        Garde
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
      De garde
    </span>
  )
}