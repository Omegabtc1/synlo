// app/(app)/layout.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppNavbar } from '@/components/layout/AppNavbar'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  // ── CRITICAL: use getUser() not getSession() ─────────────────────────
  // getSession() reads from the cookie without validating with the server.
  // getUser() actually validates the JWT with Supabase — more secure and
  // reliable, especially right after login when cookies are just being set.
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // Fetch the user's profile from public.users
  // This is separate from auth.users — it has role, full_name, etc.
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    // Profile doesn't exist yet — this can happen if the DB trigger
    // hasn't run. Create it manually and try again.
    const { data: newProfile } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email!,
        full_name:
          user.user_metadata?.full_name ||
          user.email!.split('@')[0],
        role: user.user_metadata?.role || 'attendee',
      })
      .select()
      .single()

    if (!newProfile) {
      // Something is seriously wrong — redirect to login
      redirect('/login?error=profile_error')
    }

    return (
      <div className="min-h-screen bg-[var(--color-bg)]">
        <AppNavbar user={newProfile} />
        <main className="pt-16">{children}</main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <AppNavbar user={profile} />
      <main className="pt-16">{children}</main>
    </div>
  )
}
