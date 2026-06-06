// components/Map/UserMarker.tsx
// (Composant utilitaire — logique déjà intégrée dans PharmacyMap)
// Exposé séparément pour usage standalone si besoin

'use client'

type UserMarkerProps = {
  lat: number
  lng: number
}

export const UserMarker = ({ lat, lng }: UserMarkerProps) => {
  // Utilisé uniquement comme type/référence
  // La logique de rendu est dans PharmacyMap via divIcon
  return null
}