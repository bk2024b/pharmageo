// components/Map/PharmacyMap.tsx

'use client'

import { useEffect, useRef, useState } from 'react'
import { Pharmacy } from '@/types'
import { COTONOU_CENTER } from '@/lib/geo'

type PharmacyMapProps = {
  pharmacies: Pharmacy[]
  userLocation: { lat: number; lng: number } | null
  selectedId?: string | null
  onSelectPharmacy?: (pharmacy: Pharmacy) => void
  className?: string
}

export const PharmacyMap = ({
  pharmacies,
  userLocation,
  selectedId,
  onSelectPharmacy,
  className = '',
}: PharmacyMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<Map<string, any>>(new Map())
  const userMarkerRef = useRef<any>(null)
  const [isReady, setIsReady] = useState(false)

  // ── Init carte (une seule fois) ──────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const initMap = async () => {
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')

      // Fix icônes Leaflet avec Webpack/Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const center = userLocation ?? COTONOU_CENTER

      const map = L.map(mapRef.current!, {
        center: [center.lat, center.lng],
        zoom: 14,
        zoomControl: false,
      })

      // Tuiles OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)

      // Contrôle zoom en bas à droite
      L.control.zoom({ position: 'bottomright' }).addTo(map)

      mapInstanceRef.current = map
      setIsReady(true)
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markersRef.current.clear()
        setIsReady(false)
      }
    }
  }, [])

  // ── Marqueur utilisateur ─────────────────────────────────────────────
  useEffect(() => {
    if (!isReady || !mapInstanceRef.current || !userLocation) return

    const initUserMarker = async () => {
      const L = (await import('leaflet')).default

      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userLocation.lat, userLocation.lng])
        return
      }

      const pulseIcon = L.divIcon({
        className: '',
        html: `
          <div style="position:relative;width:20px;height:20px">
            <div style="
              position:absolute;inset:0;
              background:#3B82F6;
              border-radius:50%;
              border:3px solid white;
              box-shadow:0 0 0 2px #3B82F6;
              z-index:2;
            "></div>
            <div style="
              position:absolute;inset:-6px;
              background:rgba(59,130,246,0.25);
              border-radius:50%;
              animation:pulse 2s ease-out infinite;
            "></div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      })

      userMarkerRef.current = L.marker(
        [userLocation.lat, userLocation.lng],
        { icon: pulseIcon, zIndexOffset: 1000 }
      )
        .addTo(mapInstanceRef.current)
        .bindPopup('<b>Votre position</b>')

      mapInstanceRef.current.setView(
        [userLocation.lat, userLocation.lng],
        15,
        { animate: true }
      )
    }

    initUserMarker()
  }, [isReady, userLocation])

  // ── Marqueurs pharmacies ─────────────────────────────────────────────
  useEffect(() => {
    if (!isReady || !mapInstanceRef.current) return

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default

      const currentIds = new Set(pharmacies.map((p) => p.id))

      // Supprimer les marqueurs obsolètes
      markersRef.current.forEach((marker, id) => {
        if (!currentIds.has(id)) {
          marker.remove()
          markersRef.current.delete(id)
        }
      })

      // Ajouter / mettre à jour
      pharmacies.forEach((pharmacy) => {
        const isSelected = pharmacy.id === selectedId
        const isGuard = pharmacy.is_on_guard

        const icon = L.divIcon({
          className: '',
          html: buildMarkerHtml(isGuard ?? false, isSelected),
          iconSize: [32, 40],
          iconAnchor: [16, 40],
          popupAnchor: [0, -40],
        })

        if (markersRef.current.has(pharmacy.id)) {
          const marker = markersRef.current.get(pharmacy.id)
          marker.setIcon(icon)
        } else {
          const marker = L.marker(
            [pharmacy.location.lat, pharmacy.location.lng],
            { icon }
          )
            .addTo(mapInstanceRef.current)
            .bindPopup(buildPopupHtml(pharmacy))

          marker.on('click', () => {
            onSelectPharmacy?.(pharmacy)
          })

          markersRef.current.set(pharmacy.id, marker)
        }
      })
    }

    updateMarkers()
  }, [isReady, pharmacies, selectedId, onSelectPharmacy])

  // ── Centrer sur la pharmacie sélectionnée ────────────────────────────
  useEffect(() => {
    if (!isReady || !mapInstanceRef.current || !selectedId) return

    const pharmacy = pharmacies.find((p) => p.id === selectedId)
    if (!pharmacy) return

    mapInstanceRef.current.setView(
      [pharmacy.location.lat, pharmacy.location.lng],
      16,
      { animate: true }
    )

    const marker = markersRef.current.get(selectedId)
    if (marker) marker.openPopup()
  }, [isReady, selectedId, pharmacies])

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%   { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>

      <div
        ref={mapRef}
        className={`w-full rounded-xl overflow-hidden ${className}`}
        style={{ minHeight: '400px' }}
      />
    </>
  )
}

// ── Helpers HTML ──────────────────────────────────────────────────────────
const buildMarkerHtml = (isGuard: boolean, isSelected: boolean): string => {
  const bg = isGuard ? '#16A34A' : '#2563EB'
  const border = isSelected ? '#FCD34D' : 'white'
  const size = isSelected ? '36px' : '32px'
  const shadow = isSelected ? '0 0 0 3px #FCD34D' : '0 2px 6px rgba(0,0,0,0.3)'

  return `
    <div style="
      width:${size};height:${size};
      background:${bg};
      border:3px solid ${border};
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      box-shadow:${shadow};
      display:flex;align-items:center;justify-content:center;
      transition:all 0.2s;
    ">
      <div style="transform:rotate(45deg);color:white;font-size:14px">
        ${isGuard ? '🏥' : '💊'}
      </div>
    </div>
  `
}

const buildPopupHtml = (pharmacy: Pharmacy): string => `
  <div style="min-width:160px;font-family:sans-serif">
    <p style="font-weight:600;font-size:13px;margin:0 0 4px">${pharmacy.name}</p>
    <p style="font-size:11px;color:#6B7280;margin:0 0 6px">${pharmacy.address}</p>
    ${pharmacy.is_on_guard
      ? '<span style="font-size:11px;background:#DCFCE7;color:#166534;padding:2px 8px;border-radius:999px;font-weight:500">De garde</span>'
      : ''
    }
    ${pharmacy.distance !== undefined
      ? `<p style="font-size:11px;color:#6B7280;margin:6px 0 0">${pharmacy.distance < 1000 ? pharmacy.distance + ' m' : (pharmacy.distance / 1000).toFixed(1) + ' km'}</p>`
      : ''
    }
    ${pharmacy.phone
      ? `<a href="tel:${pharmacy.phone}" style="display:block;font-size:11px;color:#16A34A;margin-top:4px">${pharmacy.phone}</a>`
      : ''
    }
  </div>
`