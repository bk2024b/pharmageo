// components/Layout/GovHeader.tsx

'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

type GovHeaderProps = {
  showMenu?: boolean
}

export const GovHeader = ({ showMenu = true }: GovHeaderProps) => {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      {/* ── Bandeau tricolore ─────────────────────────────────────── */}
      <div className="gov-topbar" />

      {/* ── Header principal ──────────────────────────────────────── */}
      <header className="bg-white border-b border-[var(--color-border)] shadow-[var(--shadow-gov-sm)] shrink-0">
        <div className="flex items-center justify-between px-4 h-14">

          {/* ── Logo + identité ──────────────────────────────────── */}
          <Link href="/" className="flex items-center gap-3 no-underline">
            {/* Armoiries / Logo */}
            <div className="flex items-center justify-center w-9 h-9 rounded bg-[var(--benin-green)] shrink-0">
              <svg viewBox="0 0 36 36" fill="none" className="w-7 h-7">
                {/* Croix médicale stylisée */}
                <rect x="14" y="6" width="8" height="24" rx="1" fill="white" opacity="0.95"/>
                <rect x="6" y="14" width="24" height="8" rx="1" fill="white" opacity="0.95"/>
                {/* Point géoloc */}
                <circle cx="18" cy="18" r="3" fill="var(--benin-green)"/>
              </svg>
            </div>

            {/* Texte */}
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold text-[var(--color-text)] tracking-tight">
                PharmaGéo
              </span>
              <span className="text-[10px] text-[var(--color-text-muted)] font-medium tracking-wide uppercase leading-none">
                Service Public · Bénin
              </span>
            </div>
          </Link>

          {/* ── Actions droite ────────────────────────────────────── */}
          {showMenu && (
            <div className="flex items-center gap-2">

              {/* Badge ministère — desktop uniquement */}
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded border border-[var(--color-border)] bg-[var(--color-bg)]">
                <div className="w-2 h-2 rounded-full bg-[var(--benin-green)]" />
                <span className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
                  Ministère de la Santé
                </span>
              </div>

              {/* Menu burger */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((prev) => !prev)}
                  className="flex items-center justify-center w-9 h-9 rounded border border-[var(--color-border)] hover:bg-[var(--color-bg)] transition-colors"
                  aria-label="Menu"
                  aria-expanded={menuOpen}
                >
                  {menuOpen ? (
                    <svg className="w-4 h-4 text-[var(--color-text)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-[var(--color-text)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>

                {/* Dropdown menu */}
                {menuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-11 z-20 w-64 bg-white border border-[var(--color-border)] shadow-[var(--shadow-gov-md)] rounded overflow-hidden">

                      {/* Header dropdown */}
                      <div className="px-4 py-3 bg-[var(--color-bg)] border-b border-[var(--color-border)]">
                        <p className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                          Accès services
                        </p>
                      </div>

                      {/* Liens */}
                      <nav className="flex flex-col">
                        <Link
                          href="/pharmacie/login"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors border-b border-[var(--color-border)]"
                        >
                          <div className="flex items-center justify-center w-7 h-7 rounded bg-[var(--color-primary-50)]">
                            <svg className="w-4 h-4 text-[var(--benin-green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">Espace pharmacie</span>
                            <span className="text-xs text-[var(--color-text-muted)]">Gérer mon stock et mes gardes</span>
                          </div>
                        </Link>

                        <Link
                          href="/pharmacie/inscription"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors border-b border-[var(--color-border)]"
                        >
                          <div className="flex items-center justify-center w-7 h-7 rounded bg-[var(--color-primary-50)]">
                            <svg className="w-4 h-4 text-[var(--benin-green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">Inscrire ma pharmacie</span>
                            <span className="text-xs text-[var(--color-text-muted)]">Rejoindre la plateforme</span>
                          </div>
                        </Link>

                        <Link
                          href="/admin/login"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] transition-colors"
                        >
                          <div className="flex items-center justify-center w-7 h-7 rounded bg-[var(--color-gov-50)]">
                            <svg className="w-4 h-4 text-[var(--color-gov-500)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">Administration</span>
                            <span className="text-xs text-[var(--color-text-muted)]">Accès restreint</span>
                          </div>
                        </Link>
                      </nav>

                      {/* Footer dropdown */}
                      <div className="px-4 py-2.5 bg-[var(--color-bg)] border-t border-[var(--color-border)]">
                        <p className="text-[10px] text-[var(--color-text-muted)]">
                          © 2025 République du Bénin · Ministère de la Santé
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  )
}