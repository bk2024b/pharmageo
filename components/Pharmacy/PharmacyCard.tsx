// components/Pharmacy/PharmacyCard.tsx

'use client'

import Link from 'next/link'
import { Pharmacy } from '@/types'
import { GuardBadge } from '@/components/ui/GuardBadge'
import { DistanceBadge } from '@/components/ui/DistanceBadge'

type PharmacyCardProps = {
  pharmacy: Pharmacy
  onClick?: () => void
  selected?: boolean
}

export const PharmacyCard = ({
  pharmacy,
  onClick,
  selected = false,
}: PharmacyCardProps) => {
  return (
    <Link href={`/pharmacies/${pharmacy.id}`}>
      <div
        onClick={onClick}
        className={`
          relative flex flex-col gap-2 p-4 rounded-xl border cursor-pointer
          transition-all duration-200
          ${selected
            ? 'border-green-500 bg-green-50 shadow-md'
            : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-sm'
          }
        `}
      >
        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-gray-900 leading-tight">
            {pharmacy.name}
          </h3>
          {pharmacy.is_on_guard && <GuardBadge compact />}
        </div>

        {/* ── Adresse ──────────────────────────────────────────────── */}
        <div className="flex items-start gap-1.5 text-xs text-gray-500">
          <svg
            className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-400"
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
          <span className="line-clamp-2">{pharmacy.address}</span>
        </div>

        {/* ── Footer : distance + téléphone ────────────────────────── */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-2">
            {pharmacy.distance !== undefined && (
              <DistanceBadge meters={pharmacy.distance} />
            )}
          </div>

          {pharmacy.phone && (
            <a
              href={`tel:${pharmacy.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-xs text-green-700 hover:text-green-900 font-medium"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 7V5z"
                />
              </svg>
              {pharmacy.phone}
            </a>
          )}
        </div>
      </div>
    </Link>
  )
}