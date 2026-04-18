// app/(app)/matches/[matchId]/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ChatPageClient from './ChatPageClient'

export default async function ChatPage({ params }: { params: { matchId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verify user is part of match
  const { data: match } = await supabase
    .from('matches')
    .select(`
      id, user_a_id, user_b_id,
      user_a:users!user_a_id (id, full_name),
      user_b:users!user_b_id (id, full_name),
      event:events (title)
    `)
    .eq('id', params.matchId)
    .single()

  if (!match || (match.user_a_id !== user.id && match.user_b_id !== user.id)) {
    return <div>Forbidden</div>
  }

  const otherUser = match.user_a_id === user.id ? match.user_b : match.user_a

  // Get messages
  const { data: messages } = await supabase
    .from('chat_messages')
    .select(`
      id, content, created_at, read_at,
      sender:users (id, full_name)
    `)
    .eq('match_id', params.matchId)
    .order('created_at', { ascending: false })
    .limit(50)

  const reversedMessages = messages?.reverse() || []

  return (
    <ChatPageClient
      matchId={params.matchId}
      otherUser={otherUser}
      eventTitle={match.event.title}
      initialMessages={reversedMessages}
      currentUserId={user.id}
    />
  )
}