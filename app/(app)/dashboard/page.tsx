// app/(app)/dashboard/page.tsx
import Link from 'next/link'
import { ArrowRight, Plus, Ticket, Users, BarChart3, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { EventCard } from '@/components/events/EventCard'
import { formatNaira } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: tickets }, { data: upcomingEvents }] = await Promise.all([
    supabase.from('users').select('*').eq('id', user!.id).single(),
    supabase.from('tickets')
      .select('*, event:events(*, ticket_tiers(*)), tier:ticket_tiers(*)')
      .eq('user_id', user!.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(3),
    supabase.from('events')
      .select('*, ticket_tiers(*)')
      .eq('status', 'published')
      .gte('starts_at', new Date().toISOString())
      .order('starts_at')
      .limit(6),
  ])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const firstName = profile?.full_name?.split(' ')[0] || 'there'

  return (
    <div className="min-h-screen">
      {/* Hero greeting */}
      <div className="relative bg-gradient-to-b from-zinc-900/60 to-transparent border-b border-zinc-800/40 px-4 py-10">
        <div className="page-container">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-zinc-500 text-sm mb-1">{greeting} 👋</p>
              <h1 className="font-display text-3xl sm:text-4xl font-extrabold">
                {firstName}
              </h1>
              <p className="text-zinc-500 mt-2 text-sm">
                {tickets?.length ? `You have ${tickets.length} upcoming ticket${tickets.length > 1 ? 's' : ''}.` : 'Discover your next event below.'}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link href="/explore" className="btn btn-ghost btn-sm">Explore Events</Link>
              {profile?.role === 'organizer' && (
                <Link href="/organizer/create" className="btn btn-primary btn-sm">
                  <Plus className="w-4 h-4" /> Create Event
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="page-container py-8 space-y-12">
        {/* Quick actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: <Ticket className="w-5 h-5" />, label: 'My Tickets', href: '/tickets', count: tickets?.length || 0, color: 'text-accent' },
            { icon: <Users className="w-5 h-5" />, label: 'Affiliate', href: '/affiliate', count: null, color: 'text-purple-400' },
            { icon: <BarChart3 className="w-5 h-5" />, label: 'Organiser', href: '/organizer', count: null, color: 'text-teal-400' },
            { icon: <Zap className="w-5 h-5" />, label: 'Explore', href: '/explore', count: null, color: 'text-yellow-400' },
          ].map(({ icon, label, href, count, color }) => (
            <Link key={href} href={href} className="card-hover p-4 flex flex-col gap-2">
              <div className={`${color}`}>{icon}</div>
              <p className="font-semibold text-sm text-zinc-100">{label}</p>
              {count !== null && <p className="text-xs text-zinc-500">{count} active</p>}
            </Link>
          ))}
        </div>

        {/* My Tickets */}
        {tickets && tickets.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold">Upcoming Tickets</h2>
              <Link href="/tickets" className="text-sm text-accent hover:text-orange-400 flex items-center gap-1 transition-colors">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid gap-3">
              {tickets.map((ticket: any) => (
                <div key={ticket.id} className="card p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-synlo-sm bg-gradient-to-br from-accent/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Ticket className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-zinc-100 truncate">{ticket.event?.title}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{ticket.tier?.name} · {ticket.ticket_code}</p>
                  </div>
                  <Link href="/tickets" className="btn btn-ghost btn-sm flex-shrink-0">View</Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Discover events */}
        {upcomingEvents && upcomingEvents.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold">Discover Events</h2>
              <Link href="/explore" className="text-sm text-accent hover:text-orange-400 flex items-center gap-1 transition-colors">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {upcomingEvents.map((event: any) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
