// types/index.ts

export interface Pharmacy {
  id: string
  name: string
  address: string
  phone: string | null
  location: {
    lat: number
    lng: number
  }
  created_at: string
  distance?: number
  is_on_guard?: boolean
}

export interface GuardSchedule {
  id: string
  pharmacy_id: string
  starts_at: string
  ends_at: string
  pharmacy?: Pharmacy
}

export interface Medication {
  id: string
  name: string
  dci: string | null
  category: string | null
  otc: boolean
}

export interface PharmacyInventory {
  pharmacy_id: string
  medication_id: string
  quantity: number
  updated_at: string
  medication?: Medication
  pharmacy?: Pharmacy
}

// ─── Types enrichis (retours API) ────────────────────────────────────────
export type PharmacyWithGuard = Pharmacy & {
  is_on_guard: boolean
}

export type MedicationResult = Medication & {
  availability: {
    total_pharmacies: number
    in_stock: number
  }
  pharmacies: (PharmacyInventory & {
    pharmacy: Pharmacy & { distance: number | null }
  })[]
}

export type GuardScheduleWithPharmacy = GuardSchedule & {
  pharmacy: Pharmacy
}

// ─── Réponses API ────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    count: number
    query?: string
    fetched_at?: string
    filtered_otc?: boolean
  }
}

export type NearbyPharmaciesResponse = ApiResponse<PharmacyWithGuard[]>

export type GuardPharmaciesResponse = PaginatedResponse<{
  schedule_id: string
  starts_at: string
  ends_at: string
  pharmacy: Pharmacy & { distance: number | null }
}>

export type MedicationSearchResponse = PaginatedResponse<MedicationResult>

// ─── Paramètres ──────────────────────────────────────────────────────────
export interface GeoParams {
  lat: number
  lng: number
  radius?: number
}

export interface SearchParams extends Partial<GeoParams> {
  q: string
  otc?: boolean
}

// ─── UI State ────────────────────────────────────────────────────────────
export type MapView = 'all' | 'guard'

export interface AppState {
  userLocation: { lat: number; lng: number } | null
  selectedPharmacyId: string | null
  mapView: MapView
  searchQuery: string
}