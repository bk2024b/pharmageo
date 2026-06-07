// components/Admin/MedicationManager.tsx

'use client'

import { useState, useEffect } from 'react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { Medication } from '@/types'

type FormState = {
  name: string
  dci: string
  category: string
  otc: boolean
}

const EMPTY_FORM: FormState = { name: '', dci: '', category: '', otc: true }

const CATEGORIES = [
  'Antalgique', 'Anti-inflammatoire', 'Antibiotique',
  'Antipaludéen', 'Antihistaminique', 'Gastro-entérologie',
  'Complément', 'Cardiovasculaire', 'Dermatologie', 'Autre',
]

export const MedicationManager = () => {
  const [medications, setMedications] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Medication | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    fetchMedications()
  }, [])

  const fetchMedications = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/medications')
      const json = await res.json()
      setMedications(json.data ?? [])
    } catch (err) {
      console.error('[MedicationManager]', err)
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setShowForm(true)
  }

  const openEdit = (med: Medication) => {
    setEditing(med)
    setForm({
      name: med.name,
      dci: med.dci ?? '',
      category: med.category ?? '',
      otc: med.otc,
    })
    setFormError(null)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      setFormError('Nom requis')
      return
    }

    setSaving(true)
    setFormError(null)

    try {
      const method = editing ? 'PATCH' : 'POST'
      const body = editing
        ? { id: editing.id, ...form }
        : form

      const res = await fetch('/api/admin/medications', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) throw new Error('Erreur serveur')

      setShowForm(false)
      setEditing(null)
      await fetchMedications()
    } catch (err) {
      setFormError('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try {
      await fetch(`/api/admin/medications?id=${id}`, { method: 'DELETE' })
      setMedications((prev) => prev.filter((m) => m.id !== id))
    } catch (err) {
      console.error('[handleDelete]', err)
    } finally {
      setDeleting(null)
    }
  }

  const filtered = medications.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    (m.dci ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (m.category ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">{medications.length} médicament(s)</p>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajouter
        </button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="flex flex-col gap-3 p-4 rounded-xl border border-green-200 bg-green-50">
          <h3 className="text-xs font-semibold text-green-800">
            {editing ? 'Modifier le médicament' : 'Nouveau médicament'}
          </h3>

          {formError && <p className="text-xs text-red-600">{formError}</p>}

          <div className="flex flex-col gap-2">
            <MiniField
              label="Nom *"
              value={form.name}
              onChange={(v) => setForm((p) => ({ ...p, name: v }))}
              placeholder="Paracétamol 500mg"
            />
            <MiniField
              label="DCI"
              value={form.dci}
              onChange={(v) => setForm((p) => ({ ...p, dci: v }))}
              placeholder="paracétamol"
            />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-700">Catégorie</label>
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                <option value="">Sélectionner...</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-gray-200">
              <span className="text-sm text-gray-700">Vente libre</span>
              <button
                onClick={() => setForm((p) => ({ ...p, otc: !p.otc }))}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${form.otc ? 'bg-green-500' : 'bg-gray-200'}
                `}
              >
                <span className={`
                  inline-block h-4 w-4 rounded-full bg-white shadow transition-transform
                  ${form.otc ? 'translate-x-6' : 'translate-x-1'}
                `} />
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => { setShowForm(false); setEditing(null) }}
              className="flex-1 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 disabled:opacity-60"
            >
              {saving && <LoadingSpinner size="sm" label="" />}
              {saving ? 'Sauvegarde...' : editing ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </div>
      )}

      {/* Recherche */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
        />
      </div>

      {/* Liste */}
      {loading ? (
        <LoadingSpinner size="md" label="Chargement..." />
      ) : (
        <div className="flex flex-col divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white overflow-hidden">
          {filtered.map((med) => (
            <div key={med.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-sm font-medium text-gray-900 truncate">{med.name}</span>
                <div className="flex items-center gap-2">
                  {med.dci && <span className="text-xs text-gray-400">{med.dci}</span>}
                  {med.category && <span className="text-xs text-gray-300">·</span>}
                  {med.category && <span className="text-xs text-gray-400">{med.category}</span>}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                    med.otc ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {med.otc ? 'VL' : 'Ordo'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <button
                  onClick={() => openEdit(med)}
                  className="flex items-center justify-center w-7 h-7 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(med.id)}
                  disabled={deleting === med.id}
                  className="flex items-center justify-center w-7 h-7 rounded-lg border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {deleting === med.id
                    ? <LoadingSpinner size="sm" label="" />
                    : <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                  }
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const MiniField = ({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-medium text-gray-700">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
    />
  </div>
)