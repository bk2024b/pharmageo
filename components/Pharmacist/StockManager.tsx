// components/Pharmacist/StockManager.tsx

'use client'

import { useState, useEffect } from 'react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { Medication } from '@/types'

type StockItem = Medication & {
  in_stock: boolean
  inventory_exists: boolean
}

type StockManagerProps = {
  pharmacyId: string
}

export const StockManager = ({ pharmacyId }: StockManagerProps) => {
  const [items, setItems] = useState<StockItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'stock' | 'rupture'>('all')
  const [toggling, setToggling] = useState<string | null>(null)

  useEffect(() => {
    fetchStock()
  }, [pharmacyId])

  const fetchStock = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/pharmacist/stock?pharmacy_id=${pharmacyId}`)
      const json = await res.json()
      setItems(json.data ?? [])
    } catch (err) {
      console.error('[StockManager]', err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (medicationId: string, currentValue: boolean) => {
    setToggling(medicationId)

    // Optimistic update
    setItems((prev) =>
      prev.map((item) =>
        item.id === medicationId
          ? { ...item, in_stock: !currentValue }
          : item
      )
    )

    try {
      const res = await fetch('/api/pharmacist/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pharmacy_id: pharmacyId,
          medication_id: medicationId,
          in_stock: !currentValue,
        }),
      })

      if (!res.ok) throw new Error('Erreur serveur')
    } catch (err) {
      // Rollback
      setItems((prev) =>
        prev.map((item) =>
          item.id === medicationId
            ? { ...item, in_stock: currentValue }
            : item
        )
      )
      console.error('[handleToggle]', err)
    } finally {
      setToggling(null)
    }
  }

  // ── Filtres ───────────────────────────────────────────────────────────
  const filtered = items.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.dci ?? '').toLowerCase().includes(search.toLowerCase())

    const matchFilter =
      filter === 'all' ? true :
      filter === 'stock' ? item.in_stock :
      !item.in_stock

    return matchSearch && matchFilter
  })

  const stockCount = items.filter((i) => i.in_stock).length

  if (loading) return <LoadingSpinner size="md" label="Chargement du stock..." />

  return (
    <div className="flex flex-col gap-4">

      {/* ── Résumé ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Total"
          value={items.length}
          color="gray"
        />
        <StatCard
          label="En stock"
          value={stockCount}
          color="green"
        />
        <StatCard
          label="Rupture"
          value={items.length - stockCount}
          color="red"
        />
      </div>

      {/* ── Barre de recherche ───────────────────────────────────────── */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un médicament..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent"
        />
      </div>

      {/* ── Filtres ──────────────────────────────────────────────────── */}
      <div className="flex gap-2">
        {(['all', 'stock', 'rupture'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`
              px-3 py-1.5 rounded-lg text-xs font-medium transition-all
              ${filter === f
                ? f === 'stock' ? 'bg-green-600 text-white'
                  : f === 'rupture' ? 'bg-red-500 text-white'
                  : 'bg-gray-900 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }
            `}
          >
            {f === 'all' ? 'Tous' : f === 'stock' ? 'En stock' : 'Rupture'}
          </button>
        ))}
      </div>

      {/* ── Liste médicaments ────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center text-gray-400">
          <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm">Aucun médicament trouvé</p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white overflow-hidden">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-sm font-medium text-gray-900 truncate">
                  {item.name}
                </span>
                <div className="flex items-center gap-2">
                  {item.dci && (
                    <span className="text-xs text-gray-400">{item.dci}</span>
                  )}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                    item.otc
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}>
                    {item.otc ? 'VL' : 'Ordo'}
                  </span>
                </div>
              </div>

              {/* Toggle */}
              <button
                onClick={() => handleToggle(item.id, item.in_stock)}
                disabled={toggling === item.id}
                className={`
                  relative inline-flex h-6 w-11 shrink-0 items-center rounded-full
                  transition-colors duration-200 focus:outline-none
                  ${item.in_stock ? 'bg-green-500' : 'bg-gray-200'}
                  ${toggling === item.id ? 'opacity-50' : ''}
                `}
                aria-label={item.in_stock ? 'En stock' : 'Rupture'}
              >
                <span className={`
                  inline-block h-4 w-4 rounded-full bg-white shadow
                  transition-transform duration-200
                  ${item.in_stock ? 'translate-x-6' : 'translate-x-1'}
                `} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const StatCard = ({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: 'gray' | 'green' | 'red'
}) => {
  const colors = {
    gray: 'bg-gray-100 text-gray-700',
    green: 'bg-green-100 text-green-700',
    red: 'bg-red-100 text-red-700',
  }

  return (
    <div className={`flex flex-col items-center gap-1 px-3 py-3 rounded-xl ${colors[color]}`}>
      <span className="text-xl font-bold">{value}</span>
      <span className="text-xs font-medium">{label}</span>
    </div>
  )
}