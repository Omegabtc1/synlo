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
      .from('affiliates')
      .select(`
        *,
        event:events (title, slug)
      `)
      .eq('user_id', user.id)

    if (error) {
      console.error('Affiliates fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch affiliates' }, { status: 500 })
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

    const { event_id } = await request.json()

    // Check event exists and is published
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, status')
      .eq('id', event_id)
      .eq('status', 'published')
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found or not published' }, { status: 404 })
    }

    // Check not already affiliate
    const { data: existing, error: existingError } = await supabase
      .from('affiliates')
      .select('id')
      .eq('user_id', user.id)
      .eq('event_id', event_id)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Already an affiliate for this event' }, { status: 400 })
    }

    // Generate referral code
    const userIdPart = user.id.slice(0, 4)
    const eventIdPart = event_id.slice(0, 4)
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase()
    const referral_code = `${userIdPart}${eventIdPart}${randomPart}`

    const { data: affiliate, error: insertError } = await supabase
      .from('affiliates')
      .insert({
        user_id: user.id,
        event_id,
        referral_code,
        clicks: 0,
        conversions: 0,
        total_earned: 0,
        total_withdrawn: 0,
        commission_rate: 0.05,
        is_active: true
      })
      .select(`
        *,
        event:events (title, slug)
      `)
      .single()

    if (insertError) {
      console.error('Affiliate insert error:', insertError)
      return NextResponse.json({ error: 'Failed to join affiliate program' }, { status: 500 })
    }

    return NextResponse.json({ data: affiliate })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}