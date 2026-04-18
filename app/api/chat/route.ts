import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const match_id = searchParams.get('match_id')

    if (!match_id) {
      return NextResponse.json({ error: 'match_id required' }, { status: 400 })
    }

    // Verify user is part of match
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('id')
      .eq('id', match_id)
      .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
      .single()

    if (matchError || !match) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        *,
        sender:users (id, full_name)
      `)
      .eq('match_id', match_id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Chat fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    return NextResponse.json({ data: data.reverse() }) // Reverse to chronological order
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { match_id, content } = await request.json()

    // Verify user is part of match
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('id')
      .eq('id', match_id)
      .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
      .single()

    if (matchError || !match) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        match_id,
        sender_id: user.id,
        content
      })

    if (error) {
      console.error('Chat insert error:', error)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Message sent' })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}