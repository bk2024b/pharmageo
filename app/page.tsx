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
import { EmptyState } from '@/components/ui/EmptyState'
import type { Pharmacy, PharmacyWithGuard, MedicationResult, MapView } from '@/types'
import { getUserLocation, COTONOU_CENTER } from '@/lib/geo'

const PharmacyMap = dynamic(
  () => import('@/components/Map/PharmacyMap').then((m) => m.PharmacyMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center">
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
  const [mapExpanded, setMapExpanded] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<MedicationResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

  const [pharmacySearch, setPharmacySearch] = useState('')
  const [pharmacySearchResults, setPharmacySearchResults] = useState<PharmacyWithGuard[]>([])
  const [pharmacySearchLoading, setPharmacySearchLoading] = useState(false)

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
        setPharmacies((json.data ?? []).map((item: any) => item.pharmacy))
      } else {
        setPharmacies(json.data ?? [])
      }
    } catch (err) {
      console.error('[fetchPharmacies]', err)
    } finally {
      setPharmaciesLoading(false)
    }
  }

  const handleMedicationSearch = useCallback(async (query: string) => {
    setSearchQuery(query)
    if (!query || query.trim().length < 2) { setSearchResults([]); return }
    setSearchLoading(true)
    try {
      const coords = userLocation ?? COTONOU_CENTER
      const res = await fetch(
        `/api/medications/search?q=${encodeURIComponent(query)}&lat=${coords.lat}&lng=${coords.lng}`
      )
      const json = await res.json()
      setSearchResults(json.data ?? [])
    } catch (err) {
      console.error(err)
    } finally {
      setSearchLoading(false)
    }
  }, [userLocation])

  const handlePharmacySearch = useCallback(async (query: string) => {
    setPharmacySearch(query)
    if (!query || query.trim().length < 2) { setPharmacySearchResults([]); return }
    setPharmacySearchLoading(true)
    try {
      const coords = userLocation ?? COTONOU_CENTER
      const res = await fetch(
        `/api/pharmacies/search?q=${encodeURIComponent(query)}&lat=${coords.lat}&lng=${coords.lng}`
      )
      const json = await res.json()
      setPharmacySearchResults(json.data ?? [])
    } catch (err) {
      console.error(err)
    } finally {
      setPharmacySearchLoading(false)
    }
  }, [userLocation])

  const handleSelectPharmacy = useCallback((pharmacy: Pharmacy) => {
    setSelectedId((prev) => (prev === pharmacy.id ? null : pharmacy.id))
    setMapExpanded(false)
  }, [])

  return (
    <div className="flex flex-col h-dvh bg-gray-50 overflow-hidden">

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-100 shrink-0 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-600">
            <span className="text-white text-base">💊</span>
          </div>
          <span className="text-base font-bold text-gray-900">PharmaGéo</span>
        </div>

        <div className="flex items-center gap-2">
          {locationError && (
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              📍 Approx.
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
                  <Link href="/pharmacie/login" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50">
                    <span>🏥</span> Espace pharmacie
                  </Link>
                  <Link href="/pharmacie/inscription" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100">
                    <span>➕</span> Inscrire ma pharmacie
                  </Link>
                  <Link href="/admin/login" onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-gray-500 hover:bg-gray-50 border-t border-gray-100">
                    <span>⚙️</span> Administration
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ══ VUE CARTE ══════════════════════════════════════════════════ */}
      {activeTab === 'map' && (
        <div className="flex flex-col flex-1 overflow-hidden">

          {/* Filtres */}
          <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-100 shrink-0">
            <FilterButton active={mapView === 'all'} onClick={() => setMapView('all')} label="Toutes" />
            <FilterButton
              active={mapView === 'guard'}
              onClick={() => setMapView('guard')}
              label="De garde"
              badge={<GuardBadge compact />}
            />
            {pharmaciesLoading && <div className="ml-auto"><LoadingSpinner size="sm" label="" /></div>}
          </div>

          {/* Carte */}
          <div
            className={`relative shrink-0 transition-all duration-300 ${
              mapExpanded ? 'h-[65dvh]' : 'h-[42dvh]'
            }`}
          >
            <PharmacyMap
              pharmacies={pharmacies}
              userLocation={userLocation}
              selectedId={selectedId}
              onSelectPharmacy={handleSelectPharmacy}
              className="h-full w-full"
            />

            <button
              onClick={() => setMapExpanded((prev) => !prev)}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white shadow-md border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-all z-10"
            >
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${mapExpanded ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              {mapExpanded ? 'Réduire' : 'Agrandir'}
            </button>
          </div>

          {/* Liste pharmacies */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex justify-center py-2 bg-white border-b border-gray-100 shrink-0">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            <div className="flex flex-col gap-2 px-4 py-3">
              {pharmaciesLoading ? (
                <div className="flex flex-col gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : pharmacies.length === 0 ? (
                <EmptyState
                  type={mapView === 'guard' ? 'guard' : 'pharmacy'}
                  title={mapView === 'guard' ? 'Aucune pharmacie de garde' : 'Aucune pharmacie trouvée'}
                  subtitle={
                    mapView === 'guard'
                      ? "Aucune pharmacie n'est en service de garde en ce moment."
                      : 'Essayez d\'élargir le rayon ou vérifiez votre position.'
                  }
                />
              ) : (
                <>
                  <p className="text-xs text-gray-400">
                    {pharmacies.length} pharmacie{pharmacies.length > 1 ? 's' : ''} trouvée{pharmacies.length > 1 ? 's' : ''}
                  </p>
                  {pharmacies.map((p) => (
                    <PharmacyCard
                      key={p.id}
                      pharmacy={p}
                      selected={selectedId === p.id}
                      onClick={() => handleSelectPharmacy(p)}
                    />
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══ VUE RECHERCHE PHARMACIES ═══════════════════════════════════ */}
      {activeTab === 'pharmacies' && (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="px-4 py-3 bg-white border-b border-gray-100 shrink-0">
            <SearchBar
              onSearch={handlePharmacySearch}
              loading={pharmacySearchLoading}
              placeholder="Nom, adresse, quartier..."
            />
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3">
            {!pharmacySearch || pharmacySearch.trim().length < 2 ? (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-gray-400">Pharmacies à proximité</p>
                {pharmaciesLoading ? (
                  <div className="flex flex-col gap-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
                    ))}
                  </div>
                ) : pharmacies.length === 0 ? (
                  <EmptyState
                    type="pharmacy"
                    title="Aucune pharmacie trouvée"
                    subtitle="Aucune pharmacie active n'a été trouvée dans votre rayon."
                  />
                ) : (
                  pharmacies.map((p) => <PharmacyCard key={p.id} pharmacy={p} />)
                )}
              </div>
            ) : pharmacySearchLoading ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : pharmacySearchResults.length === 0 ? (
              <EmptyState
                type="search"
                title={`Aucun résultat pour « ${pharmacySearch} »`}
                subtitle="Vérifiez l'orthographe ou essayez un autre nom de quartier."
              />
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-gray-400">
                  {pharmacySearchResults.length} résultat{pharmacySearchResults.length > 1 ? 's' : ''}
                </p>
                {pharmacySearchResults.map((p) => <PharmacyCard key={p.id} pharmacy={p} />)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ VUE RECHERCHE MÉDICAMENTS ══════════════════════════════════ */}
      {activeTab === 'medications' && (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="px-4 py-3 bg-white border-b border-gray-100 shrink-0">
            <SearchBar
              onSearch={handleMedicationSearch}
              loading={searchLoading}
              placeholder="Médicament, DCI, catégorie..."
            />
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3">
            <SearchResults
              results={searchResults}
              query={searchQuery}
              loading={searchLoading}
            />
          </div>
        </div>
      )}

      {/* ── Bottom nav ────────────────────────────────────────────────── */}
      <nav className="flex items-center bg-white border-t border-gray-200 shrink-0 pb-[env(safe-area-inset-bottom)]">
        <BottomNavBtn
          active={activeTab === 'map'}
          onClick={() => setActiveTab('map')}
          icon="🗺️"
          label="Carte"
        />
        <BottomNavBtn
          active={activeTab === 'pharmacies'}
          onClick={() => setActiveTab('pharmacies')}
          icon="🏥"
          label="Pharmacies"
        />
        <BottomNavBtn
          active={activeTab === 'medications'}
          onClick={() => setActiveTab('medications')}
          icon="💊"
          label="Médicaments"
        />
      </nav>
    </div>
  )
}

// ── Composants locaux ─────────────────────────────────────────────────────
const FilterButton = ({
  active, onClick, label, badge,
}: {
  active: boolean; onClick: () => void; label: string; badge?: React.ReactNode
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

const BottomNavBtn = ({
  active, onClick, icon, label,
}: {
  active: boolean; onClick: () => void; icon: string; label: string
}) => (
  <button
    onClick={onClick}
    className={`
      flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium
      transition-colors duration-200
      ${active ? 'text-green-600' : 'text-gray-400'}
    `}
  >
    <span className="text-lg leading-none">{icon}</span>
    <span>{label}</span>
  </button>
)