import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { to_user_id, event_id } = await request.json()

    // Insert wave, ignore if already exists
    const { data: wave, error: insertError } = await supabase
      .from('waves')
      .insert({
        from_user_id: user.id,
        to_user_id,
        event_id,
        is_mutual: false
      })
      .select()
      .single()

    if (insertError && !insertError.message.includes('duplicate key')) {
      console.error('Wave insert error:', insertError)
      return NextResponse.json({ error: 'Failed to send wave' }, { status: 500 })
    }

    // Check if mutual
    let is_mutual = false
    if (wave) {
      const { data: mutualWave, error: mutualError } = await supabase
        .from('waves')
        .select('id')
        .eq('from_user_id', to_user_id)
        .eq('to_user_id', user.id)
        .eq('event_id', event_id)
        .single()

      if (mutualWave) {
        is_mutual = true
        // Update both waves to mutual
        await supabase
          .from('waves')
          .update({ is_mutual: true })
          .or(`and(from_user_id.eq.${user.id},to_user_id.eq.${to_user_id}),and(from_user_id.eq.${to_user_id},to_user_id.eq.${user.id})`)
          .eq('event_id', event_id)
      }
    }

    // If mutual, create match
    let match_id = null
    if (is_mutual) {
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .insert({
          user_a_id: user.id < to_user_id ? user.id : to_user_id,
          user_b_id: user.id < to_user_id ? to_user_id : user.id,
          event_id,
          chat_enabled: true
        })
        .select()
        .single()

      if (match) {
        match_id = match.id
      }
    }

    return NextResponse.json({ data: { wave, is_mutual, match_id } })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}