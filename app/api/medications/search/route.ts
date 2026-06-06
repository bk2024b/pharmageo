// app/api/medications/search/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { searchMedications, getPharmaciesForMedication } from '@/lib/medications'
import { isValidCoords, haversineDistance } from '@/lib/geo'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // ─── Paramètres ──────────────────────────────────────────────────────
    const query = searchParams.get('q')
    const latParam = searchParams.get('lat')
    const lngParam = searchParams.get('lng')
    const otcOnly = searchParams.get('otc') === 'true'

    // ─── Validation query ────────────────────────────────────────────────
    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { data: null, error: 'Paramètre q requis (minimum 2 caractères)' },
        { status: 400 }
      )
    }

    if (query.trim().length > 100) {
      return NextResponse.json(
        { data: null, error: 'Requête trop longue (maximum 100 caractères)' },
        { status: 400 }
      )
    }

    // ─── Validation coords optionnelles ──────────────────────────────────
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

    // ─── Recherche médicaments ───────────────────────────────────────────
    let results = await searchMedications(query.trim())

    // ─── Filtre vente libre ──────────────────────────────────────────────
    if (otcOnly) {
      results = results.filter((med) => med.otc === true)
    }

    if (results.length === 0) {
      return NextResponse.json(
        { data: [], error: null, meta: { count: 0, query } },
        { status: 200 }
      )
    }

    // ─── Enrichir chaque médicament avec ses pharmacies + distance ────────
    const enriched = await Promise.all(
      results.map(async (med) => {
        const pharmacyRows = await getPharmaciesForMedication(med.id)

        const pharmacies = pharmacyRows
          .map((row: any) => {
            const loc = row.pharmacy?.location
            const lat = loc?.coordinates?.[1] ?? loc?.lat ?? null
            const lng = loc?.coordinates?.[0] ?? loc?.lng ?? null

            const distance =
              userLat !== null && userLng !== null && lat && lng
                ? Math.round(haversineDistance(userLat, userLng, lat, lng))
                : null

            return {
              pharmacy_id: row.pharmacy_id,
              quantity: row.quantity,
              updated_at: row.updated_at,
              pharmacy: {
                id: row.pharmacy?.id,
                name: row.pharmacy?.name,
                address: row.pharmacy?.address,
                phone: row.pharmacy?.phone ?? null,
                location: { lat, lng },
                distance,
              },
            }
          })
          // trier par distance si dispo, sinon par stock décroissant
          .sort((a, b) => {
            if (a.pharmacy.distance !== null && b.pharmacy.distance !== null) {
              return a.pharmacy.distance - b.pharmacy.distance
            }
            return b.quantity - a.quantity
          })

        return {
          id: med.id,
          name: med.name,
          dci: med.dci,
          category: med.category,
          otc: med.otc,
          availability: {
            total_pharmacies: pharmacies.length,
            in_stock: pharmacies.filter((p) => p.quantity > 0).length,
          },
          pharmacies,
        }
      })
    )

    // ─── Trier les médicaments : d'abord ceux qui ont du stock ───────────
    const sorted = enriched.sort(
      (a, b) => b.availability.in_stock - a.availability.in_stock
    )

    return NextResponse.json(
      {
        data: sorted,
        error: null,
        meta: {
          count: sorted.length,
          query: query.trim(),
          filtered_otc: otcOnly,
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=240',
        },
      }
    )
  } catch (err) {
    console.error('[GET /api/medications/search]', err)
    return NextResponse.json(
      { data: null, error: 'Erreur serveur interne' },
      { status: 500 }
    )
  }
}