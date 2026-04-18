// app/api/webhooks/flutterwave/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { generateTicketCode } from '@/lib/utils'
import crypto from 'crypto'

// Verify webhook signature
function verifyWebhookSignature(signature: string): boolean {
  const secretHash = process.env.FLUTTERWAVE_WEBHOOK_SECRET // "Vision@2040"
  return signature === secretHash
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('verif-hash') || ''

  // Verify webhook authenticity
  if (!verifyWebhookSignature(signature)) {
    console.warn('Invalid Flutterwave webhook signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: any
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Only process successful charge events
  if (event.event !== 'charge.completed' || event.data?.status !== 'successful') {
    return NextResponse.json({ received: true })
  }

  const { tx_ref, id: flw_transaction_id, amount, customer } = event.data

  try {
    // Find payment by reference
    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('reference', tx_ref)
      .single()

    if (!payment) {
      console.warn(`Webhook: payment not found for ref ${tx_ref}`)
      return NextResponse.json({ received: true })
    }

    // Idempotency check
    if (payment.status === 'success') {
      return NextResponse.json({ received: true, message: 'Already processed' })
    }

    // Verify amount
    const paidKobo = Math.round(amount * 100)
    if (Math.abs(paidKobo - payment.total) > 100) {
      console.error(`Amount mismatch: paid ${paidKobo}, expected ${payment.total}`)
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 })
    }

    // Update payment
    await supabase
      .from('payments')
      .update({ status: 'success', flutterwave_id: String(flw_transaction_id) })
      .eq('id', payment.id)

    // Issue tickets
    for (const item of payment.tickets as { tier_id: string; quantity: number }[]) {
      for (let i = 0; i < item.quantity; i++) {
        await supabase.from('tickets').insert({
          ticket_code: generateTicketCode(),
          event_id: payment.event_id,
          tier_id: item.tier_id,
          user_id: payment.user_id,
          payment_id: payment.id,
          status: 'active',
          holder_name: customer.name,
          holder_email: customer.email,
          affiliate_id: payment.affiliate_id,
        })
      }
    }

    // Credit affiliate commission
    if (payment.affiliate_id) {
      const commission = Math.round(payment.subtotal * 0.05)
      await supabase.rpc('increment_field', {
        table_name: 'affiliates',
        row_id: payment.affiliate_id,
        field_name: 'total_earnings',
        increment_value: commission,
      })
      await supabase.rpc('increment_field', {
        table_name: 'affiliates',
        row_id: payment.affiliate_id,
        field_name: 'total_sales',
        increment_value: payment.subtotal,
      })
    }

    console.log(`✅ Webhook processed: ${tx_ref}, tickets issued`)
    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook processing error:', err)
    return NextResponse.json({ error: 'Processing error' }, { status: 500 })
  }
}
