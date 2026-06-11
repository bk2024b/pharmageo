// components/Pharmacist/GuardManager.tsx

'use client'

import { useState, useEffect } from 'react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'

type GuardSlot = {
  id: string
  starts_at: string
  ends_at: string
  is_active: boolean
}

type GuardManagerProps = {
  pharmacyId: string
}

export const GuardManager = ({ pharmacyId }: GuardManagerProps) => {
  const [slots, setSlots] = useState<GuardSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ starts_at: '', ends_at: '' })
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    fetchSlots()
  }, [pharmacyId])

  const fetchSlots = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/pharmacist/guard?pharmacy_id=${pharmacyId}`)
      const json = await res.json()
      setSlots(json.data ?? [])
    } catch (err) {
      console.error('[GuardManager]', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!form.starts_at || !form.ends_at) {
      setFormError('Les deux dates sont requises')
      return
    }
    if (new Date(form.ends_at) <= new Date(form.starts_at)) {
      setFormError('La date de fin doit être après la date de début')
      return
    }

    setAdding(true)
    setFormError(null)

    try {
      const res = await fetch('/api/pharmacist/guard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pharmacy_id: pharmacyId,
          starts_at: new Date(form.starts_at).toISOString(),
          ends_at: new Date(form.ends_at).toISOString(),
        }),
      })

      if (!res.ok) throw new Error('Erreur serveur')

      setForm({ starts_at: '', ends_at: '' })
      setShowForm(false)
      await fetchSlots()
    } catch (err) {
      setFormError("Erreur lors de l'ajout")
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try {
      await fetch(`/api/pharmacist/guard?id=${id}`, { method: 'DELETE' })
      setSlots((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      console.error('[handleDelete]', err)
    } finally {
      setDeleting(null)
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

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-sm font-semibold text-gray-900">Mes créneaux de garde</h2>
          <p className="text-xs text-gray-400">
            {slots.filter((s) => s.is_active).length} créneau(x) actif(s)
          </p>
        </div>
        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajouter
        </button>
      </div>

      {/* ── Formulaire ajout ─────────────────────────────────────────── */}
      {showForm && (
        <div className="flex flex-col gap-3 p-4 rounded-xl border border-green-200 bg-green-50">
          <h3 className="text-xs font-semibold text-green-800">Nouveau créneau</h3>

          {formError && (
            <p className="text-xs text-red-600">{formError}</p>
          )}

          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-700">Début</label>
              <input
                type="datetime-local"
                value={form.starts_at}
                onChange={(e) => setForm((p) => ({ ...p, starts_at: e.target.value }))}
                className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-700">Fin</label>
              <input
                type="datetime-local"
                value={form.ends_at}
                onChange={(e) => setForm((p) => ({ ...p, ends_at: e.target.value }))}
                className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => { setShowForm(false); setFormError(null) }}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleAdd}
              disabled={adding}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-60"
            >
              {adding && <LoadingSpinner size="sm" label="" />}
              {adding ? 'Ajout...' : 'Confirmer'}
            </button>
          </div>
        </div>
      )}

      {/* ── Liste créneaux ────────────────────────────────────────────── */}
      {slots.length === 0 ? (
        <EmptyState
          type="schedule"
          title="Aucun créneau déclaré"
          subtitle="Appuyez sur Ajouter pour déclarer votre première garde."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {slots.map((slot) => (
            <div
              key={slot.id}
              className={`
                flex items-center justify-between p-4 rounded-xl border
                ${slot.is_active
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-white'
                }
              `}
            >
              <div className="flex flex-col gap-1">
                {slot.is_active && (
                  <span className="flex items-center gap-1 text-xs font-medium text-green-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    En cours
                  </span>
                )}
                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{formatDate(slot.starts_at)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  <span>{formatDate(slot.ends_at)}</span>
                </div>
              </div>

              <button
                onClick={() => handleDelete(slot.id)}
                disabled={deleting === slot.id}
                className="flex items-center justify-center w-8 h-8 rounded-lg border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50"
                aria-label="Supprimer"
              >
                {deleting === slot.id ? (
                  <LoadingSpinner size="sm" label="" />
                ) : (
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}