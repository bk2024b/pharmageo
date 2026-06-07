// app/api/pharmacist/guard/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase'

// GET → créneaux de garde d'une pharmacie
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pharmacyId = searchParams.get('pharmacy_id')

    if (!pharmacyId) {
      return NextResponse.json({ data: null, error: 'pharmacy_id requis' }, { status: 400 })
    }

    const supabase = createSupabaseAdminClient()
    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from('guard_schedules')
      .select('id, starts_at, ends_at')
      .eq('pharmacy_id', pharmacyId)
      .gte('ends_at', now)
      .order('starts_at', { ascending: true })

    if (error) {
      return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    }

    const slots = (data as any[]).map((row) => ({
      id: row.id,
      starts_at: row.starts_at,
      ends_at: row.ends_at,
      is_active:
        new Date(row.starts_at) <= new Date() &&
        new Date(row.ends_at) >= new Date(),
    }))

    return NextResponse.json({ data: slots, error: null })
  } catch (err) {
    return NextResponse.json({ data: null, error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST → ajouter un créneau
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pharmacy_id, starts_at, ends_at } = body

    if (!pharmacy_id || !starts_at || !ends_at) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    if (new Date(ends_at) <= new Date(starts_at)) {
      return NextResponse.json({ error: 'La date de fin doit être après le début' }, { status: 400 })
    }

    // Vérifier que le user possède la pharmacie
    const supabaseServer = await createSupabaseServerClient()
    const { data: { user } } = await supabaseServer.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const supabase = createSupabaseAdminClient()

    const { data: pharmacy } = await supabase
      .from('pharmacies')
      .select('id')
      .eq('id', pharmacy_id)
      .eq('user_id', user.id)
      .single()

    if (!pharmacy) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('guard_schedules')
      .insert({ pharmacy_id, starts_at, ends_at })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data, error: null })
  } catch (err) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE → supprimer un créneau
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id requis' }, { status: 400 })
    }

    const supabaseServer = await createSupabaseServerClient()
    const { data: { user } } = await supabaseServer.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const supabase = createSupabaseAdminClient()

    // Vérifier ownership via jointure
    const { data: slot } = await supabase
      .from('guard_schedules')
      .select('id, pharmacy:pharmacies(user_id)')
      .eq('id', id)
      .single()

    const pharmacyData = slot?.pharmacy as unknown as { user_id: string } | null
    if (!slot || pharmacyData?.user_id !== user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const { error } = await supabase
      .from('guard_schedules')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, error: null })
  } catch (err) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}