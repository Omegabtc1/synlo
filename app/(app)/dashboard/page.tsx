// app/(app)/dashboard/page.tsx
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowRight, Ticket, Users, BarChart3, Zap, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatNaira, formatDateTime } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = createClient()

  // Get the authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch profile + data in parallel
  const [
    { data: profile },
    { data: tickets },
    { data: affiliates },
    { data: upcomingEvents },
  ] = await Promise.all([
    supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single(),

    supabase
      .from('tickets')
      .select('*, event:events(id, title, slug, venue_name, city, starts_at, category), tier:ticket_tiers(name, type)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(4),

    supabase
      .from('affiliates')
      .select('total_earned, total_withdrawn')
      .eq('user_id', user.id),

    supabase
      .from('events')
      .select('*, ticket_tiers(*)')
      .eq('status', 'published')
      .eq('is_private', false)
      .gte('starts_at', new Date().toISOString())
      .order('tickets_sold', { ascending: false })
      .limit(4),
  ])

  const firstName = profile?.full_name?.split(' ')[0] || 'there'
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const totalEarned = (affiliates || []).reduce((s, a) => s + a.total_earned, 0)
  const totalWithdrawn = (affiliates || []).reduce((s, a) => s + a.total_withdrawn, 0)
  const availableBalance = totalEarned - totalWithdrawn

  const CATEGORY_EMOJI: Record<string, string> = {
    tech: '💻', music: '🎵', arts: '🎨', food: '🍲', sports: '⚽',
    business: '📈', education: '📚', fashion: '👗', comedy: '😂',
    campus: '🎓', other: '✨',
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* ── Header ── */}
      <div
        className="border-b bg-white"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="wrap py-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm mb-1" style={{ color: 'var(--color-text-3)' }}>
                {greeting} 👋
              </p>
              <h1
                className="text-3xl font-extrabold tracking-tight"
                style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.04em' }}
              >
                {firstName}
              </h1>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link href="/explore" className="btn btn-outline btn-sm">
                Browse Events
              </Link>
              {profile?.role === 'organizer' && (
                <Link href="/organizer/create" className="btn btn-dark btn-sm">
                  + Create Event
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="wrap py-8 space-y-10">
        {/* ── Quick stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: <Ticket className="w-5 h-5 text-[var(--color-accent)]" />,
              value: (tickets || []).length.toString(),
              label: 'Active Tickets',
              href: '/tickets',
            },
            {
              icon: <Users className="w-5 h-5 text-purple-500" />,
              value: (affiliates || []).reduce((s, a) => s + 1, 0).toString(),
              label: 'Affiliate Links',
              href: '/affiliate',
            },
            {
              icon: <TrendingUp className="w-5 h-5 text-green-500" />,
              value: formatNaira(availableBalance),
              label: 'Affiliate Balance',
              href: '/affiliate',
            },
            {
              icon: <BarChart3 className="w-5 h-5 text-blue-500" />,
              value: profile?.role === 'organizer' ? 'Active' : 'Attendee',
              label: 'Account Type',
              href: '/profile',
            },
          ].map(({ icon, value, label, href }) => (
            <Link
              key={label}
              href={href}
              className="stat-card group hover:border-[var(--color-border-2)] hover:shadow-sm hover:-translate-y-0.5 transition-all duration-150"
              style={{ textDecoration: 'none' }}
            >
              <div className="mb-3">{icon}</div>
              <p className="stat-value">{value}</p>
              <p className="stat-label">{label}</p>
            </Link>
          ))}
        </div>

        {/* ── Upcoming tickets ── */}
        {tickets && tickets.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2
                className="text-xl font-bold tracking-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Upcoming Tickets
              </h2>
              <Link
                href="/tickets"
                className="text-sm font-semibold flex items-center gap-1 group"
                style={{ color: 'var(--color-accent)' }}
              >
                View all
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <div className="grid gap-3">
              {tickets.map((ticket: any) => (
                <div
                  key={ticket.id}
                  className="card-sm p-4 flex items-center gap-4 bg-white"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: 'var(--color-bg)' }}
                  >
                    {CATEGORY_EMOJI[ticket.event?.category] || '🎟️'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: 'var(--color-text)' }}>
                      {ticket.event?.title}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-3)' }}>
                      {ticket.tier?.name} · {ticket.event?.city}
                      {ticket.event?.starts_at && ` · ${formatDateTime(ticket.event.starts_at)}`}
                    </p>
                  </div>
                  <Link href="/tickets" className="btn btn-outline btn-sm flex-shrink-0">
                    View QR
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Discover events ── */}
        {upcomingEvents && upcomingEvents.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2
                className="text-xl font-bold tracking-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Discover Events
              </h2>
              <Link
                href="/explore"
                className="text-sm font-semibold flex items-center gap-1 group"
                style={{ color: 'var(--color-accent)' }}
              >
                Browse all
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {upcomingEvents.map((event: any) => {
                const minPrice = event.ticket_tiers?.reduce(
                  (min: number, t: any) => Math.min(min, t.price),
                  Infinity
                ) ?? 0
                return (
                  <Link
                    key={event.id}
                    href={`/event/${event.slug}`}
                    className="card-sm p-4 bg-white group hover:border-[var(--color-border-2)] hover:-translate-y-0.5 hover:shadow-sm transition-all duration-150"
                    style={{ textDecoration: 'none' }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3"
                      style={{ background: 'var(--color-bg)' }}
                    >
                      {CATEGORY_EMOJI[event.category] || '✨'}
                    </div>
                    <p
                      className="font-semibold text-sm leading-snug mb-2 group-hover:text-[var(--color-accent)] transition-colors"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {event.title}
                    </p>
                    <p className="text-xs mb-3" style={{ color: 'var(--color-text-3)' }}>
                      📍 {event.city}
                    </p>
                    <p
                      className="font-extrabold text-sm"
                      style={{ fontFamily: 'var(--font-display)', color: 'var(--color-accent)' }}
                    >
                      {minPrice === 0 ? 'Free' : `From ${formatNaira(minPrice)}`}
                    </p>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Empty state (no tickets, no events) ── */}
        {(!tickets || tickets.length === 0) && (!upcomingEvents || upcomingEvents.length === 0) && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🎟️</div>
            <h2
              className="text-xl font-bold mb-2"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}
            >
              Ready to find your next experience?
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-3)' }}>
              Browse events happening near you and around the world
            </p>
            <Link href="/explore" className="btn btn-dark btn-md">
              Explore Events <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
