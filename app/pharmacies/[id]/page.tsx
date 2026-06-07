// app/pharmacies/[id]/page.tsx

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getMedicationsByPharmacy } from '@/lib/medications'
import { PharmacyDetail } from '@/components/Pharmacy/PharmacyDetail'
import { createSupabaseAdminClient } from '@/lib/supabase'
import type { PharmacyRow } from '@/types'

type Props = {
  params: Promise<{ id: string }>
}

const parseLocation = (raw: unknown): { lat: number; lng: number } => {
  if (typeof raw === 'object' && raw !== null) {
    const obj = raw as Record<string, unknown>
    if ('coordinates' in obj && Array.isArray(obj.coordinates)) {
      const [lng, lat] = obj.coordinates as number[]
      return { lat, lng }
    }
  }
  return { lat: 0, lng: 0 }
}

export default async function PharmacyPage({ params }: Props) {
  const { id } = await params

  const supabase = createSupabaseAdminClient()

  const { data, error } = await supabase
    .from('pharmacies')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) notFound()

  const row = data as unknown as PharmacyRow
  const pharmacy = {
    id: row.id,
    name: row.name,
    address: row.address,
    phone: row.phone,
    location: parseLocation(row.location),
    created_at: row.created_at,
  }

  const inventory = await getMedicationsByPharmacy(id)

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200">
        <Link
          href="/"
          className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          aria-label="Retour"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>

        <div className="flex flex-col min-w-0">
          <h1 className="text-sm font-semibold text-gray-900 truncate">
            {pharmacy.name}
          </h1>
          <p className="text-xs text-gray-400 truncate">{pharmacy.address}</p>
        </div>

        {pharmacy.phone && (
          <a
            href={`tel:${pharmacy.phone}`}
            className="ml-auto flex items-center justify-center w-8 h-8 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
            aria-label={`Appeler ${pharmacy.name}`}
          >
            <svg className="w-4 h-4 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 7V5z" />
            </svg>
          </a>
        )}
      </header>

      {/* ── Contenu ───────────────────────────────────────────────────── */}
      <main className="flex-1 p-4">
        <PharmacyDetail pharmacy={pharmacy} inventory={inventory} />
      </main>
    </div>
  )
}

// ── Metadata dynamique ────────────────────────────────────────────────────
export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const supabase = createSupabaseAdminClient()

  const { data } = await supabase
    .from('pharmacies')
    .select('name, address')
    .eq('id', id)
    .single()

  if (!data) {
    return { title: 'Pharmacie introuvable — PharmaGéo' }
  }

  const row = data as unknown as PharmacyRow

  return {
    title: `${row.name} — PharmaGéo`,
    description: row.address,
  }
}