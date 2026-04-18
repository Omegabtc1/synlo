// app/(app)/matches/page.tsx
import Link from 'next/link'
import { MessageCircle, Calendar, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function MatchesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div>Please log in</div>
  }

  const { data: matches } = await supabase
    .from('matches')
    .select(`
      id, created_at,
      user_a:users!user_a_id (id, full_name),
      user_b:users!user_b_id (id, full_name),
      event:events (title)
    `)
    .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)

  const transformedMatches = matches?.map(match => ({
    ...match,
    other_user: match.user_a_id === user.id ? match.user_b : match.user_a
  })) || []

  return (
    <div className="min-h-screen">
      <div className="page-container py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display text-3xl font-bold mb-8">My Matches</h1>

          {transformedMatches.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No matches yet</h2>
              <p className="text-zinc-500 mb-4">Browse events with Plus One to connect.</p>
              <Link href="/explore" className="btn btn-primary">Explore Events</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {transformedMatches.map((match) => (
                <div key={match.id} className="card p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{match.other_user.full_name}</h3>
                        <p className="text-sm text-zinc-500 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {match.event.title}
                        </p>
                      </div>
                    </div>
                    <Link href={`/matches/${match.id}`} className="btn btn-primary btn-sm">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}