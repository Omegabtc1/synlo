// app/api/tickets/scan/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { ticket_code, event_id } = await request.json()
    if (!ticket_code || !event_id) {
      return NextResponse.json({ error: 'ticket_code and event_id required' }, { status: 400 })
    }

    // Verify user is a verifier for this event OR the organizer
    const { data: event } = await supabase
      .from('events')
      .select('organizer_id')
      .eq('id', event_id)
      .single()

    const isOrganizer = event?.organizer_id === user.id

    if (!isOrganizer) {
      const { data: verifier } = await supabase
        .from('verifiers')
        .select('id')
        .eq('event_id', event_id)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

      if (!verifier) {
        return NextResponse.json({ error: 'Not authorized to scan for this event' }, { status: 403 })
      }
    }

    // Look up ticket
    const { data: ticket } = await supabase
      .from('tickets')
      .select('*, ticket_tiers(name, type), events(title)')
      .eq('ticket_code', ticket_code)
      .single()

    let scanResult: 'valid' | 'invalid' | 'already_used' | 'wrong_event'
    let message: string

    if (!ticket) {
      scanResult = 'invalid'
      message = 'Ticket not found. This QR code is invalid.'
    } else if (ticket.event_id !== event_id) {
      scanResult = 'wrong_event'
      message = `This ticket is for a different event: "${ticket.events?.title}"`
    } else if (ticket.status === 'used') {
      scanResult = 'already_used'
      message = `Already checked in at ${ticket.checked_in_at}`
    } else if (ticket.status !== 'active') {
      scanResult = 'invalid'
      message = `Ticket status is "${ticket.status}"`
    } else {
      scanResult = 'valid'
      message = 'Valid ticket — welcome!'

      // Mark ticket as used
      await supabase
        .from('tickets')
        .update({
          status: 'used',
          checked_in_at: new Date().toISOString(),
          checked_in_by: user.id,
        })
        .eq('id', ticket.id)
    }

    // Log the scan
    await supabase.from('scan_logs').insert({
      ticket_id: ticket?.id || null,
      ticket_code,
      verifier_id: user.id,
      event_id,
      result: scanResult,
      device_info: request.headers.get('user-agent') || null,
    })

    return NextResponse.json({
      data: {
        result: scanResult,
        message,
        ticket: ticket
          ? {
              id: ticket.id,
              holder_name: ticket.holder_name,
              holder_email: ticket.holder_email,
              tier_name: ticket.ticket_tiers?.name,
              tier_type: ticket.ticket_tiers?.type,
              status: scanResult === 'valid' ? 'used' : ticket.status,
            }
          : null,
      },
    })
  } catch (err) {
    console.error('Scan error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
