// app/api/pharmacies/search/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { isValidCoords, haversineDistance } from '@/lib/geo'
import type { PharmacyRow } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const latParam = searchParams.get('lat')
    const lngParam = searchParams.get('lng')

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { data: null, error: 'Paramètre q requis (minimum 2 caractères)' },
        { status: 400 }
      )
    }

    let userLat: number | null = null
    let userLng: number | null = null

    if (latParam && lngParam) {
      const lat = parseFloat(latParam)
      const lng = parseFloat(lngParam)
      if (isValidCoords(lat, lng)) {
        userLat = lat
        userLng = lng
      }
    }

    const supabase = createSupabaseAdminClient()

    const { data, error } = await supabase
      .from('pharmacies')
      .select('id, name, address, phone, location, created_at, status')
      .eq('status', 'active')
      .or(`name.ilike.%${query.trim()}%,address.ilike.%${query.trim()}%`)
      .order('name', { ascending: true })
      .limit(20)

    if (error) {
      return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    }

    const rows = (data ?? []) as unknown as (PharmacyRow & { status: string })[]

    const enriched = rows.map((row) => {
      // Parser location PostGIS
      const loc = row.location as any
      let lat = 0
      let lng = 0
      if (loc?.coordinates) {
        lng = loc.coordinates[0]
        lat = loc.coordinates[1]
      }

      const distance =
        userLat !== null && userLng !== null
          ? Math.round(haversineDistance(userLat, userLng, lat, lng))
          : undefined

      return {
        id: row.id,
        name: row.name,
        address: row.address,
        phone: row.phone,
        location: { lat, lng },
        created_at: row.created_at,
        distance,
        is_on_guard: false,
      }
    })

    // Trier par distance si dispo
    const sorted = userLat !== null
      ? enriched.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0))
      : enriched

    return NextResponse.json({
      data: sorted,
      error: null,
      meta: { count: sorted.length, query: query.trim() },
    })
  } catch (err) {
    return NextResponse.json({ data: null, error: 'Erreur serveur' }, { status: 500 })
  }
}