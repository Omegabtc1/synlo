// middleware.ts  ← goes in project ROOT (same level as package.json)
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED = [
  '/dashboard', '/organizer', '/tickets', '/affiliate',
  '/profile', '/verify', '/admin', '/plus-one', '/matches',
]
const AUTH_ROUTES = ['/login', '/signup']

export async function middleware(request: NextRequest) {
  // ── STEP 1: Create a response we can mutate ──────────────────────────
  // We MUST start with a mutable response so we can set cookies on it.
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  // ── STEP 2: Create Supabase server client ────────────────────────────
  // This is the ONLY correct way to do this with @supabase/ssr.
  // The getAll/setAll callbacks are what allow the session to persist
  // across server components after login.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // First: set on the request (so server components can read them)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          // Second: create new response with the updated request
          response = NextResponse.next({
            request,
          })
          // Third: set on the response (so the browser stores them)
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // ── STEP 3: CRITICAL — always call getUser() ─────────────────────────
  // This line does two things:
  // 1. Refreshes the session token if it has expired
  // 2. Returns the current authenticated user (or null)
  // DO NOT use getSession() here — getUser() is more reliable in middleware
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // ── STEP 4: Route protection ─────────────────────────────────────────

  // If user is NOT logged in and tries to access a protected route
  const isProtected = PROTECTED.some((r) => pathname.startsWith(r))
  if (isProtected && !user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If user IS logged in and tries to access login/signup
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r))
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // ── STEP 5: Return the mutated response ──────────────────────────────
  // This response has the refreshed session cookies set on it.
  // Without returning THIS response (with cookies), the dashboard
  // server component won't see the session — causing the blank page.
  return response
}

export const config = {
  matcher: [
    /*
     * Match everything EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - api/webhooks (Flutterwave webhook must not be blocked)
     * - public folder files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|api/webhooks|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
