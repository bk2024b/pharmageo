// components/Admin/GuardOverview.tsx

'use client'

import { useState, useEffect } from 'react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { GuardBadge } from '@/components/ui/GuardBadge'

type GuardEntry = {
  id: string
  starts_at: string
  ends_at: string
  is_active: boolean
  pharmacy: {
    id: string
    name: string
    address: string
    phone: string | null
  }
}

export const GuardOverview = () => {
  const [guards, setGuards] = useState<GuardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGuards()
  }, [])

  const fetchGuards = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/pharmacies/guard')
      const json = await res.json()
      const entries = (json.data ?? []).map((item: any) => ({
        id: item.schedule_id,
        starts_at: item.starts_at,
        ends_at: item.ends_at,
        is_active: true,
        pharmacy: item.pharmacy,
      }))
      setGuards(entries)
    } catch (err) {
      console.error('[GuardOverview]', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })

  if (loading) return <LoadingSpinner size="md" label="Chargement des gardes..." />

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">
          {guards.length} pharmacie(s) de garde en ce moment
        </p>
        <GuardBadge compact />
      </div>

      {guards.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center text-gray-400">
          <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm">Aucune pharmacie de garde actuellement</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {guards.map((g) => (
            <div
              key={g.id}
              className="flex flex-col gap-2 p-4 rounded-xl border border-green-200 bg-green-50"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-gray-900">{g.pharmacy.name}</span>
                  <span className="text-xs text-gray-500">{g.pharmacy.address}</span>
                  {g.pharmacy.phone && (
                    
                      href={`tel:${g.pharmacy.phone}`}
                      className="text-xs text-green-700 hover:underline"
                    >
                      {g.pharmacy.phone}
                    </a>
                  )}
                </div>
                <GuardBadge compact />
              </div>

              <div className="flex flex-col gap-1 px-3 py-2 rounded-lg bg-white border border-green-100">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Début : {formatDate(g.starts_at)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  <span>Fin : {formatDate(g.ends_at)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}