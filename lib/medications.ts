// lib/medications.ts

import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase'
import type { Medication, PharmacyInventory, MedicationRow, InventoryRow } from '@/types'

// ─── Helper ───────────────────────────────────────────────────────────────
const rowToMedication = (row: MedicationRow): Medication => ({
  id: row.id,
  name: row.name,
  dci: row.dci,
  category: row.category,
  otc: row.otc,
})

// ─── Recherche full-text ──────────────────────────────────────────────────
export const searchMedications = async (
  query: string
): Promise<(Medication & { inventory: InventoryRow[] })[]> => {
  const supabase = await createSupabaseServerClient()

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

  const rows = data as unknown as (MedicationRow & { inventory: InventoryRow[] })[]

  return rows.map((row) => ({
    ...rowToMedication(row),
    inventory: row.inventory ?? [],
  }))
}

// ─── Médicaments d'une pharmacie ──────────────────────────────────────────
export const getMedicationsByPharmacy = async (
  pharmacyId: string
): Promise<(PharmacyInventory & { medication: Medication })[]> => {
  const supabase = await createSupabaseServerClient()

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

  const rows = data as unknown as (InventoryRow & { medication: MedicationRow })[]

  return rows.map((row) => ({
    pharmacy_id: row.pharmacy_id,
    medication_id: row.medication_id,
    quantity: row.quantity,
    updated_at: row.updated_at,
    medication: rowToMedication(row.medication),
  }))
}

// ─── Pharmacies pour un médicament ───────────────────────────────────────
export const getPharmaciesForMedication = async (
  medicationId: string
): Promise<(InventoryRow & { pharmacy: Record<string, unknown> })[]> => {
  const supabase = await createSupabaseServerClient()

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

  return data as unknown as (InventoryRow & { pharmacy: Record<string, unknown> })[]
}

// ─── Médicament par ID ────────────────────────────────────────────────────
export const getMedicationById = async (id: string): Promise<Medication | null> => {
  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase
    .from('medications')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('[getMedicationById]', error.message)
    return null
  }

  return rowToMedication(data as unknown as MedicationRow)
}

// ─── Upsert stock (admin) ─────────────────────────────────────────────────
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

  return rowToMedication(data as unknown as MedicationRow)
}