// app/api/pharmacist/stock/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { createSupabaseServerClient } from '@/lib/supabase.server'
// GET → tous les médicaments avec état stock pour une pharmacie
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pharmacyId = searchParams.get('pharmacy_id')

    if (!pharmacyId) {
      return NextResponse.json({ data: null, error: 'pharmacy_id requis' }, { status: 400 })
    }

    const supabase = createSupabaseAdminClient()

    // Tous les médicaments + état stock de cette pharmacie
    const { data: medications, error } = await supabase
      .from('medications')
      .select('id, name, dci, category, otc')
      .order('name', { ascending: true })

    if (error) {
      return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    }

    const { data: inventory } = await supabase
      .from('pharmacy_inventory')
      .select('medication_id, in_stock')
      .eq('pharmacy_id', pharmacyId)

    const inventoryMap = new Map(
      ((inventory ?? []) as { medication_id: string; in_stock: boolean }[])
        .map((i) => [i.medication_id, i.in_stock])
    )

    const enriched = (medications as any[]).map((med) => ({
      ...med,
      in_stock: inventoryMap.get(med.id) ?? false,
      inventory_exists: inventoryMap.has(med.id),
    }))

    return NextResponse.json({ data: enriched, error: null })
  } catch (err) {
    return NextResponse.json({ data: null, error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST → toggle stock
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pharmacy_id, medication_id, in_stock } = body

    if (!pharmacy_id || !medication_id || typeof in_stock !== 'boolean') {
      return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
    }

    // Vérifier que l'utilisateur connecté possède bien cette pharmacie
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

    // Upsert
    const { error } = await supabase
      .from('pharmacy_inventory')
      .upsert(
        {
          pharmacy_id,
          medication_id,
          in_stock,
          quantity: in_stock ? 1 : 0,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'pharmacy_id,medication_id' }
      )

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, error: null })
  } catch (err) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}