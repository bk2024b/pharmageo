// lib/auth.ts

import { supabase } from '@/lib/supabase'

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

// ─── Inscription via Route Handler (admin client côté serveur) ────────────
export const signUpPharmacist = async (
  payload: SignUpPayload
): Promise<AuthResult> => {
  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const json = await res.json()

    if (!res.ok) {
      return { success: false, error: json.error ?? 'Erreur inscription' }
    }

    // Connecter automatiquement après inscription
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password,
    })

    if (signInError) {
      // Compte créé mais connexion auto échouée → pas bloquant
      console.warn('[signUpPharmacist] auto sign-in failed:', signInError.message)
    }

    return { success: true, error: null }
  } catch (err) {
    return { success: false, error: 'Erreur réseau' }
  }
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

// ─── Session courante ─────────────────────────────────────────────────────
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
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('pharmacist_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return (data as any)?.role === 'admin'
}