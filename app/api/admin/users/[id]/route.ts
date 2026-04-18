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

    // Check if user is admin
    const { data: userData, error: userCheckError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userCheckError || userData.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { role, is_verified } = await request.json()

    const updates: any = {}
    if (role !== undefined) updates.role = role
    if (is_verified !== undefined) updates.is_verified = is_verified

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', params.id)

    if (error) {
      console.error('User update error:', error)
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }

    return NextResponse.json({ message: 'User updated' })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}