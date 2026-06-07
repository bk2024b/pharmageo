// components/Admin/PharmacyRequests.tsx

'use client'

import { useState, useEffect } from 'react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

type PharmacyRequest = {
  id: string
  name: string
  address: string
  phone: string | null
  status: string
  created_at: string
  profile: {
    full_name: string
    phone: string
  } | null
}

type Tab = 'pending' | 'active' | 'rejected'

export const PharmacyRequests = () => {
  const [tab, setTab] = useState<Tab>('pending')
  const [pharmacies, setPharmacies] = useState<PharmacyRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchPharmacies(tab)
  }, [tab])

  const fetchPharmacies = async (status: Tab) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/pharmacies?status=${status}`)
      const json = await res.json()
      setPharmacies(json.data ?? [])
    } catch (err) {
      console.error('[PharmacyRequests]', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (id: string, status: 'active' | 'rejected') => {
    setUpdating(id)
    try {
      await fetch('/api/admin/pharmacies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      setPharmacies((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      console.error('[handleUpdate]', err)
    } finally {
      setUpdating(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {([
          { key: 'pending', label: 'En attente' },
          { key: 'active', label: 'Actives' },
          { key: 'rejected', label: 'Rejetées' },
        ] as { key: Tab; label: string }[]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`
              flex-1 py-2 rounded-lg text-xs font-medium transition-all
              ${tab === t.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
              }
            `}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Liste */}
      {loading ? (
        <LoadingSpinner size="md" label="Chargement..." />
      ) : pharmacies.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center text-gray-400">
          <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="text-sm">Aucune pharmacie {tab === 'pending' ? 'en attente' : tab === 'active' ? 'active' : 'rejetée'}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {pharmacies.map((pharmacy) => (
            <div
              key={pharmacy.id}
              className="flex flex-col gap-3 p-4 rounded-xl border border-gray-200 bg-white"
            >
              {/* Infos pharmacie */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-gray-900">{pharmacy.name}</span>
                  <span className="text-xs text-gray-500">{pharmacy.address}</span>
                  {pharmacy.phone && (
                    <span className="text-xs text-gray-400">{pharmacy.phone}</span>
                  )}
                </div>
                <span className="text-xs text-gray-400 shrink-0">
                  {new Date(pharmacy.created_at).toLocaleDateString('fr-FR')}
                </span>
              </div>

              {/* Infos pharmacien */}
              {pharmacy.profile && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-xs text-gray-600">{pharmacy.profile.full_name}</span>
                  {pharmacy.profile.phone && (
                    <span className="text-xs text-gray-400 ml-auto">{pharmacy.profile.phone}</span>
                  )}
                </div>
              )}

              {/* Actions */}
              {tab === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdate(pharmacy.id, 'rejected')}
                    disabled={updating === pharmacy.id}
                    className="flex-1 py-2 rounded-lg border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    Rejeter
                  </button>
                  <button
                    onClick={() => handleUpdate(pharmacy.id, 'active')}
                    disabled={updating === pharmacy.id}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-green-600 text-xs font-medium text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {updating === pharmacy.id
                      ? <LoadingSpinner size="sm" label="" />
                      : null
                    }
                    Valider
                  </button>
                </div>
              )}

              {tab === 'active' && (
                <button
                  onClick={() => handleUpdate(pharmacy.id, 'rejected')}
                  disabled={updating === pharmacy.id}
                  className="py-2 rounded-lg border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  Désactiver
                </button>
              )}

              {tab === 'rejected' && (
                <button
                  onClick={() => handleUpdate(pharmacy.id, 'active')}
                  disabled={updating === pharmacy.id}
                  className="py-2 rounded-lg bg-green-600 text-xs font-medium text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  Réactiver
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}