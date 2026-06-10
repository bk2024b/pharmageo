// app/page.tsx

'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { GovHeader } from '@/components/Layout/GovHeader'
import { PharmacyCard } from '@/components/Pharmacy/PharmacyCard'
import { SearchBar } from '@/components/Search/SearchBar'
import { SearchResults } from '@/components/Search/SearchResults'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { Pharmacy, PharmacyWithGuard, MedicationResult, MapView } from '@/types'
import { getUserLocation, COTONOU_CENTER } from '@/lib/geo'

const PharmacyMap = dynamic(
  () => import('@/components/Map/PharmacyMap').then((m) => m.PharmacyMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-[var(--color-bg)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--color-border)] border-t-[var(--benin-green)] animate-spin" />
          <p className="text-xs text-[var(--color-text-muted)] font-medium">Chargement de la carte...</p>
        </div>
      </div>
    ),
  }
)

type ActiveTab = 'map' | 'pharmacies' | 'medications'

export default function HomePage() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [pharmacies, setPharmacies] = useState<PharmacyWithGuard[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mapView, setMapView] = useState<MapView>('all')
  const [locationError, setLocationError] = useState<string | null>(null)
  const [pharmaciesLoading, setPharmaciesLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<ActiveTab>('map')
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
      const endpoint = view === 'guard'
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
      console.error(err)
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
      const res = await fetch(`/api/medications/search?q=${encodeURIComponent(query)}&lat=${coords.lat}&lng=${coords.lng}`)
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
      const res = await fetch(`/api/pharmacies/search?q=${encodeURIComponent(query)}&lat=${coords.lat}&lng=${coords.lng}`)
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

  const guardCount = pharmacies.filter((p) => p.is_on_guard).length

  return (
    <div className="flex flex-col h-dvh bg-[var(--color-bg)] overflow-hidden">

      {/* ── Header gouvernemental ─────────────────────────────────── */}
      <GovHeader />

      {/* ── Bandeau info localisation ─────────────────────────────── */}
      {locationError && (
        <div className="flex items-center gap-2 px-4 py-2 bg-[#FEF3C7] border-b border-[#FCD34D] shrink-0">
          <svg className="w-3.5 h-3.5 text-[#92400E] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-[11px] text-[#92400E] font-medium">
            Position approximative — activez la géolocalisation pour des résultats précis
          </p>
        </div>
      )}

      {/* ── Navigation tabs ───────────────────────────────────────── */}
      <div className="flex items-center bg-white border-b border-[var(--color-border)] shrink-0 overflow-x-auto">
        <GovTab
          active={activeTab === 'map'}
          onClick={() => setActiveTab('map')}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          }
          label="Carte"
        />
        <GovTab
          active={activeTab === 'pharmacies'}
          onClick={() => setActiveTab('pharmacies')}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          label="Pharmacies"
        />
        <GovTab
          active={activeTab === 'medications'}
          onClick={() => setActiveTab('medications')}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          label="Médicaments"
        />
      </div>

      {/* ══ VUE CARTE ══════════════════════════════════════════════ */}
      {activeTab === 'map' && (
        <div className="flex flex-col flex-1 overflow-hidden">

          {/* Barre filtres */}
          <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-[var(--color-border)] shrink-0">
            <GovFilterBtn
              active={mapView === 'all'}
              onClick={() => setMapView('all')}
              label="Toutes"
            />
            <GovFilterBtn
              active={mapView === 'guard'}
              onClick={() => setMapView('guard')}
              label="De garde"
              badge={
                guardCount > 0 ? (
                  <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-[var(--benin-green)] text-white text-[10px] font-bold">
                    {guardCount}
                  </span>
                ) : (
                  <span className="ml-1 w-2 h-2 rounded-full bg-[var(--benin-green)] animate-pulse inline-block" />
                )
              }
            />
            {pharmaciesLoading && (
              <div className="ml-auto flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full border border-[var(--color-border)] border-t-[var(--benin-green)] animate-spin" />
                <span className="text-[10px] text-[var(--color-text-muted)]">Recherche...</span>
              </div>
            )}
          </div>

          {/* Carte */}
          <div className={`relative shrink-0 transition-all duration-300 ${mapExpanded ? 'h-[65dvh]' : 'h-[42dvh]'}`}>
            <PharmacyMap
              pharmacies={pharmacies}
              userLocation={userLocation}
              selectedId={selectedId}
              onSelectPharmacy={handleSelectPharmacy}
              className="h-full w-full"
            />

            {/* Bouton expand */}
            <button
              onClick={() => setMapExpanded((prev) => !prev)}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[var(--color-border)] shadow-[var(--shadow-gov)] text-xs font-semibold text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-all z-10 rounded"
            >
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${mapExpanded ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              {mapExpanded ? 'Réduire la carte' : 'Agrandir la carte'}
            </button>
          </div>

          {/* Liste pharmacies */}
          <div className="flex-1 overflow-y-auto">
            {/* Handle + compteur */}
            <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-[var(--color-border)] sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 rounded-full bg-[var(--color-border)]" />
              </div>
              {!pharmaciesLoading && pharmacies.length > 0 && (
                <span className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
                  {pharmacies.length} résultat{pharmacies.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2 px-4 py-3">
              {pharmaciesLoading ? (
                <PharmacySkeleton />
              ) : pharmacies.length === 0 ? (
                <EmptyState
                  message={mapView === 'guard'
                    ? 'Aucune pharmacie de garde en ce moment'
                    : 'Aucune pharmacie trouvée dans un rayon de 5 km'
                  }
                />
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
        </div>
      )}

      {/* ══ VUE PHARMACIES ════════════════════════════════════════ */}
      {activeTab === 'pharmacies' && (
        <div className="flex flex-col flex-1 overflow-hidden">

          {/* Barre recherche */}
          <div className="px-4 py-3 bg-white border-b border-[var(--color-border)] shrink-0">
            <SearchBar
              onSearch={handlePharmacySearch}
              loading={pharmacySearchLoading}
              placeholder="Rechercher par nom ou adresse..."
            />
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3">
            {!pharmacySearch || pharmacySearch.trim().length < 2 ? (
              <>
                <SectionLabel label="Pharmacies à proximité" count={pharmacies.length} />
                <div className="flex flex-col gap-2 mt-2">
                  {pharmaciesLoading ? (
                    <PharmacySkeleton />
                  ) : pharmacies.length === 0 ? (
                    <EmptyState message="Aucune pharmacie trouvée dans ce rayon" />
                  ) : (
                    pharmacies.map((p) => <PharmacyCard key={p.id} pharmacy={p} />)
                  )}
                </div>
              </>
            ) : pharmacySearchLoading ? (
              <PharmacySkeleton />
            ) : pharmacySearchResults.length === 0 ? (
              <EmptyState message={`Aucun résultat pour « ${pharmacySearch} »`} />
            ) : (
              <>
                <SectionLabel label="Résultats de recherche" count={pharmacySearchResults.length} />
                <div className="flex flex-col gap-2 mt-2">
                  {pharmacySearchResults.map((p) => <PharmacyCard key={p.id} pharmacy={p} />)}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ══ VUE MÉDICAMENTS ═══════════════════════════════════════ */}
      {activeTab === 'medications' && (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="px-4 py-3 bg-white border-b border-[var(--color-border)] shrink-0">
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

      {/* ── Bottom navigation ─────────────────────────────────────── */}
      <nav className="gov-bottom-nav">
        <BottomNavBtn
          active={activeTab === 'map'}
          onClick={() => setActiveTab('map')}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          }
          label="Carte"
        />
        <BottomNavBtn
          active={activeTab === 'pharmacies'}
          onClick={() => setActiveTab('pharmacies')}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          label="Pharmacies"
        />
        <BottomNavBtn
          active={activeTab === 'medications'}
          onClick={() => setActiveTab('medications')}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
          label="Médicaments"
        />
      </nav>
    </div>
  )
}

// ── Sous-composants ───────────────────────────────────────────────────
const GovTab = ({
  active, onClick, icon, label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) => (
  <button
    onClick={onClick}
    className={`gov-tab ${active ? 'active' : ''}`}
  >
    {icon}
    {label}
  </button>
)

const GovFilterBtn = ({
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
      inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold
      border rounded transition-all duration-150
      ${active
        ? 'bg-[var(--benin-green)] text-white border-[var(--benin-green)]'
        : 'bg-white text-[var(--color-text-muted)] border-[var(--color-border)] hover:border-[var(--benin-green)] hover:text-[var(--benin-green)]'
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
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) => (
  <button
    onClick={onClick}
    className={`gov-bottom-nav-btn ${active ? 'active' : ''}`}
  >
    <span className="nav-icon-wrap">
      {icon}
    </span>
    {label}
  </button>
)

const SectionLabel = ({ label, count }: { label: string; count: number }) => (
  <div className="flex items-center justify-between mb-1">
    <span className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
      {label}
    </span>
    {count > 0 && (
      <span className="text-[10px] font-semibold text-[var(--color-text-muted)]">
        {count} résultat{count > 1 ? 's' : ''}
      </span>
    )}
  </div>
)

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center gap-3 py-12 text-center">
    <div className="flex items-center justify-center w-12 h-12 rounded bg-[var(--color-bg)] border border-[var(--color-border)]">
      <svg className="w-6 h-6 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    </div>
    <p className="text-sm text-[var(--color-text-muted)] max-w-[200px]">{message}</p>
  </div>
)

const PharmacySkeleton = () => (
  <div className="flex flex-col gap-2">
    {[1, 2, 3].map((i) => (
      <div key={i} className="gov-card p-4 flex flex-col gap-2">
        <div className="gov-skeleton h-4 w-3/4" />
        <div className="gov-skeleton h-3 w-1/2" />
        <div className="flex gap-2 mt-1">
          <div className="gov-skeleton h-5 w-16" />
          <div className="gov-skeleton h-5 w-12" />
        </div>
      </div>
    ))}
  </div>
)