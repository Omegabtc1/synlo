// app/(app)/plus-one/[eventId]/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PlusOnePageClient from './PlusOnePageClient'

export default async function PlusOnePage({ params }: { params: { eventId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/plus-one/' + params.eventId)
  }

  // Check if user has ticket
  const { data: ticket } = await supabase
    .from('tickets')
    .select('id')
    .eq('user_id', user.id)
    .eq('event_id', params.eventId)
    .eq('status', 'active')
    .single()

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Ticket Required</h1>
          <p className="text-zinc-500 mb-4">You need a ticket for this event to use Plus One.</p>
          <a href={`/event/${params.eventId}`} className="btn btn-primary">Get Ticket</a>
        </div>
      </div>
    )
  }

  // Get event details
  const { data: event } = await supabase
    .from('events')
    .select('title')
    .eq('id', params.eventId)
    .single()

  // Get plus one requests
  const { data: requests } = await supabase
    .from('plus_one_requests')
    .select(`
      id, status, bio_note,
      user:users (id, full_name)
    `)
    .eq('event_id', params.eventId)
    .eq('status', 'looking_for')
    .neq('user_id', user.id)

  // Get user's own request
  const { data: myRequest } = await supabase
    .from('plus_one_requests')
    .select('id, status, bio_note')
    .eq('user_id', user.id)
    .eq('event_id', params.eventId)
    .single()

  return (
    <PlusOnePageClient
      event={event}
      requests={requests || []}
      myRequest={myRequest}
      userId={user.id}
      eventId={params.eventId}
    />
  )
}