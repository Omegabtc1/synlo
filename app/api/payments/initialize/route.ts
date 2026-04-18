// app/api/payments/initialize/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  generatePaymentRef,
  generateTicketCode,
  calcPlatformFee,
  nairaToKobo,
} from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Verify authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { event_id, tiers, affiliate_code } = body as {
      event_id: string
      tiers: { tier_id: string; quantity: number }[]
      affiliate_code?: string
    }

    if (!event_id || !tiers?.length) {
      return NextResponse.json({ error: 'event_id and tiers are required' }, { status: 400 })
    }

    // Fetch event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*, ticket_tiers(*)')
      .eq('id', event_id)
      .eq('status', 'published')
      .single()

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found or not available' }, { status: 404 })
    }

    // Validate tiers and calculate amounts
    let subtotalKobo = 0
    const ticketItems: { tier_id: string; quantity: number; unit_price: number }[] = []

    for (const item of tiers) {
      const tier = event.ticket_tiers.find((t: any) => t.id === item.tier_id)
      if (!tier) return NextResponse.json({ error: `Tier ${item.tier_id} not found` }, { status: 400 })
      if (!tier.is_active) return NextResponse.json({ error: `Tier "${tier.name}" is not available` }, { status: 400 })

      const available = tier.quantity - tier.quantity_sold
      if (item.quantity > available) {
        return NextResponse.json({ error: `Only ${available} tickets left for "${tier.name}"` }, { status: 400 })
      }
      if (item.quantity > tier.max_per_order) {
        return NextResponse.json({ error: `Max ${tier.max_per_order} tickets per order for "${tier.name}"` }, { status: 400 })
      }

      // price is stored in kobo
      subtotalKobo += tier.price * item.quantity
      ticketItems.push({ tier_id: tier.id, quantity: item.quantity, unit_price: tier.price })
    }

    const platformFeeKobo = calcPlatformFee(subtotalKobo)
    const totalKobo = subtotalKobo + platformFeeKobo

    // Resolve affiliate
    let affiliateUserId: string | null = null
    if (affiliate_code) {
      const { data: affiliate } = await supabase
        .from('affiliates')
        .select('user_id')
        .eq('referral_code', affiliate_code)
        .eq('event_id', event_id)
        .eq('is_active', true)
        .single()

      if (affiliate) affiliateUserId = affiliate.user_id
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from('users')
      .select('full_name, email, phone')
      .eq('id', user.id)
      .single()

    // Create pending payment record
    const paymentRef = generatePaymentRef()
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        reference: paymentRef,
        user_id: user.id,
        event_id,
        tickets: ticketItems,
        subtotal: subtotalKobo,
        platform_fee: platformFeeKobo,
        total: totalKobo,
        currency: 'NGN',
        status: 'pending',
        affiliate_id: affiliateUserId,
        metadata: { event_title: event.title, affiliate_code: affiliate_code || null },
      })
      .select()
      .single()

    if (paymentError || !payment) {
      console.error('Payment creation error:', paymentError)
      return NextResponse.json({ error: 'Failed to create payment record' }, { status: 500 })
    }

    // Build Flutterwave config
    const flutterwaveConfig = {
      public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY!,
      tx_ref: paymentRef,
      amount: totalKobo / 100, // Flutterwave takes Naira
      currency: 'NGN',
      payment_options: 'card,banktransfer,ussd',
      customer: {
        email: profile?.email || user.email!,
        name: profile?.full_name || 'Synlo User',
        phone_number: profile?.phone || '',
      },
      customizations: {
        title: `Synlo — ${event.title}`,
        description: `Ticket purchase for ${event.title}`,
        logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
      },
      meta: {
        payment_id: payment.id,
        event_id,
        user_id: user.id,
        source: 'synlo_web',
      },
    }

    return NextResponse.json({
      data: {
        payment_id: payment.id,
        reference: paymentRef,
        flutterwave_config: flutterwaveConfig,
        summary: {
          subtotal_naira: subtotalKobo / 100,
          platform_fee_naira: platformFeeKobo / 100,
          total_naira: totalKobo / 100,
          tiers: ticketItems.map(item => {
            const tier = event.ticket_tiers.find((t: any) => t.id === item.tier_id)
            return { name: tier.name, quantity: item.quantity, unit_price_naira: item.unit_price / 100 }
          }),
        },
      },
    })
  } catch (err) {
    console.error('Payment initialize error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
