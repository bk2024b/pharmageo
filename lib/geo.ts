// lib/geo.ts

import { Pharmacy } from '@/types'

// ─── Constantes ────────────────────────────────────────────────────────────
const EARTH_RADIUS_KM = 6371
const DEFAULT_RADIUS_M = 5000    // 5km par défaut

// ─── Haversine : distance entre deux points GPS (en mètres) ───────────────
export const haversineDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const toRad = (deg: number) => (deg * Math.PI) / 180

  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return EARTH_RADIUS_KM * c * 1000  // résultat en mètres
}

// ─── Formatage lisible de la distance ─────────────────────────────────────
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`
  }
  return `${(meters / 1000).toFixed(1)} km`
}

// ─── Obtenir la position de l'utilisateur (browser) ───────────────────────
export const getUserLocation = (): Promise<GeolocationCoordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Géolocalisation non supportée par ce navigateur'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position.coords),
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('Permission de géolocalisation refusée'))
            break
          case error.POSITION_UNAVAILABLE:
            reject(new Error('Position indisponible'))
            break
          case error.TIMEOUT:
            reject(new Error('Délai de géolocalisation dépassé'))
            break
          default:
            reject(new Error('Erreur de géolocalisation inconnue'))
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,        // cache 1 minute
      }
    )
  })
}

// ─── Trier les pharmacies par distance croissante ─────────────────────────
export const sortByDistance = (
  pharmacies: Pharmacy[],
  userLat: number,
  userLng: number
): Pharmacy[] => {
  return pharmacies
    .map((p) => ({
      ...p,
      distance: haversineDistance(userLat, userLng, p.location.lat, p.location.lng),
    }))
    .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
}

// ─── Filtrer par rayon ────────────────────────────────────────────────────
export const filterByRadius = (
  pharmacies: Pharmacy[],
  userLat: number,
  userLng: number,
  radiusMeters: number = DEFAULT_RADIUS_M
): Pharmacy[] => {
  return pharmacies.filter((p) => {
    const dist = haversineDistance(userLat, userLng, p.location.lat, p.location.lng)
    return dist <= radiusMeters
  })
}

// ─── Valider des coordonnées GPS ──────────────────────────────────────────
export const isValidCoords = (lat: number, lng: number): boolean => {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180 &&
    !isNaN(lat) && !isNaN(lng)
  )
}

// ─── Coordonnées par défaut : Cotonou centre ─────────────────────────────
export const COTONOU_CENTER = {
  lat: 6.3654,
  lng: 2.4183,
} as const

export { DEFAULT_RADIUS_M }