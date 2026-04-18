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
    const event_id = searchParams.get('event_id')

    if (!event_id) {
      return NextResponse.json({ error: 'event_id required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('plus_one_requests')
      .select(`
        id, status, bio_note, created_at,
        user:users (id, full_name)
      `)
      .eq('event_id', event_id)
      .eq('status', 'looking_for')
      .neq('user_id', user.id) // Exclude own
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Plus one fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch plus one requests' }, { status: 500 })
    }

    return NextResponse.json({ data })
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

    const { event_id, status, bio_note } = await request.json()

    // Check user has ticket
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('id')
      .eq('user_id', user.id)
      .eq('event_id', event_id)
      .eq('status', 'active')
      .single()

    if (ticketError || !ticket) {
      return NextResponse.json({ error: 'You need a ticket for this event' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('plus_one_requests')
      .upsert({
        user_id: user.id,
        event_id,
        status,
        bio_note
      }, {
        onConflict: 'user_id,event_id'
      })
      .select(`
        *,
        user:users (id, full_name)
      `)
      .single()

    if (error) {
      console.error('Plus one upsert error:', error)
      return NextResponse.json({ error: 'Failed to update plus one status' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, status } = await request.json()

    const { error } = await supabase
      .from('plus_one_requests')
      .update({ status })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Plus one update error:', error)
      return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Status updated' })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}