// components/Layout/GovPageHeader.tsx
// Header pour les pages internes (pharmacie, admin)

'use client'

import Link from 'next/link'

type GovPageHeaderProps = {
  title: string
  subtitle?: string
  backHref?: string
  actions?: React.ReactNode
  variant?: 'default' | 'admin'
}

export const GovPageHeader = ({
  title,
  subtitle,
  backHref,
  actions,
  variant = 'default',
}: GovPageHeaderProps) => {
  const bgClass = variant === 'admin'
    ? 'bg-[var(--color-gov-500)]'
    : 'bg-white'

  const textClass = variant === 'admin'
    ? 'text-white'
    : 'text-[var(--color-text)]'

  const subtextClass = variant === 'admin'
    ? 'text-[var(--color-gov-200)]'
    : 'text-[var(--color-text-muted)]'

  const borderClass = variant === 'admin'
    ? 'border-[var(--color-gov-400)]'
    : 'border-[var(--color-border)]'

  return (
    <>
      <div className="gov-topbar" />
      <header className={`sticky top-0 z-10 ${bgClass} border-b ${borderClass} shadow-[var(--shadow-gov-sm)] shrink-0`}>
        <div className="flex items-center gap-3 px-4 h-14">

          {/* Bouton retour */}
          {backHref && (
            <Link
              href={backHref}
              className={`
                flex items-center justify-center w-8 h-8 rounded border transition-colors shrink-0
                ${variant === 'admin'
                  ? 'border-[var(--color-gov-400)] hover:bg-[var(--color-gov-600)] text-white'
                  : 'border-[var(--color-border)] hover:bg-[var(--color-bg)] text-[var(--color-text)]'
                }
              `}
              aria-label="Retour"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          )}

          {/* Logo mini si pas de retour */}
          {!backHref && (
            <div className={`
              flex items-center justify-center w-8 h-8 rounded shrink-0
              ${variant === 'admin' ? 'bg-white/20' : 'bg-[var(--color-primary-50)]'}
            `}>
              <svg viewBox="0 0 28 28" fill="none" className="w-5 h-5">
                <rect x="10" y="4"  width="8" height="20" rx="1" fill={variant === 'admin' ? 'white' : 'var(--benin-green)'} opacity="0.9"/>
                <rect x="4"  width="20" y="10" height="8" rx="1" fill={variant === 'admin' ? 'white' : 'var(--benin-green)'} opacity="0.9"/>
                <circle cx="14" cy="14" r="2.5" fill={variant === 'admin' ? 'var(--color-gov-500)' : 'white'}/>
              </svg>
            </div>
          )}

          {/* Titre */}
          <div className="flex flex-col min-w-0 flex-1">
            <h1 className={`text-sm font-bold truncate ${textClass}`}>
              {title}
            </h1>
            {subtitle && (
              <p className={`text-[10px] truncate ${subtextClass}`}>
                {subtitle}
              </p>
            )}
          </div>

          {/* Actions */}
          {actions && (
            <div className="flex items-center gap-2 shrink-0">
              {actions}
            </div>
          )}
        </div>
      </header>
    </>
  )
}