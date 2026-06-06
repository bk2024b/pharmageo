// app/api/pharmacies/nearby/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getNearbyPharmacies, getGuardPharmacies } from '@/lib/pharmacy'
import { isValidCoords, DEFAULT_RADIUS_M } from '@/lib/geo'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // ─── Lecture et validation des paramètres ────────────────────────────
    const latParam = searchParams.get('lat')
    const lngParam = searchParams.get('lng')
    const radiusParam = searchParams.get('radius')

    if (!latParam || !lngParam) {
      return NextResponse.json(
        { data: null, error: 'Paramètres lat et lng requis' },
        { status: 400 }
      )
    }

    const lat = parseFloat(latParam)
    const lng = parseFloat(lngParam)
    const radius = radiusParam ? parseInt(radiusParam) : DEFAULT_RADIUS_M

    if (!isValidCoords(lat, lng)) {
      return NextResponse.json(
        { data: null, error: 'Coordonnées GPS invalides' },
        { status: 400 }
      )
    }

    if (radius < 100 || radius > 50000) {
      return NextResponse.json(
        { data: null, error: 'Rayon doit être entre 100m et 50km' },
        { status: 400 }
      )
    }

    // ─── Requêtes en parallèle ───────────────────────────────────────────
    const [pharmacies, guardSchedules] = await Promise.all([
      getNearbyPharmacies(lat, lng, radius),
      getGuardPharmacies(),
    ])

    // ─── Injecter is_on_guard sur chaque pharmacie ───────────────────────
    const guardIds = new Set(guardSchedules.map((g) => g.pharmacy_id))

    const enriched = pharmacies.map((p) => ({
      ...p,
      is_on_guard: guardIds.has(p.id),
    }))

    return NextResponse.json(
      { data: enriched, error: null },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    )
  } catch (err) {
    console.error('[GET /api/pharmacies/nearby]', err)
    return NextResponse.json(
      { data: null, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}