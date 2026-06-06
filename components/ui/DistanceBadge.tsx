// components/ui/DistanceBadge.tsx

import { formatDistance } from '@/lib/geo'

type DistanceBadgeProps = {
  meters: number
  className?: string
}

export const DistanceBadge = ({ meters, className = '' }: DistanceBadgeProps) => {
  const isClose = meters < 500
  const isMedium = meters >= 500 && meters < 2000

  const colorClass = isClose
    ? 'bg-blue-100 text-blue-800'
    : isMedium
    ? 'bg-amber-100 text-amber-800'
    : 'bg-gray-100 text-gray-700'

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${colorClass} ${className}`}
    >
      <svg
        className="w-3 h-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
      {formatDistance(meters)}
    </span>
  )
}