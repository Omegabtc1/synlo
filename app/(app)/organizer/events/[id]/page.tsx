// app/(app)/organizer/events/[id]/page.tsx
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Users, Ticket, TrendingUp, Eye, QrCode, UserPlus, Globe, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatNaira, formatDate, formatDateTime } from '@/lib/utils'
import { EventStatusActions } from '@/components/organizer/EventStatusActions'

export default async function ManageEventPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: event, error } = await supabase
    .from('events')
    .select('*, ticket_tiers(*)')
    .eq('id', params.id)
    .eq('organizer_id', user!.id)
    .single()

  if (error || !event) notFound()

  // Fetch payments for this event
  const { data: payments = [] } = await supabase
    .from('payments')
    .select('id, subtotal, platform_fee, total, status, created_at, tickets')
    .eq('event_id', event.id)
    .eq('status', 'success')
    .order('created_at', { ascending: false })
    .limit(20)

  // Fetch recent tickets
  const { data: tickets = [] } = await supabase
    .from('tickets')
    .select('*, tier:ticket_tiers(name, type), user:users(full_name, email)')
    .eq('event_id', event.id)
    .order('created_at', { ascending: false })
    .limit(20)

  // Fetch verifiers
  const { data: verifiers = [] } = await supabase
    .from('verifiers')
    .select('*, user:users(id, full_name, email)')
    .eq('event_id', event.id)
    .eq('is_active', true)

  // Fetch scan logs
  const { data: scanLogs = [] } = await supabase
    .from('scan_logs')
    .select('*, verifier:users(full_name)')
    .eq('event_id', event.id)
    .order('scanned_at', { ascending: false })
    .limit(30)

  const totalRevenue = payments.reduce((s: number, p: any) => s + p.subtotal, 0)
  const ticketsUsed = tickets.filter((t: any) => t.status === 'used').length
  const soldPct = Math.round((event.tickets_sold / event.capacity) * 100)

  const statusColor: Record<string, string> = {
    published: 'status-active',
    draft: 'status-draft',
    cancelled: 'status-cancelled',
    completed: 'status-used',
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-zinc-800/40 bg-zinc-950/60 py-6">
        <div className="page-container">
          <div className="flex items-start gap-3 mb-3">
            <Link href="/organizer" className="btn btn-ghost btn-sm mt-0.5">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-display text-2xl font-bold truncate">{event.title}</h1>
                <span className={statusColor[event.status] || 'status-draft'}>{event.status}</span>
              </div>
              <p className="text-zinc-500 text-sm mt-0.5">
                {formatDateTime(event.starts_at)} · {event.city}
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link href={`/event/${event.slug}`} target="_blank" className="btn btn-ghost btn-sm">
              <Eye className="w-4 h-4" /> View Page
            </Link>
            <EventStatusActions eventId={event.id} currentStatus={event.status} />
          </div>
        </div>
      </div>

      <div className="page-container py-8 space-y-10">
        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <TrendingUp className="w-5 h-5 text-accent mb-2" />
            <p className="stat-value">{formatNaira(totalRevenue)}</p>
            <p className="stat-label">Revenue (your cut)</p>
          </div>
          <div className="stat-card">
            <Ticket className="w-5 h-5 text-purple-400 mb-2" />
            <p className="stat-value">{event.tickets_sold} / {event.capacity}</p>
            <p className="stat-label">Tickets Sold ({soldPct}%)</p>
          </div>
          <div className="stat-card">
            <QrCode className="w-5 h-5 text-teal-400 mb-2" />
            <p className="stat-value">{ticketsUsed}</p>
            <p className="stat-label">Checked In</p>
          </div>
          <div className="stat-card">
            <Eye className="w-5 h-5 text-blue-400 mb-2" />
            <p className="stat-value">{event.views.toLocaleString()}</p>
            <p className="stat-label">Page Views</p>
          </div>
        </div>

        {/* Capacity bar */}
        <div className="card p-5">
          <div className="flex justify-between text-sm text-zinc-400 mb-2">
            <span>Capacity: {soldPct}% sold</span>
            <span>{event.capacity - event.tickets_sold} remaining</span>
          </div>
          <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${soldPct >= 90 ? 'bg-red-500' : soldPct >= 70 ? 'bg-orange-500' : 'bg-accent'}`}
              style={{ width: `${Math.min(soldPct, 100)}%` }}
            />
          </div>
        </div>

        {/* Ticket tiers breakdown */}
        <div>
          <h2 className="font-display text-lg font-bold mb-4">Ticket Tiers</h2>
          <div className="space-y-3">
            {event.ticket_tiers?.map((tier: any) => {
              const tierRevenue = payments.reduce((sum: number, p: any) => {
                const pTickets = p.tickets as { tier_id: string; quantity: number; unit_price: number }[]
                const match = pTickets.find(t => t.tier_id === tier.id)
                return sum + (match ? match.quantity * match.unit_price : 0)
              }, 0)
              const pct = tier.quantity > 0 ? Math.round((tier.quantity_sold / tier.quantity) * 100) : 0

              return (
                <div key={tier.id} className="card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-zinc-100">{tier.name}</p>
                      <span className="badge text-xs text-zinc-400 bg-zinc-800 border-zinc-700">{tier.type}</span>
                      {!tier.is_active && <span className="badge status-cancelled text-xs">Inactive</span>}
                    </div>
                    <div className="text-right">
                      <p className="font-display font-bold text-accent">{formatNaira(tierRevenue)}</p>
                      <p className="text-xs text-zinc-500">{tier.quantity_sold} / {tier.quantity} sold</p>
                    </div>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full">
                    <div className="h-full bg-accent rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Attendees */}
          <div>
            <h2 className="font-display text-lg font-bold mb-4">Recent Attendees</h2>
            {tickets.length === 0 ? (
              <div className="card p-8 text-center text-zinc-500">
                <p className="text-4xl mb-2">🎟️</p>
                <p className="text-sm">No tickets sold yet</p>
              </div>
            ) : (
              <div className="card divide-y divide-zinc-800 overflow-hidden">
                {tickets.slice(0, 10).map((ticket: any) => (
                  <div key={ticket.id} className="px-4 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-zinc-100 truncate">{ticket.holder_name}</p>
                      <p className="text-xs text-zinc-500 truncate">{ticket.tier?.name} · {ticket.ticket_code}</p>
                    </div>
                    <span className={`flex-shrink-0 badge text-xs ${ticket.status === 'used' ? 'status-used' : 'status-active'}`}>
                      {ticket.status === 'used' ? 'Checked in' : 'Active'}
                    </span>
                  </div>
                ))}
                {tickets.length > 10 && (
                  <div className="px-4 py-3 text-xs text-zinc-500 text-center">
                    +{tickets.length - 10} more attendees
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Verifiers */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold">Door Verifiers</h2>
              <AddVerifierButton eventId={event.id} />
            </div>
            {verifiers.length === 0 ? (
              <div className="card p-8 text-center text-zinc-500">
                <QrCode className="w-8 h-8 mx-auto mb-2 text-zinc-700" />
                <p className="text-sm">No verifiers assigned</p>
                <p className="text-xs mt-1">Add staff to scan tickets at the door</p>
              </div>
            ) : (
              <div className="card divide-y divide-zinc-800 overflow-hidden">
                {verifiers.map((v: any) => (
                  <div key={v.id} className="px-4 py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-sm text-zinc-100">{v.user?.full_name}</p>
                      <p className="text-xs text-zinc-500">{v.user?.email}</p>
                    </div>
                    <span className="status-active badge text-xs">Active</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Scan logs */}
        {scanLogs.length > 0 && (
          <div>
            <h2 className="font-display text-lg font-bold mb-4">Recent Scan Activity</h2>
            <div className="card divide-y divide-zinc-800 overflow-hidden">
              {scanLogs.slice(0, 15).map((log: any) => (
                <div key={log.id} className="px-4 py-3 flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    log.result === 'valid' ? 'bg-green-400' :
                    log.result === 'already_used' ? 'bg-yellow-400' : 'bg-red-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs text-zinc-300">{log.ticket_code}</p>
                    <p className="text-xs text-zinc-500">{log.verifier?.full_name} · {new Date(log.scanned_at).toLocaleTimeString()}</p>
                  </div>
                  <span className={`badge text-xs flex-shrink-0 ${
                    log.result === 'valid' ? 'status-active' :
                    log.result === 'already_used' ? 'status-pending' : 'status-cancelled'
                  }`}>
                    {log.result.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Simple client button for adding verifiers (placeholder)
function AddVerifierButton({ eventId }: { eventId: string }) {
  return (
    <form action={`/api/verifiers`} method="POST">
      <input type="hidden" name="event_id" value={eventId} />
      <button type="button" className="btn btn-ghost btn-sm">
        <UserPlus className="w-4 h-4" /> Add Verifier
      </button>
    </form>
  )
}
