// middleware.ts

import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  const path = request.nextUrl.pathname

  // ── Routes protégées pharmacien ───────────────────────────────────────
  if (path.startsWith('/pharmacie/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/pharmacie/login', request.url))
    }
  }

  // ── Routes protégées admin ────────────────────────────────────────────
  if (path.startsWith('/admin/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // ── Redirection si déjà connecté ──────────────────────────────────────
  if (
    session &&
    (path === '/pharmacie/login' || path === '/pharmacie/inscription')
  ) {
    return NextResponse.redirect(new URL('/pharmacie/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/pharmacie/dashboard/:path*',
    '/pharmacie/login',
    '/pharmacie/inscription',
    '/admin/dashboard/:path*',
    '/admin/login',
  ],
}