// app/api/payments/verify/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { generateTicketCode } from '@/lib/utils'

async function verifyWithFlutterwave(transactionId: string): Promise<any> {
  const response = await fetch(
    `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
    {
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  )
  return response.json()
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient() // service role for ticket creation
    const body = await request.json()
    const { transaction_id, tx_ref } = body

    if (!transaction_id || !tx_ref) {
      return NextResponse.json({ error: 'transaction_id and tx_ref required' }, { status: 400 })
    }

    // Verify with Flutterwave
    const flwResponse = await verifyWithFlutterwave(transaction_id)

    if (flwResponse.status !== 'success' || flwResponse.data?.status !== 'successful') {
      // Update payment as failed
      await supabase
        .from('payments')
        .update({ status: 'failed', flutterwave_id: String(transaction_id) })
        .eq('reference', tx_ref)

      return NextResponse.json({ error: 'Payment verification failed', status: 'failed' }, { status: 400 })
    }

    const flwData = flwResponse.data

    // Fetch our payment record
    const { data: payment, error: paymentFetchError } = await supabase
      .from('payments')
      .select('*, events(*)')
      .eq('reference', tx_ref)
      .single()

    if (paymentFetchError || !payment) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 })
    }

    // Idempotency: already processed
    if (payment.status === 'success') {
      const { data: tickets } = await supabase
        .from('tickets')
        .select('*')
        .eq('payment_id', payment.id)
      return NextResponse.json({ data: { payment, tickets, already_processed: true } })
    }

    // Validate amounts match (tolerance: 1 naira for rounding)
    const paidAmountKobo = Math.round(flwData.amount * 100)
    if (Math.abs(paidAmountKobo - payment.total) > 100) {
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 })
    }

    // Update payment status
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'success',
        flutterwave_id: String(flwData.id),
        metadata: { ...payment.metadata, flw_data: flwData },
      })
      .eq('id', payment.id)

    if (updateError) throw updateError

    // Issue tickets for each tier
    const tickets: any[] = []
    for (const item of payment.tickets as { tier_id: string; quantity: number; unit_price: number }[]) {
      for (let i = 0; i < item.quantity; i++) {
        const ticketCode = generateTicketCode()
        const { data: ticket, error: ticketError } = await supabase
          .from('tickets')
          .insert({
            ticket_code: ticketCode,
            event_id: payment.event_id,
            tier_id: item.tier_id,
            user_id: payment.user_id,
            payment_id: payment.id,
            status: 'active',
            holder_name: flwData.customer.name,
            holder_email: flwData.customer.email,
            affiliate_id: payment.affiliate_id,
          })
          .select()
          .single()

        if (ticketError) {
          console.error('Ticket creation error:', ticketError)
          throw ticketError
        }
        tickets.push(ticket)
      }
    }

    // Credit affiliate if applicable
    if (payment.affiliate_id) {
      const commissionKobo = Math.round(payment.subtotal * 0.05)
      await supabase
        .from('affiliates')
        .update({
          conversions: supabase.rpc('increment', { x: 1 }) as any,
          total_earned: supabase.rpc('increment', { x: commissionKobo }) as any,
        })
        .eq('user_id', payment.affiliate_id)
        .eq('event_id', payment.event_id)
    }

    // TODO: Send confirmation email via Resend
    // await sendTicketConfirmationEmail(flwData.customer.email, tickets, payment.events)

    return NextResponse.json({
      data: {
        payment_id: payment.id,
        status: 'success',
        tickets_issued: tickets.length,
        tickets,
      },
    })
  } catch (err) {
    console.error('Payment verify error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
