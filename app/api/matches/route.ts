import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        user_a:users!user_a_id (id, full_name),
        user_b:users!user_b_id (id, full_name),
        event:events (title)
      `)
      .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)

    if (error) {
      console.error('Matches fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 })
    }

    // Transform to include the other user
    const transformed = data.map(match => ({
      ...match,
      other_user: match.user_a_id === user.id ? match.user_a : match.user_b
    }))

    return NextResponse.json({ data: transformed })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}