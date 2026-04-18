import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import slugify from 'slugify'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      title,
      description,
      category,
      tags,
      cover_image,
      venue_name,
      venue_address,
      city,
      state,
      country,
      starts_at,
      ends_at,
      capacity,
      is_private,
      status,
      tiers
    } = body

    // Generate slug
    const slug = `${slugify(title, { lower: true })}-${nanoid(6)}`

    // Insert event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert({
        organizer_id: user.id,
        title,
        slug,
        description,
        category,
        tags,
        cover_image,
        venue_name,
        venue_address,
        city,
        state,
        country,
        starts_at,
        ends_at,
        status,
        is_private,
        capacity,
        tickets_sold: 0,
        views: 0
      })
      .select()
      .single()

    if (eventError) {
      console.error('Event insert error:', eventError)
      return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
    }

    // Insert tiers
    const tiersToInsert = tiers.map((tier: any) => ({
      event_id: event.id,
      name: tier.name,
      type: tier.type,
      description: tier.description,
      price: Math.round(tier.price * 100), // Naira to kobo
      quantity: tier.quantity,
      quantity_sold: 0,
      max_per_order: tier.max_per_order,
      is_active: true
    }))

    const { data: insertedTiers, error: tiersError } = await supabase
      .from('ticket_tiers')
      .insert(tiersToInsert)
      .select()

    if (tiersError) {
      console.error('Tiers insert error:', tiersError)
      // Clean up event if tiers fail
      await supabase.from('events').delete().eq('id', event.id)
      return NextResponse.json({ error: 'Failed to create ticket tiers' }, { status: 500 })
    }

    return NextResponse.json({ data: { event, tiers: insertedTiers } })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}