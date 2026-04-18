// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

// ── Browser client for 'use client' components ────────────────────────
// Must be called as a function (not a module-level const) so that
// each component gets a fresh instance with the current cookies.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
