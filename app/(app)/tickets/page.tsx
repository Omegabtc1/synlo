// app/(app)/tickets/page.tsx
import { createClient } from '@/lib/supabase/server'
import { QRTicket } from '@/components/tickets/QRTicket'
import { formatDate } from '@/lib/utils'

export default async function TicketsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: tickets = [] } = await supabase
    .from('tickets')
    .select(`
      *,
      event:events(id, title, slug, venue_name, city, starts_at, ends_at, category, cover_image),
      tier:ticket_tiers(id, name, type, price)
    `)
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const activeTickets = tickets.filter((t: any) => t.status === 'active')
  const usedTickets = tickets.filter((t: any) => t.status === 'used')

  return (
    <div className="min-h-screen">
      <div className="border-b border-zinc-800/40 bg-zinc-950/60 py-8">
        <div className="page-container">
          <h1 className="font-display text-3xl font-bold">My Tickets</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {activeTickets.length} active · {usedTickets.length} used
          </p>
        </div>
      </div>

      <div className="page-container py-8">
        {tickets.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-6xl mb-4">🎟️</p>
            <p className="font-display text-xl font-bold text-zinc-300 mb-2">No tickets yet</p>
            <p className="text-zinc-500 mb-6">Discover events and get your first ticket</p>
            <a href="/explore" className="btn btn-primary btn-md">Browse Events</a>
          </div>
        ) : (
          <div className="space-y-12">
            {activeTickets.length > 0 && (
              <div>
                <h2 className="font-display text-lg font-bold mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full" />
                  Active Tickets
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeTickets.map((ticket: any) => (
                    <QRTicket key={ticket.id} ticket={ticket} />
                  ))}
                </div>
              </div>
            )}
            {usedTickets.length > 0 && (
              <div>
                <h2 className="font-display text-lg font-bold mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 bg-zinc-600 rounded-full" />
                  Past Events
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {usedTickets.map((ticket: any) => (
                    <QRTicket key={ticket.id} ticket={ticket} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
