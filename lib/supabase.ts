// lib/supabase.ts

import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// ─── Client navigateur avec gestion cookies SSR ───────────────────────────
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// ─── Client admin (server only) ───────────────────────────────────────────
export const createSupabaseAdminClient = () => {
  return createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}