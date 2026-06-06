// components/Search/SearchResults.tsx

'use client'

import { useState } from 'react'
import { Medication, PharmacyInventory, Pharmacy } from '@/types'
import { DistanceBadge } from '@/components/ui/DistanceBadge'

type MedicationResult = Medication & {
  availability: {
    total_pharmacies: number
    in_stock: number
  }
  pharmacies: (PharmacyInventory & {
    pharmacy: Pharmacy & { distance: number | null }
  })[]
}

type SearchResultsProps = {
  results: MedicationResult[]
  query: string
  loading: boolean
}

export const SearchResults = ({ results, query, loading }: SearchResultsProps) => {

  // ── Etat vide ──────────────────────────────────────────────────────────
  if (!query || query.trim().length < 2) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center text-gray-400">
        <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p className="text-sm">Tapez le nom d'un médicament ou sa DCI</p>
      </div>
    )
  }

  // ── Chargement ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  // ── Aucun résultat ─────────────────────────────────────────────────────
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center text-gray-400">
        <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm font-medium text-gray-600">Aucun résultat pour « {query} »</p>
        <p className="text-xs text-gray-400">Essayez le nom générique (DCI) ou vérifiez l'orthographe</p>
      </div>
    )
  }

  // ── Résultats ──────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-gray-400 px-1">
        {results.length} résultat{results.length > 1 ? 's' : ''} pour « {query} »
      </p>

      {results.map((med) => (
        <MedicationResultCard key={med.id} medication={med} />
      ))}
    </div>
  )
}

// ── Card médicament ────────────────────────────────────────────────────────
const MedicationResultCard = ({ medication }: { medication: MedicationResult }) => {
  const [expanded, setExpanded] = useState(false)
  const hasStock = medication.availability.in_stock > 0

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden">

      {/* Header */}
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="flex items-start justify-between gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-900">
              {medication.name}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              medication.otc
                ? 'bg-blue-100 text-blue-800'
                : 'bg-orange-100 text-orange-800'
            }`}>
              {medication.otc ? 'Vente libre' : 'Ordonnance'}
            </span>
          </div>

          {medication.dci && (
            <span className="text-xs text-gray-400">{medication.dci}</span>
          )}

          {medication.category && (
            <span className="text-xs text-gray-400">{medication.category}</span>
          )}
        </div>

        {/* Dispo + chevron */}
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            hasStock
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-700'
          }`}>
            {hasStock
              ? `${medication.availability.in_stock} pharmacie${medication.availability.in_stock > 1 ? 's' : ''}`
              : 'Indisponible'
            }
          </span>

          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Liste pharmacies (expanded) */}
      {expanded && (
        <div className="border-t border-gray-100 divide-y divide-gray-100">
          {medication.pharmacies.length === 0 ? (
            <p className="px-4 py-3 text-xs text-gray-400">
              Aucune pharmacie avec ce médicament en stock
            </p>
          ) : (
            medication.pharmacies.map((item) => (
              <div
                key={item.pharmacy_id}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-gray-900">
                    {item.pharmacy.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {item.pharmacy.address}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.pharmacy.distance !== null && (
                    <DistanceBadge meters={item.pharmacy.distance} />
                  )}
                  <span className={`text-xs font-semibold ${
                    item.quantity <= 5 ? 'text-orange-500' : 'text-green-600'
                  }`}>
                    {item.quantity <= 5
                      ? `${item.quantity} restant${item.quantity > 1 ? 's' : ''}`
                      : 'En stock'
                    }
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ── Skeleton loader ────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="flex flex-col gap-3 p-4 rounded-xl border border-gray-200 bg-white animate-pulse">
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-2">
        <div className="h-4 w-40 bg-gray-200 rounded" />
        <div className="h-3 w-24 bg-gray-100 rounded" />
      </div>
      <div className="h-5 w-20 bg-gray-200 rounded-full" />
    </div>
  </div>
)