import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { referral_code } = await request.json()

    // Increment clicks
    const { error } = await supabase
      .from('affiliates')
      .update({ clicks: supabase.raw('clicks + 1') })
      .eq('referral_code', referral_code)

    if (error) {
      console.error('Track click error:', error)
      // Don't return error, just log
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ success: true }) // Always return success for tracking
  }
}