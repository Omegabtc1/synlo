'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@/types'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Get current session
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (!authUser) {
        setLoading(false)
        return
      }
      supabase.from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()
        .then(({ data }) => {
          setUser(data)
          setLoading(false)
        })
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!session?.user) {
          setUser(null)
          return
        }
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        setUser(data)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
