// components/Pharmacy/PharmacyDetail.tsx

'use client'

import { Pharmacy, PharmacyInventory, Medication } from '@/types'
import { GuardBadge } from '@/components/ui/GuardBadge'
import { DistanceBadge } from '@/components/ui/DistanceBadge'

type PharmacyDetailProps = {
  pharmacy: Pharmacy
  inventory?: (PharmacyInventory & { medication: Medication })[]
}

export const PharmacyDetail = ({
  pharmacy,
  inventory = [],
}: PharmacyDetailProps) => {
  const otcItems = inventory.filter((i) => i.medication.otc)
  const rxItems = inventory.filter((i) => !i.medication.otc)

  return (
    <div className="flex flex-col gap-6">

      {/* ── Header pharmacie ─────────────────────────────────────── */}
      <div className="flex flex-col gap-3 p-5 bg-white rounded-xl border border-gray-200">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-bold text-gray-900">{pharmacy.name}</h1>
          {pharmacy.is_on_guard && <GuardBadge />}
        </div>

        <div className="flex flex-col gap-2 text-sm text-gray-600">
          {/* Adresse */}
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{pharmacy.address}</span>
          </div>

          {/* Téléphone */}
          {pharmacy.phone && (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 7V5z" />
              </svg>
              <a
                href={`tel:${pharmacy.phone}`}
                className="text-green-700 hover:underline font-medium"
              >
                {pharmacy.phone}
              </a>
            </div>
          )}

          {/* Distance */}
          {pharmacy.distance !== undefined && (
            <div className="flex items-center gap-2">
              <DistanceBadge meters={pharmacy.distance} />
              <span className="text-gray-400 text-xs">de votre position</span>
            </div>
          )}
        </div>

        {/* Bouton itinéraire */}
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${pharmacy.location.lat},${pharmacy.location.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Itinéraire
        </a>
      </div>

      {/* ── Stock médicaments ─────────────────────────────────────── */}
      {inventory.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-base font-semibold text-gray-800">
            Médicaments disponibles
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({inventory.length})
            </span>
          </h2>

          {/* Vente libre */}
          {otcItems.length > 0 && (
            <MedicationGroup
              title="Vente libre"
              items={otcItems}
              badgeColor="bg-blue-100 text-blue-800"
            />
          )}

          {/* Ordonnance */}
          {rxItems.length > 0 && (
            <MedicationGroup
              title="Sur ordonnance"
              items={rxItems}
              badgeColor="bg-orange-100 text-orange-800"
            />
          )}
        </div>
      )}

      {inventory.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-10 text-center text-gray-400">
          <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 12h.01" />
          </svg>
          <p className="text-sm">Aucun stock renseigné pour cette pharmacie</p>
        </div>
      )}
    </div>
  )
}

// ── Sous-composant groupement par type ────────────────────────────────────
type MedicationGroupProps = {
  title: string
  items: (PharmacyInventory & { medication: Medication })[]
  badgeColor: string
}

const MedicationGroup = ({ title, items, badgeColor }: MedicationGroupProps) => (
  <div className="flex flex-col gap-2">
    <div className="flex items-center gap-2">
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badgeColor}`}>
        {title}
      </span>
      <span className="text-xs text-gray-400">{items.length} référence{items.length > 1 ? 's' : ''}</span>
    </div>

    <div className="flex flex-col divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden">
      {items.map((item) => (
        <div
          key={item.medication_id}
          className="flex items-center justify-between px-4 py-3 bg-white hover:bg-gray-50 transition-colors"
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-gray-900">
              {item.medication.name}
            </span>
            {item.medication.dci && (
              <span className="text-xs text-gray-400">{item.medication.dci}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-semibold ${item.quantity <= 5 ? 'text-orange-600' : 'text-green-600'}`}>
              {item.quantity <= 5 ? `${item.quantity} restant${item.quantity > 1 ? 's' : ''}` : 'En stock'}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
)