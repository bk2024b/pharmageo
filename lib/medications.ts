// lib/medications.ts

import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase'
import { Medication, PharmacyInventory } from '@/types'

// ─── Recherche full-text sur les médicaments ──────────────────────────────
export const searchMedications = async (
  query: string
): Promise<(Medication & { inventory: PharmacyInventory[] })[]> => {
  const supabase = createSupabaseServerClient()

  if (!query || query.trim().length < 2) return []

  const { data, error } = await supabase
    .from('medications')
    .select(`
      id,
      name,
      dci,
      category,
      otc,
      inventory:pharmacy_inventory (
        pharmacy_id,
        medication_id,
        quantity,
        updated_at
      )
    `)
    .or(`name.ilike.%${query.trim()}%,dci.ilike.%${query.trim()}%`)
    .order('name', { ascending: true })
    .limit(20)

  if (error) {
    console.error('[searchMedications]', error.message)
    return []
  }

  return (data ?? []).map((row: any) => ({
    id: row.id,
    name: row.name,
    dci: row.dci,
    category: row.category,
    otc: row.otc,
    inventory: row.inventory ?? [],
  }))
}

// ─── Médicaments disponibles dans une pharmacie précise ───────────────────
export const getMedicationsByPharmacy = async (
  pharmacyId: string
): Promise<(PharmacyInventory & { medication: Medication })[]> => {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from('pharmacy_inventory')
    .select(`
      pharmacy_id,
      medication_id,
      quantity,
      updated_at,
      medication:medications (
        id,
        name,
        dci,
        category,
        otc
      )
    `)
    .eq('pharmacy_id', pharmacyId)
    .gt('quantity', 0)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('[getMedicationsByPharmacy]', error.message)
    return []
  }

  return (data ?? []).map((row: any) => ({
    pharmacy_id: row.pharmacy_id,
    medication_id: row.medication_id,
    quantity: row.quantity,
    updated_at: row.updated_at,
    medication: row.medication,
  }))
}

// ─── Pharmacies qui ont un médicament donné en stock ──────────────────────
export const getPharmaciesForMedication = async (
  medicationId: string
): Promise<PharmacyInventory[]> => {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from('pharmacy_inventory')
    .select(`
      pharmacy_id,
      medication_id,
      quantity,
      updated_at,
      pharmacy:pharmacies (
        id,
        name,
        address,
        phone,
        location
      )
    `)
    .eq('medication_id', medicationId)
    .gt('quantity', 0)
    .order('quantity', { ascending: false })

  if (error) {
    console.error('[getPharmaciesForMedication]', error.message)
    return []
  }

  return data ?? []
}

// ─── Détail d'un médicament par ID ────────────────────────────────────────
export const getMedicationById = async (
  id: string
): Promise<Medication | null> => {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('[getMedicationById]', error.message)
    return null
  }

  return data
}

// ─── Mettre à jour le stock (admin / pharmacien) ──────────────────────────
export const upsertInventory = async (payload: {
  pharmacy_id: string
  medication_id: string
  quantity: number
}): Promise<boolean> => {
  const supabase = createSupabaseAdminClient()

  const { error } = await supabase
    .from('pharmacy_inventory')
    .upsert(
      {
        pharmacy_id: payload.pharmacy_id,
        medication_id: payload.medication_id,
        quantity: payload.quantity,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'pharmacy_id,medication_id' }
    )

  if (error) {
    console.error('[upsertInventory]', error.message)
    return false
  }

  return true
}

// ─── Créer un médicament (admin) ──────────────────────────────────────────
export const createMedication = async (payload: {
  name: string
  dci?: string
  category?: string
  otc?: boolean
}): Promise<Medication | null> => {
  const supabase = createSupabaseAdminClient()

  const { data, error } = await supabase
    .from('medications')
    .insert({
      name: payload.name,
      dci: payload.dci ?? null,
      category: payload.category ?? null,
      otc: payload.otc ?? true,
    })
    .select()
    .single()

  if (error) {
    console.error('[createMedication]', error.message)
    return null
  }

  return data
}