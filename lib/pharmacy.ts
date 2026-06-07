// lib/pharmacy.ts

import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase'
import type { Pharmacy, GuardSchedule, PharmacyRow } from '@/types'
import { DEFAULT_RADIUS_M } from '@/lib/geo'

const parseLocation = (raw: unknown): { lat: number; lng: number } => {
  if (typeof raw === 'object' && raw !== null) {
    const obj = raw as Record<string, unknown>
    if ('coordinates' in obj && Array.isArray(obj.coordinates)) {
      const [lng, lat] = obj.coordinates as number[]
      return { lat, lng }
    }
  }
  return { lat: 0, lng: 0 }
}

const rowToPharmacy = (row: PharmacyRow): Pharmacy => ({
  id: row.id,
  name: row.name,
  address: row.address,
  phone: row.phone,
  location: parseLocation(row.location),
  created_at: row.created_at,
})

// ─── Pharmacies proches ───────────────────────────────────────────────────
export const getNearbyPharmacies = async (
  lat: number,
  lng: number,
  radiusMeters: number = DEFAULT_RADIUS_M
): Promise<Pharmacy[]> => {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase.rpc('get_nearby_pharmacies', {
    user_lat: lat,
    user_lng: lng,
    radius_meters: radiusMeters,
  })

  if (error) {
    console.error('[getNearbyPharmacies]', error.message)
    return []
  }

  const rows = (data ?? []) as unknown as {
    id: string
    name: string
    address: string
    phone: string | null
    lat: number
    lng: number
    created_at: string
    distance_meters: number
  }[]

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    address: row.address,
    phone: row.phone,
    location: { lat: row.lat, lng: row.lng },
    created_at: row.created_at,
    distance: Math.round(row.distance_meters),
    is_on_guard: false,
  }))
}

// ─── Pharmacies de garde ──────────────────────────────────────────────────
export const getGuardPharmacies = async (): Promise<(GuardSchedule & { pharmacy: Pharmacy })[]> => {
  const supabase = await createSupabaseServerClient()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('guard_schedules')
    .select(`
      id,
      pharmacy_id,
      starts_at,
      ends_at,
      pharmacy:pharmacies (
        id,
        name,
        address,
        phone,
        location,
        created_at
      )
    `)
    .lte('starts_at', now)
    .gte('ends_at', now)
    .order('starts_at', { ascending: true })

  if (error) {
    console.error('[getGuardPharmacies]', error.message)
    return []
  }

  // Supabase retourne pharmacy comme tableau sur les jointures — on prend [0]
  const rows = (data ?? []) as unknown as {
    id: string
    pharmacy_id: string
    starts_at: string
    ends_at: string
    pharmacy: PharmacyRow[]
  }[]

  return rows
    .filter((row) => row.pharmacy?.length > 0)
    .map((row) => ({
      id: row.id,
      pharmacy_id: row.pharmacy_id,
      starts_at: row.starts_at,
      ends_at: row.ends_at,
      pharmacy: {
        ...rowToPharmacy(row.pharmacy[0]),
        is_on_guard: true,
      },
    }))
}

// ─── Pharmacie par ID ─────────────────────────────────────────────────────
export const getPharmacyById = async (id: string): Promise<Pharmacy | null> => {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('pharmacies')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('[getPharmacyById]', error.message)
    return null
  }

  return rowToPharmacy(data as unknown as PharmacyRow)
}

// ─── Toutes les pharmacies (admin) ────────────────────────────────────────
export const getAllPharmacies = async (): Promise<Pharmacy[]> => {
  const supabase = createSupabaseAdminClient()

  const { data, error } = await supabase
    .from('pharmacies')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('[getAllPharmacies]', error.message)
    return []
  }

  return (data as unknown as PharmacyRow[]).map(rowToPharmacy)
}

// ─── Créer une pharmacie (admin) ──────────────────────────────────────────
export const createPharmacy = async (payload: {
  name: string
  address: string
  phone?: string
  lat: number
  lng: number
}): Promise<Pharmacy | null> => {
  const supabase = createSupabaseAdminClient()

  const { data, error } = await supabase
    .from('pharmacies')
    .insert({
      name: payload.name,
      address: payload.address,
      phone: payload.phone ?? null,
      location: `SRID=4326;POINT(${payload.lng} ${payload.lat})`,
    })
    .select()
    .single()

  if (error) {
    console.error('[createPharmacy]', error.message)
    return null
  }

  return {
    ...rowToPharmacy(data as unknown as PharmacyRow),
    location: { lat: payload.lat, lng: payload.lng },
  }
}