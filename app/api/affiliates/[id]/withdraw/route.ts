import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { amount, bank_name, account_number, account_name } = await request.json()

    // Get affiliate record
    const { data: affiliate, error: affiliateError } = await supabase
      .from('affiliates')
      .select('user_id, total_earned, total_withdrawn')
      .eq('id', params.id)
      .single()

    if (affiliateError || affiliate.user_id !== user.id) {
      return NextResponse.json({ error: 'Affiliate record not found' }, { status: 404 })
    }

    const available = affiliate.total_earned - affiliate.total_withdrawn
    if (amount > available) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
    }

    // For now, create a withdrawal request record
    // In production, this would call Flutterwave payout API
    const { error: insertError } = await supabase
      .from('withdrawal_requests') // Assuming this table exists
      .insert({
        affiliate_id: params.id,
        amount,
        bank_name,
        account_number,
        account_name,
        status: 'pending'
      })

    if (insertError) {
      console.error('Withdrawal request error:', insertError)
      return NextResponse.json({ error: 'Failed to submit withdrawal request' }, { status: 500 })
    }

    // Update total_withdrawn
    const { error: updateError } = await supabase
      .from('affiliates')
      .update({ total_withdrawn: affiliate.total_withdrawn + amount })
      .eq('id', params.id)

    if (updateError) {
      console.error('Affiliate update error:', updateError)
      return NextResponse.json({ error: 'Failed to update balance' }, { status: 500 })
    }

    return NextResponse.json({ data: { message: 'Withdrawal request submitted' } })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}