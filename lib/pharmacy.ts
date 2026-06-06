// lib/pharmacy.ts

import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase'
import { Pharmacy, GuardSchedule } from '@/types'
import { DEFAULT_RADIUS_M } from '@/lib/geo'

// ─── Helper : parser la geography PostGIS → { lat, lng } ──────────────────
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

// ─── Pharmacies proches (PostGIS ST_DWithin) ───────────────────────────────
export const getNearbyPharmacies = async (
  lat: number,
  lng: number,
  radiusMeters: number = DEFAULT_RADIUS_M
): Promise<Pharmacy[]> => {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase.rpc('get_nearby_pharmacies', {
    user_lat: lat,
    user_lng: lng,
    radius_meters: radiusMeters,
  })

  if (error) {
    console.error('[getNearbyPharmacies]', error.message)
    return []
  }

  return (data ?? []).map((row: any) => ({
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

// ─── Pharmacies de garde actives en ce moment ─────────────────────────────
export const getGuardPharmacies = async (): Promise<(GuardSchedule & { pharmacy: Pharmacy })[]> => {
  const supabase = createSupabaseServerClient()
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

  return (data ?? []).map((row: any) => ({
    id: row.id,
    pharmacy_id: row.pharmacy_id,
    starts_at: row.starts_at,
    ends_at: row.ends_at,
    pharmacy: {
      ...row.pharmacy,
      location: parseLocation(row.pharmacy.location),
      is_on_guard: true,
    },
  }))
}

// ─── Détail d'une pharmacie par ID ────────────────────────────────────────
export const getPharmacyById = async (id: string): Promise<Pharmacy | null> => {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from('pharmacies')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('[getPharmacyById]', error.message)
    return null
  }

  return {
    ...data,
    location: parseLocation(data.location),
  }
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

  return (data ?? []).map((row) => ({
    ...row,
    location: parseLocation(row.location),
  }))
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
    ...data,
    location: { lat: payload.lat, lng: payload.lng },
  }
}