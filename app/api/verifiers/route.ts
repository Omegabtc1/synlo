import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { event_id, email } = await request.json()

    // Check if user is organizer of the event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('organizer_id')
      .eq('id', event_id)
      .single()

    if (eventError || event.organizer_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Look up user by email
    const { data: targetUser, error: userError } = await supabase
      .from('users')
      .select('id, full_name, email')
      .eq('email', email)
      .single()

    if (userError || !targetUser) {
      return NextResponse.json({ error: 'No Synlo account with this email' }, { status: 404 })
    }

    // Check if already assigned
    const { data: existing, error: existingError } = await supabase
      .from('verifiers')
      .select('id')
      .eq('event_id', event_id)
      .eq('user_id', targetUser.id)
      .eq('is_active', true)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Already a verifier for this event' }, { status: 400 })
    }

    // Insert verifier
    const { data: verifier, error: insertError } = await supabase
      .from('verifiers')
      .insert({
        event_id,
        user_id: targetUser.id,
        assigned_by: user.id,
        is_active: true
      })
      .select(`
        *,
        user:user_id (id, full_name, email)
      `)
      .single()

    if (insertError) {
      console.error('Verifier insert error:', insertError)
      return NextResponse.json({ error: 'Failed to add verifier' }, { status: 500 })
    }

    return NextResponse.json({ data: verifier })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { verifier_id } = await request.json()

    // Get verifier to check event ownership
    const { data: verifier, error: verifierError } = await supabase
      .from('verifiers')
      .select('event_id, events!inner(organizer_id)')
      .eq('id', verifier_id)
      .single()

    if (verifierError || verifier.events.organizer_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Soft delete
    const { error: updateError } = await supabase
      .from('verifiers')
      .update({ is_active: false })
      .eq('id', verifier_id)

    if (updateError) {
      console.error('Verifier delete error:', updateError)
      return NextResponse.json({ error: 'Failed to remove verifier' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Verifier removed' })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}