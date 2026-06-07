// app/pharmacie/dashboard/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getMyPharmacy, signOut } from '@/lib/auth'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { GuardBadge } from '@/components/ui/GuardBadge'
import { StockManager } from '@/components/Pharmacist/StockManager'
import { GuardManager } from '@/components/Pharmacist/GuardManager'

type Tab = 'stock' | 'gardes'

type PharmacyProfile = {
  profile: {
    id: string
    full_name: string
    phone: string
    role: string
    pharmacy_id: string
  }
  pharmacy: {
    id: string
    name: string
    address: string
    phone: string
    status: string
    location: unknown
  } | null
}

export default function DashboardPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('stock')
  const [data, setData] = useState<PharmacyProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const result = await getMyPharmacy()
      if (!result) {
        router.push('/pharmacie/login')
        return
      }
      setData(result)
      setLoading(false)
    }
    load()
  }, [router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (loading) return <LoadingSpinner fullscreen label="Chargement..." />

  const pharmacy = data?.pharmacy
  const profile = data?.profile
  const isPending = pharmacy?.status === 'pending'
  const isRejected = pharmacy?.status === 'rejected'

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex flex-col min-w-0">
            <h1 className="text-sm font-bold text-gray-900 truncate">
              {pharmacy?.name ?? 'Mon espace pharmacie'}
            </h1>
            <p className="text-xs text-gray-400 truncate">
              {profile?.full_name}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {pharmacy?.status === 'active' && <GuardBadge compact />}
            <button
              onClick={handleSignOut}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              aria-label="Déconnexion"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs — seulement si pharmacie active */}
        {!isPending && !isRejected && (
          <div className="flex px-4 gap-1 pb-0">
            <TabBtn active={tab === 'stock'} onClick={() => setTab('stock')} label="💊 Stock" />
            <TabBtn active={tab === 'gardes'} onClick={() => setTab('gardes')} label="🕐 Gardes" />
          </div>
        )}
      </header>

      {/* ── Statut en attente ─────────────────────────────────────────── */}
      {isPending && (
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="flex flex-col items-center gap-4 max-w-sm text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-amber-100">
              <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-semibold text-gray-900">Demande en cours d'examen</h2>
              <p className="text-sm text-gray-500">
                Votre pharmacie sera activée sous 24h après validation par notre équipe.
                Vous recevrez un email de confirmation.
              </p>
            </div>
            <div className="w-full px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-xs text-amber-700 font-medium">{pharmacy?.name}</p>
              <p className="text-xs text-amber-600">{pharmacy?.address}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Statut rejeté ─────────────────────────────────────────────── */}
      {isRejected && (
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="flex flex-col items-center gap-4 max-w-sm text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-semibold text-gray-900">Demande non validée</h2>
              <p className="text-sm text-gray-500">
                Votre demande n'a pas pu être validée. Contactez-nous pour plus d'informations.
              </p>
            </div>
            <a
              href="mailto:contact@pharmageo.bj"
              className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
            >
              Nous contacter
            </a>
          </div>
        </div>
      )}

      {/* ── Contenu principal ─────────────────────────────────────────── */}
      {!isPending && !isRejected && pharmacy && (
        <main className="flex-1 px-4 py-4">
          {tab === 'stock' && (
            <StockManager pharmacyId={pharmacy.id} />
          )}
          {tab === 'gardes' && (
            <GuardManager pharmacyId={pharmacy.id} />
          )}
        </main>
      )}
    </div>
  )
}

const TabBtn = ({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) => (
  <button
    onClick={onClick}
    className={`
      px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200
      ${active
        ? 'border-green-600 text-green-700'
        : 'border-transparent text-gray-500 hover:text-gray-700'
      }
    `}
  >
    {label}
  </button>
)