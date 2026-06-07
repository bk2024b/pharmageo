// app/page.tsx

'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { PharmacyCard } from '@/components/Pharmacy/PharmacyCard'
import { SearchBar } from '@/components/Search/SearchBar'
import { SearchResults } from '@/components/Search/SearchResults'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { GuardBadge } from '@/components/ui/GuardBadge'
import type { Pharmacy, PharmacyWithGuard, MedicationResult, MapView } from '@/types'
import { getUserLocation, COTONOU_CENTER } from '@/lib/geo'

const PharmacyMap = dynamic(
  () => import('@/components/Map/PharmacyMap').then((m) => m.PharmacyMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[400px] rounded-xl bg-gray-100 animate-pulse flex items-center justify-center">
        <LoadingSpinner size="md" label="Chargement de la carte..." />
      </div>
    ),
  }
)

type ActiveTab = 'map' | 'medications' | 'pharmacies'

export default function HomePage() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [pharmacies, setPharmacies] = useState<PharmacyWithGuard[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mapView, setMapView] = useState<MapView>('all')
  const [locationError, setLocationError] = useState<string | null>(null)
  const [pharmaciesLoading, setPharmaciesLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<ActiveTab>('map')
  const [menuOpen, setMenuOpen] = useState(false)

  // ── Recherche médicaments ─────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<MedicationResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

  // ── Recherche pharmacies ──────────────────────────────────────────────
  const [pharmacySearch, setPharmacySearch] = useState('')
  const [pharmacySearchResults, setPharmacySearchResults] = useState<PharmacyWithGuard[]>([])
  const [pharmacySearchLoading, setPharmacySearchLoading] = useState(false)

  // ── Géolocalisation ───────────────────────────────────────────────────
  useEffect(() => {
    const locate = async () => {
      try {
        const coords = await getUserLocation()
        setUserLocation({ lat: coords.latitude, lng: coords.longitude })
      } catch (err: any) {
        setLocationError(err.message)
        setUserLocation(COTONOU_CENTER)
      }
    }
    locate()
  }, [])

  useEffect(() => {
    if (!userLocation) return
    fetchPharmacies(userLocation.lat, userLocation.lng, mapView)
  }, [userLocation, mapView])

  const fetchPharmacies = async (lat: number, lng: number, view: MapView) => {
    setPharmaciesLoading(true)
    try {
      const endpoint =
        view === 'guard'
          ? `/api/pharmacies/guard?lat=${lat}&lng=${lng}`
          : `/api/pharmacies/nearby?lat=${lat}&lng=${lng}&radius=5000`

      const res = await fetch(endpoint)
      const json = await res.json()

      if (view === 'guard') {
        const list = (json.data ?? []).map((item: any) => item.pharmacy)
        setPharmacies(list)
      } else {
        setPharmacies(json.data ?? [])
      }
    } catch (err) {
      console.error('[fetchPharmacies]', err)
    } finally {
      setPharmaciesLoading(false)
    }
  }

  // ── Recherche médicaments ─────────────────────────────────────────────
  const handleMedicationSearch = useCallback(async (query: string) => {
    setSearchQuery(query)

    if (!query || query.trim().length < 2) {
      setSearchResults([])
      return
    }

    setSearchLoading(true)
    try {
      const coords = userLocation ?? COTONOU_CENTER
      const url =
        `/api/medications/search?q=${encodeURIComponent(query)}` +
        `&lat=${coords.lat}&lng=${coords.lng}`

      const res = await fetch(url)
      const json = await res.json()
      setSearchResults(json.data ?? [])
    } catch (err) {
      console.error('[handleMedicationSearch]', err)
    } finally {
      setSearchLoading(false)
    }
  }, [userLocation])

  // ── Recherche pharmacies ──────────────────────────────────────────────
  const handlePharmacySearch = useCallback(async (query: string) => {
    setPharmacySearch(query)

    if (!query || query.trim().length < 2) {
      setPharmacySearchResults([])
      return
    }

    setPharmacySearchLoading(true)
    try {
      const coords = userLocation ?? COTONOU_CENTER
      const url =
        `/api/pharmacies/search?q=${encodeURIComponent(query)}` +
        `&lat=${coords.lat}&lng=${coords.lng}`

      const res = await fetch(url)
      const json = await res.json()
      setPharmacySearchResults(json.data ?? [])
    } catch (err) {
      console.error('[handlePharmacySearch]', err)
    } finally {
      setPharmacySearchLoading(false)
    }
  }, [userLocation])

  const handleSelectPharmacy = useCallback((pharmacy: Pharmacy) => {
    setSelectedId((prev) => (prev === pharmacy.id ? null : pharmacy.id))
  }, [])

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">💊</span>
          <h1 className="text-base font-bold text-gray-900">PharmaGéo</h1>
        </div>

        <div className="flex items-center gap-2">
          {locationError && (
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
              Position approximative
            </span>
          )}

          <div className="relative">
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-10 z-20 w-52 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
                  <Link
                    href="/pharmacie/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <span>🏥</span>
                    Espace pharmacie
                  </Link>
                  <Link
                    href="/pharmacie/inscription"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100"
                  >
                    <span>➕</span>
                    Inscrire ma pharmacie
                  </Link>
                  <Link
                    href="/admin/login"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-gray-500 hover:bg-gray-50 transition-colors border-t border-gray-100"
                  >
                    <span>⚙️</span>
                    Administration
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Tabs ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 px-4 pt-3 shrink-0">
        <TabButton active={activeTab === 'map'} onClick={() => setActiveTab('map')} label="Carte" icon="🗺️" />
        <TabButton active={activeTab === 'pharmacies'} onClick={() => setActiveTab('pharmacies')} label="Pharmacies" icon="🏥" />
        <TabButton active={activeTab === 'medications'} onClick={() => setActiveTab('medications')} label="Médicaments" icon="💊" />
      </div>

      {/* ══ VUE CARTE ══════════════════════════════════════════════════ */}
      {activeTab === 'map' && (
        <div className="flex flex-col flex-1 overflow-hidden gap-3 p-4">
          <div className="flex items-center gap-2 shrink-0">
            <FilterButton active={mapView === 'all'} onClick={() => setMapView('all')} label="Toutes" />
            <FilterButton
              active={mapView === 'guard'}
              onClick={() => setMapView('guard')}
              label="De garde"
              badge={<GuardBadge compact />}
            />
            {pharmaciesLoading && (
              <div className="ml-auto">
                <LoadingSpinner size="sm" label="" />
              </div>
            )}
          </div>

          <div className="flex-1 min-h-0">
            <PharmacyMap
              pharmacies={pharmacies}
              userLocation={userLocation}
              selectedId={selectedId}
              onSelectPharmacy={handleSelectPharmacy}
              className="h-full"
            />
          </div>

          <div className="shrink-0 max-h-48 overflow-y-auto flex flex-col gap-2">
            {pharmaciesLoading ? (
              <LoadingSpinner size="sm" label="Recherche en cours..." />
            ) : pharmacies.length === 0 ? (
              <p className="text-sm text-center text-gray-400 py-4">
                {mapView === 'guard'
                  ? 'Aucune pharmacie de garde en ce moment'
                  : 'Aucune pharmacie trouvée dans ce rayon'}
              </p>
            ) : (
              pharmacies.map((p) => (
                <PharmacyCard
                  key={p.id}
                  pharmacy={p}
                  selected={selectedId === p.id}
                  onClick={() => handleSelectPharmacy(p)}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* ══ VUE RECHERCHE PHARMACIES ═══════════════════════════════════ */}
      {activeTab === 'pharmacies' && (
        <div className="flex flex-col flex-1 overflow-hidden gap-3 p-4">
          <div className="shrink-0">
            <SearchBar
              onSearch={handlePharmacySearch}
              loading={pharmacySearchLoading}
              placeholder="Nom, adresse, quartier..."
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {!pharmacySearch || pharmacySearch.trim().length < 2 ? (
              /* Pas encore de recherche → afficher toutes les pharmacies proches */
              <div className="flex flex-col gap-2">
                <p className="text-xs text-gray-400 px-1">
                  Pharmacies à proximité
                </p>
                {pharmaciesLoading ? (
                  <LoadingSpinner size="md" label="Chargement..." />
                ) : pharmacies.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-10 text-center text-gray-400">
                    <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <p className="text-sm">Aucune pharmacie trouvée dans ce rayon</p>
                  </div>
                ) : (
                  pharmacies.map((p) => (
                    <PharmacyCard key={p.id} pharmacy={p} />
                  ))
                )}
              </div>
            ) : pharmacySearchLoading ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : pharmacySearchResults.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center text-gray-400">
                <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium text-gray-600">Aucun résultat pour « {pharmacySearch} »</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-gray-400 px-1">
                  {pharmacySearchResults.length} résultat{pharmacySearchResults.length > 1 ? 's' : ''}
                </p>
                {pharmacySearchResults.map((p) => (
                  <PharmacyCard key={p.id} pharmacy={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ VUE RECHERCHE MÉDICAMENTS ══════════════════════════════════ */}
      {activeTab === 'medications' && (
        <div className="flex flex-col flex-1 overflow-hidden gap-3 p-4">
          <div className="shrink-0">
            <SearchBar
              onSearch={handleMedicationSearch}
              loading={searchLoading}
              placeholder="Médicament, DCI, catégorie..."
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            <SearchResults
              results={searchResults}
              query={searchQuery}
              loading={searchLoading}
            />
          </div>
        </div>
      )}
    </div>
  )
}

const TabButton = ({
  active, onClick, label, icon,
}: {
  active: boolean
  onClick: () => void
  label: string
  icon: string
}) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium
      transition-all duration-200
      ${active
        ? 'bg-green-600 text-white shadow-sm'
        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
      }
    `}
  >
    <span>{icon}</span>
    {label}
  </button>
)

const FilterButton = ({
  active, onClick, label, badge,
}: {
  active: boolean
  onClick: () => void
  label: string
  badge?: React.ReactNode
}) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
      transition-all duration-200
      ${active
        ? 'bg-gray-900 text-white'
        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
      }
    `}
  >
    {label}
    {badge}
  </button>
)