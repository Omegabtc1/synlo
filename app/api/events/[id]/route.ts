import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is the organizer
    const { data: event, error: eventCheckError } = await supabase
      .from('events')
      .select('organizer_id')
      .eq('id', params.id)
      .single()

    if (eventCheckError || event.organizer_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { status, ...updates } = body

    const { data, error } = await supabase
      .from('events')
      .update({ ...updates, status })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Event update error:', error)
      return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is the organizer
    const { data: event, error: eventCheckError } = await supabase
      .from('events')
      .select('organizer_id')
      .eq('id', params.id)
      .single()

    if (eventCheckError || event.organizer_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error } = await supabase
      .from('events')
      .update({ status: 'cancelled' })
      .eq('id', params.id)

    if (error) {
      console.error('Event delete error:', error)
      return NextResponse.json({ error: 'Failed to cancel event' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Event cancelled' })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}