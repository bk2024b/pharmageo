// components/ui/EmptyState.tsx

type EmptyStateProps = {
  type: 'pharmacy' | 'guard' | 'search' | 'medication' | 'schedule' | 'stock'
  title: string
  subtitle?: string
}

const illustrations: Record<EmptyStateProps['type'], React.ReactNode> = {
  pharmacy: (
    <svg viewBox="0 0 80 80" fill="none" className="w-20 h-20">
      <rect x="20" y="24" width="40" height="36" rx="3" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1.5"/>
      <rect x="33" y="38" width="14" height="22" rx="1.5" fill="#E5E7EB"/>
      <rect x="28" y="30" width="8" height="8" rx="1" fill="#E5E7EB"/>
      <rect x="44" y="30" width="8" height="8" rx="1" fill="#E5E7EB"/>
      <path d="M36 24v-6" stroke="#E5E7EB" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M44 24v-6" stroke="#E5E7EB" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M36 18h8" stroke="#E5E7EB" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="58" cy="22" r="10" fill="#FEF3C7"/>
      <path d="M58 18v5" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="58" cy="25.5" r="1" fill="#F59E0B"/>
    </svg>
  ),
  guard: (
    <svg viewBox="0 0 80 80" fill="none" className="w-20 h-20">
      <circle cx="40" cy="40" r="22" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1.5"/>
      <path d="M40 28v13l8 5" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="40" cy="40" r="2" fill="#D1D5DB"/>
    </svg>
  ),
  search: (
    <svg viewBox="0 0 80 80" fill="none" className="w-20 h-20">
      <circle cx="35" cy="35" r="18" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1.5"/>
      <path d="M48 48l12 12" stroke="#E5E7EB" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M29 35h12M35 29v12" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  medication: (
    <svg viewBox="0 0 80 80" fill="none" className="w-20 h-20">
      <rect x="26" y="18" width="28" height="44" rx="6" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1.5"/>
      <rect x="26" y="18" width="28" height="22" rx="6" fill="#E5E7EB"/>
      <path d="M36 32h8M40 28v8" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M33 48h14M33 54h10" stroke="#E5E7EB" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  schedule: (
    <svg viewBox="0 0 80 80" fill="none" className="w-20 h-20">
      <rect x="18" y="24" width="44" height="38" rx="4" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1.5"/>
      <path d="M18 34h44" stroke="#E5E7EB" strokeWidth="1.5"/>
      <rect x="28" y="20" width="4" height="8" rx="2" fill="#D1D5DB"/>
      <rect x="48" y="20" width="4" height="8" rx="2" fill="#D1D5DB"/>
      <path d="M28 44h8M28 52h14M44 44h8" stroke="#E5E7EB" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  stock: (
    <svg viewBox="0 0 80 80" fill="none" className="w-20 h-20">
      <rect x="16" y="32" width="48" height="28" rx="3" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="1.5"/>
      <rect x="24" y="24" width="32" height="12" rx="3" fill="#EFEFEF" stroke="#E5E7EB" strokeWidth="1.5"/>
      <path d="M32 38h16M32 46h10" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="58" cy="26" r="10" fill="#DCFCE7"/>
      <path d="M54 26l3 3 5-5" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
}

export const EmptyState = ({ type, title, subtitle }: EmptyStateProps) => (
  <div className="flex flex-col items-center gap-3 py-12 text-center">
    {illustrations[type]}
    <div className="flex flex-col gap-1">
      <p className="text-sm font-medium text-gray-600">{title}</p>
      {subtitle && (
        <p className="text-xs text-gray-400 max-w-[220px] mx-auto leading-relaxed">{subtitle}</p>
      )}
    </div>
  </div>
)