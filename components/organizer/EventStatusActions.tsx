'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Globe, EyeOff, XCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface EventStatusActionsProps {
  eventId: string
  currentStatus: string
}

export function EventStatusActions({ eventId, currentStatus }: EventStatusActionsProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const update = async (status: string) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('events')
        .update({ status })
        .eq('id', eventId)
      if (error) throw error
      toast.success(`Event ${status === 'published' ? 'published' : status === 'draft' ? 'unpublished' : 'cancelled'}`)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'Failed to update')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2">
      {currentStatus === 'draft' && (
        <button
          onClick={() => update('published')}
          disabled={loading}
          className="btn btn-primary btn-sm"
        >
          <Globe className="w-4 h-4" />
          {loading ? 'Publishing…' : 'Publish'}
        </button>
      )}
      {currentStatus === 'published' && (
        <button
          onClick={() => update('draft')}
          disabled={loading}
          className="btn btn-ghost btn-sm"
        >
          <EyeOff className="w-4 h-4" />
          {loading ? '…' : 'Unpublish'}
        </button>
      )}
      {currentStatus !== 'cancelled' && (
        <button
          onClick={() => {
            if (confirm('Cancel this event? This cannot be undone.')) update('cancelled')
          }}
          disabled={loading}
          className="btn btn-danger btn-sm"
        >
          <XCircle className="w-4 h-4" />
          Cancel
        </button>
      )}
    </div>
  )
}
