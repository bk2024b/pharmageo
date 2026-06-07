// app/api/admin/pharmacies/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase.server'
import { createSupabaseAdminClient } from '@/lib/supabase'

// ── Vérification admin ────────────────────────────────────────────────────
const checkAdmin = async () => {
  const supabaseServer = await createSupabaseServerClient()
  const { data: { user } } = await supabaseServer.auth.getUser()
  if (!user) return null

  const supabase = createSupabaseAdminClient()
  const { data } = await supabase
    .from('pharmacist_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if ((data as any)?.role !== 'admin') return null
  return user
}

// GET → toutes les pharmacies avec filtre status
export async function GET(request: NextRequest) {
  try {
    const admin = await checkAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') ?? 'pending'

    const supabase = createSupabaseAdminClient()

    const { data, error } = await supabase
      .from('pharmacies')
      .select(`
        id,
        name,
        address,
        phone,
        status,
        created_at,
        user_id,
        profile:pharmacist_profiles (
          full_name,
          phone
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: data ?? [], error: null })
  } catch (err) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PATCH → changer le status d'une pharmacie
export async function PATCH(request: NextRequest) {
  try {
    const admin = await checkAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    const { id, status } = body

    if (!id || !['active', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
    }

    const supabase = createSupabaseAdminClient()

    const { error } = await supabase
      .from('pharmacies')
      .update({ status })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, error: null })
  } catch (err) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}