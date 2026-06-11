// types/index.ts

// ─── Types base de données (raw Supabase) ─────────────────────────────────
export type PharmacyRow = {
  id: string
  name: string
  address: string
  phone: string | null
  location: unknown
  created_at: string
}

export type GuardScheduleRow = {
  id: string
  pharmacy_id: string
  starts_at: string
  ends_at: string
}

export type MedicationRow = {
  id: string
  name: string
  dci: string | null
  category: string | null
  otc: boolean
}

export type InventoryRow = {
  pharmacy_id: string
  medication_id: string
  quantity: number
  updated_at: string
  in_stock: boolean
}

// ─── Types applicatifs ────────────────────────────────────────────────────
export type Location = {
  lat: number
  lng: number
}

export interface Pharmacy {
  id: string
  name: string
  address: string
  phone: string | null
  location: Location
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
  in_stock: boolean
  medication?: Medication
  pharmacy?: Pharmacy
}

// ─── Types enrichis ───────────────────────────────────────────────────────
export type PharmacyWithGuard = Pharmacy & {
  is_on_guard: boolean
}

export type MedicationResult = Medication & {
  availability: {
    total_pharmacies: number
    in_stock: number
  }
  pharmacies: (InventoryRow & {
    pharmacy: Pharmacy & { distance: number | null }
  })[]
}

export type GuardScheduleWithPharmacy = GuardSchedule & {
  pharmacy: Pharmacy
}

// ─── Réponses API ─────────────────────────────────────────────────────────
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
export type GuardPharmaciesResponse = PaginatedResponse<GuardScheduleWithPharmacy>
export type MedicationSearchResponse = PaginatedResponse<MedicationResult>

// ─── Paramètres ───────────────────────────────────────────────────────────
export interface GeoParams {
  lat: number
  lng: number
  radius?: number
}

export interface SearchParams extends Partial<GeoParams> {
  q: string
  otc?: boolean
}

// ─── UI ───────────────────────────────────────────────────────────────────
export type MapView = 'all' | 'guard'

export interface AppState {
  userLocation: Location | null
  selectedPharmacyId: string | null
  mapView: MapView
  searchQuery: string
}