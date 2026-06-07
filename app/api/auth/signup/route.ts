// app/api/auth/signup/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, full_name, phone, pharmacy } = body

    if (!email || !password || !full_name || !pharmacy) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      )
    }

    const admin = createSupabaseAdminClient()

    // 1. Créer le user via admin (bypass RLS)
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        phone,
        role: 'pharmacist',
      },
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    const userId = authData.user.id

    // 2. Créer la pharmacie via admin (bypass RLS)
    const { data: pharmacyData, error: pharmacyError } = await admin
      .from('pharmacies')
      .insert({
        name: pharmacy.name,
        address: pharmacy.address,
        phone: pharmacy.phone,
        location: `SRID=4326;POINT(${pharmacy.lng} ${pharmacy.lat})`,
        status: 'pending',
        user_id: userId,
      })
      .select('id')
      .single()

    if (pharmacyError) {
      // Rollback : supprimer le user créé
      await admin.auth.admin.deleteUser(userId)
      return NextResponse.json(
        { error: pharmacyError.message },
        { status: 500 }
      )
    }

    const pharmacyId = (pharmacyData as any).id

    // 3. Lier pharmacy_id au profil (le trigger a déjà créé le profil)
    const { error: profileError } = await admin
      .from('pharmacist_profiles')
      .update({ pharmacy_id: pharmacyId })
      .eq('id', userId)

    if (profileError) {
      console.error('[signup] profile link error:', profileError.message)
      // Non bloquant — le compte est créé
    }

    return NextResponse.json({ success: true, error: null })
  } catch (err) {
    console.error('[POST /api/auth/signup]', err)
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}