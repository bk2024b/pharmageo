// app/api/admin/medications/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase.server'
import { createSupabaseAdminClient } from '@/lib/supabase'

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

// GET → tous les médicaments
export async function GET() {
  try {
    const admin = await checkAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const supabase = createSupabaseAdminClient()

    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data: data ?? [], error: null })
  } catch (err) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST → créer un médicament
export async function POST(request: NextRequest) {
  try {
    const admin = await checkAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    const { name, dci, category, otc } = body

    if (!name) {
      return NextResponse.json({ error: 'Nom requis' }, { status: 400 })
    }

    const supabase = createSupabaseAdminClient()

    const { data, error } = await supabase
      .from('medications')
      .insert({
        name: name.trim(),
        dci: dci?.trim() ?? null,
        category: category?.trim() ?? null,
        otc: otc ?? true,
      })
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

// PATCH → modifier un médicament
export async function PATCH(request: NextRequest) {
  try {
    const admin = await checkAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    const { id, name, dci, category, otc } = body

    if (!id) {
      return NextResponse.json({ error: 'id requis' }, { status: 400 })
    }

    const supabase = createSupabaseAdminClient()

    const { error } = await supabase
      .from('medications')
      .update({
        name: name?.trim(),
        dci: dci?.trim() ?? null,
        category: category?.trim() ?? null,
        otc,
      })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, error: null })
  } catch (err) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE → supprimer un médicament
export async function DELETE(request: NextRequest) {
  try {
    const admin = await checkAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id requis' }, { status: 400 })
    }

    const supabase = createSupabaseAdminClient()

    const { error } = await supabase
      .from('medications')
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