// app/api/pharmacies/guard/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getGuardPharmacies } from '@/lib/pharmacy'
import { isValidCoords } from '@/lib/geo'
import { haversineDistance } from '@/lib/geo'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // ─── Paramètres optionnels (pour trier par distance) ─────────────────
    const latParam = searchParams.get('lat')
    const lngParam = searchParams.get('lng')

    let userLat: number | null = null
    let userLng: number | null = null

    if (latParam && lngParam) {
      const lat = parseFloat(latParam)
      const lng = parseFloat(lngParam)

      if (!isValidCoords(lat, lng)) {
        return NextResponse.json(
          { data: null, error: 'Coordonnées GPS invalides' },
          { status: 400 }
        )
      }

      userLat = lat
      userLng = lng
    }

    // ─── Récupérer les pharmacies de garde actives ───────────────────────
    const guardSchedules = await getGuardPharmacies()

    if (guardSchedules.length === 0) {
      return NextResponse.json(
        { data: [], error: null, meta: { count: 0 } },
        {
          status: 200,
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          },
        }
      )
    }

    // ─── Enrichir avec la distance si coords fournies ────────────────────
    const enriched = guardSchedules.map((schedule) => {
      const pharmacy = schedule.pharmacy

      const distance =
        userLat !== null && userLng !== null
          ? Math.round(
              haversineDistance(
                userLat,
                userLng,
                pharmacy.location.lat,
                pharmacy.location.lng
              )
            )
          : null

      return {
        schedule_id: schedule.id,
        starts_at: schedule.starts_at,
        ends_at: schedule.ends_at,
        pharmacy: {
          ...pharmacy,
          is_on_guard: true,
          distance,
        },
      }
    })

    // ─── Trier par distance si dispo, sinon par nom ───────────────────────
    const sorted = enriched.sort((a, b) => {
      if (a.pharmacy.distance !== null && b.pharmacy.distance !== null) {
        return a.pharmacy.distance - b.pharmacy.distance
      }
      return a.pharmacy.name.localeCompare(b.pharmacy.name)
    })

    return NextResponse.json(
      {
        data: sorted,
        error: null,
        meta: {
          count: sorted.length,
          fetched_at: new Date().toISOString(),
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )
  } catch (err) {
    console.error('[GET /api/pharmacies/guard]', err)
    return NextResponse.json(
      { data: null, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}