// lib/auth.ts

import { supabase } from '@/lib/supabase'
import { createSupabaseServerClient } from '@/lib/supabase'

// ─── Types ────────────────────────────────────────────────────────────────
export type SignUpPayload = {
  email: string
  password: string
  full_name: string
  phone: string
  pharmacy: {
    name: string
    address: string
    phone: string
    lat: number
    lng: number
  }
}

export type SignInPayload = {
  email: string
  password: string
}

export type AuthResult = {
  success: boolean
  error: string | null
}

// ─── Inscription pharmacien ───────────────────────────────────────────────
export const signUpPharmacist = async (
  payload: SignUpPayload
): Promise<AuthResult> => {
  // 1. Créer le compte auth Supabase
  const { data, error: authError } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: {
        full_name: payload.full_name,
        phone: payload.phone,
        role: 'pharmacist',
      },
    },
  })

  if (authError) {
    return { success: false, error: authError.message }
  }

  if (!data.user) {
    return { success: false, error: 'Erreur lors de la création du compte' }
  }

  // 2. Créer la pharmacie avec status pending
  const { data: pharmacy, error: pharmacyError } = await supabase
    .from('pharmacies')
    .insert({
      name: payload.pharmacy.name,
      address: payload.pharmacy.address,
      phone: payload.pharmacy.phone,
      location: `SRID=4326;POINT(${payload.pharmacy.lng} ${payload.pharmacy.lat})`,
      status: 'pending',
      user_id: data.user.id,
    })
    .select('id')
    .single()

  if (pharmacyError) {
    return { success: false, error: pharmacyError.message }
  }

  // 3. Lier la pharmacie au profil
  const { error: profileError } = await supabase
    .from('pharmacist_profiles')
    .update({ pharmacy_id: (pharmacy as any).id })
    .eq('id', data.user.id)

  if (profileError) {
    return { success: false, error: profileError.message }
  }

  return { success: true, error: null }
}

// ─── Connexion ────────────────────────────────────────────────────────────
export const signInPharmacist = async (
  payload: SignInPayload
): Promise<AuthResult> => {
  const { error } = await supabase.auth.signInWithPassword({
    email: payload.email,
    password: payload.password,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, error: null }
}

// ─── Déconnexion ──────────────────────────────────────────────────────────
export const signOut = async (): Promise<void> => {
  await supabase.auth.signOut()
}

// ─── Session courante (client) ────────────────────────────────────────────
export const getSession = async () => {
  const { data } = await supabase.auth.getSession()
  return data.session
}

// ─── Profil + pharmacie du pharmacien connecté ───────────────────────────
export const getMyPharmacy = async () => {
  const { data, error } = await supabase.rpc('get_my_pharmacy')

  if (error) {
    console.error('[getMyPharmacy]', error.message)
    return null
  }

  return data as {
    profile: {
      id: string
      full_name: string
      phone: string
      role: string
      pharmacy_id: string
    }
    pharmacy: {
      id: string
      name: string
      address: string
      phone: string
      status: string
      location: unknown
    } | null
  } | null
}

// ─── Vérifier si admin ────────────────────────────────────────────────────
export const isAdmin = async (): Promise<boolean> => {
  const { data } = await supabase
    .from('pharmacist_profiles')
    .select('role')
    .eq('id', (await supabase.auth.getUser()).data.user?.id ?? '')
    .single()

  return (data as any)?.role === 'admin'
}