// app/search/page.tsx

'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { SearchBar } from '@/components/Search/SearchBar'
import { SearchResults } from '@/components/Search/SearchResults'
import type { MedicationResult } from '@/types'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<MedicationResult[]>([])
  const [loading, setLoading] = useState(false)
  const [otcOnly, setOtcOnly] = useState(false)

  const handleSearch = useCallback(async (q: string) => {
    setQuery(q)

    if (!q || q.trim().length < 2) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams({ q })
      if (otcOnly) params.set('otc', 'true')

      // Géoloc optionnelle
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            params.set('lat', pos.coords.latitude.toString())
            params.set('lng', pos.coords.longitude.toString())
            await fetchResults(params)
          },
          async () => {
            // Pas de position → recherche sans distance
            await fetchResults(params)
          },
          { timeout: 3000 }
        )
      } else {
        await fetchResults(params)
      }
    } catch (err) {
      console.error('[SearchPage]', err)
      setLoading(false)
    }
  }, [otcOnly])

  const fetchResults = async (params: URLSearchParams) => {
    try {
      const res = await fetch(`/api/medications/search?${params.toString()}`)
      const json = await res.json()
      setResults(json.data ?? [])
    } catch (err) {
      console.error('[fetchResults]', err)
    } finally {
      setLoading(false)
    }
  }

  const handleOtcToggle = () => {
    setOtcOnly((prev) => !prev)
    if (query.trim().length >= 2) {
      const params = new URLSearchParams({ q: query })
      if (!otcOnly) params.set('otc', 'true')
      fetchResults(params)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link
            href="/"
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors shrink-0"
            aria-label="Retour"
          >
            <svg
              className="w-4 h-4 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>

          <div className="flex-1">
            <SearchBar
              onSearch={handleSearch}
              loading={loading}
              placeholder="Médicament, DCI, catégorie..."
            />
          </div>
        </div>

        {/* ── Filtre vente libre ──────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-4 pb-3">
          <button
            onClick={handleOtcToggle}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
              transition-all duration-200
              ${otcOnly
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }
            `}
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
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
              />
            </svg>
            Vente libre uniquement
          </button>

          {results.length > 0 && !loading && (
            <span className="text-xs text-gray-400 ml-auto">
              {results.length} résultat{results.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </header>

      {/* ── Contenu ───────────────────────────────────────────────────── */}
      <main className="flex-1 px-4 py-4">
        <SearchResults
          results={results}
          query={query}
          loading={loading}
        />
      </main>
    </div>
  )
}