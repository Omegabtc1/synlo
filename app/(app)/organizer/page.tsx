// app/(app)/organizer/page.tsx
import Link from 'next/link'
import { Plus, TrendingUp, Ticket, Users, Eye, ArrowRight, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatNaira, formatDate, koboToNaira } from '@/lib/utils'

export default async function OrganizerPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: events = [] } = await supabase
    .from('events')
    .select('*, ticket_tiers(*)')
    .eq('organizer_id', user!.id)
    .order('created_at', { ascending: false })

  const { data: payments = [] } = await supabase
    .from('payments')
    .select('subtotal, platform_fee, total, status, created_at, event_id')
    .in('event_id', events.map((e: any) => e.id))
    .eq('status', 'success')

  const totalRevenue = payments.reduce((sum: number, p: any) => sum + p.subtotal, 0)
  const totalTickets = events.reduce((sum: number, e: any) => sum + e.tickets_sold, 0)
  const totalViews = events.reduce((sum: number, e: any) => sum + e.views, 0)

  const publishedEvents = events.filter((e: any) => e.status === 'published')
  const draftEvents = events.filter((e: any) => e.status === 'draft')

  const statusColors: Record<string, string> = {
    published: 'status-active',
    draft: 'status-draft',
    cancelled: 'status-cancelled',
    completed: 'status-used',
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-zinc-800/40 bg-zinc-950/60 py-8">
        <div className="page-container flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold">Organiser Dashboard</h1>
            <p className="text-zinc-500 text-sm mt-1">{events.length} event{events.length !== 1 ? 's' : ''} total</p>
          </div>
          <Link href="/organizer/create" className="btn btn-primary btn-md">
            <Plus className="w-4 h-4" /> Create Event
          </Link>
        </div>
      </div>

      <div className="page-container py-8 space-y-10">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <TrendingUp className="w-5 h-5 text-accent mb-2" />
            <p className="stat-value">{formatNaira(totalRevenue)}</p>
            <p className="stat-label">Total Revenue</p>
          </div>
          <div className="stat-card">
            <Ticket className="w-5 h-5 text-purple-400 mb-2" />
            <p className="stat-value">{totalTickets.toLocaleString()}</p>
            <p className="stat-label">Tickets Sold</p>
          </div>
          <div className="stat-card">
            <Eye className="w-5 h-5 text-teal-400 mb-2" />
            <p className="stat-value">{totalViews.toLocaleString()}</p>
            <p className="stat-label">Event Views</p>
          </div>
          <div className="stat-card">
            <Calendar className="w-5 h-5 text-blue-400 mb-2" />
            <p className="stat-value">{publishedEvents.length}</p>
            <p className="stat-label">Live Events</p>
          </div>
        </div>

        {/* Events list */}
        <div>
          <h2 className="font-display text-xl font-bold mb-6">Your Events</h2>
          {events.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-5xl mb-4">🎪</p>
              <p className="font-display text-xl font-bold text-zinc-300 mb-2">No events yet</p>
              <p className="text-zinc-500 mb-6">Create your first event and start selling tickets</p>
              <Link href="/organizer/create" className="btn btn-primary btn-md">Create Event</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event: any) => {
                const revenue = payments
                  .filter((p: any) => p.event_id === event.id)
                  .reduce((sum: number, p: any) => sum + p.subtotal, 0)
                const soldPct = Math.round((event.tickets_sold / event.capacity) * 100)

                return (
                  <div key={event.id} className="card p-5 hover:border-zinc-700 transition-all">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="font-display font-bold text-zinc-100">{event.title}</h3>
                          <span className={statusColors[event.status] || 'status-draft'}>{event.status}</span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
                          <span>📅 {formatDate(event.starts_at)}</span>
                          <span>📍 {event.city}</span>
                          <span>🎟️ {event.tickets_sold} / {event.capacity} sold ({soldPct}%)</span>
                          <span className="text-accent font-medium">💰 {formatNaira(revenue)}</span>
                        </div>
                        {/* Mini progress bar */}
                        <div className="mt-3 h-1 bg-zinc-800 rounded-full w-48">
                          <div
                            className={`h-full rounded-full ${soldPct >= 80 ? 'bg-orange-500' : 'bg-accent'}`}
                            style={{ width: `${Math.min(soldPct, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Link href={`/event/${event.slug}`} className="btn btn-ghost btn-sm">
                          View Page
                        </Link>
                        <Link href={`/organizer/events/${event.id}`} className="btn btn-primary btn-sm">
                          Manage <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
