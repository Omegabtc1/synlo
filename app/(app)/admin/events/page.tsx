// app/(app)/admin/events/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function EventsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if admin
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'admin') {
    redirect('/dashboard')
  }

  const { data: events } = await supabase
    .from('events')
    .select(`
      *,
      organizer:users (full_name),
      tickets:tickets (count)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen">
      <div className="page-container py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-display text-3xl font-bold mb-8">Event Moderation</h1>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-zinc-800">
                  <tr>
                    <th className="text-left p-4">Title</th>
                    <th className="text-left p-4">Organizer</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">City</th>
                    <th className="text-left p-4">Created</th>
                    <th className="text-left p-4">Tickets</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events?.map((event) => (
                    <tr key={event.id} className="border-b border-zinc-800/40">
                      <td className="p-4">{event.title}</td>
                      <td className="p-4">{event.organizer?.full_name}</td>
                      <td className="p-4">
                        <span className={`badge ${
                          event.status === 'published' ? 'badge-green' :
                          event.status === 'draft' ? 'badge-neutral' :
                          'badge-red'
                        }`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="p-4">{event.city}</td>
                      <td className="p-4">
                        {new Date(event.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">{event.tickets_sold}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <a
                            href={`/event/${event.slug}`}
                            target="_blank"
                            className="btn btn-outline btn-sm"
                          >
                            View
                          </a>
                          {event.status === 'draft' && (
                            <button className="btn btn-primary btn-sm">
                              Publish
                            </button>
                          )}
                          {event.status === 'published' && (
                            <button className="btn btn-outline btn-sm">
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}