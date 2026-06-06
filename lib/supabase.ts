// lib/supabase.ts

import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// ─── Types Supabase générés depuis le schéma ───────────────────────────────
export type Database = {
  public: {
    Tables: {
      pharmacies: {
        Row: {
          id: string
          name: string
          address: string
          phone: string | null
          location: unknown        // type PostGIS geography
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['pharmacies']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['pharmacies']['Insert']>
      }
      guard_schedules: {
        Row: {
          id: string
          pharmacy_id: string
          starts_at: string
          ends_at: string
        }
        Insert: Omit<Database['public']['Tables']['guard_schedules']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['guard_schedules']['Insert']>
      }
      medications: {
        Row: {
          id: string
          name: string
          dci: string | null
          category: string | null
          otc: boolean
        }
        Insert: Omit<Database['public']['Tables']['medications']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['medications']['Insert']>
      }
      pharmacy_inventory: {
        Row: {
          pharmacy_id: string
          medication_id: string
          quantity: number
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['pharmacy_inventory']['Row'], 'updated_at'>
        Update: Partial<Database['public']['Tables']['pharmacy_inventory']['Insert']>
      }
    }
  }
}

// ─── Client côté navigateur (composants client) ────────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// ─── Client côté serveur (Server Components, Route Handlers) ───────────────
export const createSupabaseServerClient = () => {
  const cookieStore = cookies()

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options)
        })
      },
    },
  })
}

// ─── Client admin (service role — uniquement dans les route handlers) ───────
export const createSupabaseAdminClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}