'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

interface Props {
  toUserId: string
  eventId: string
  onWave?: () => void
  disabled?: boolean
  variant?: 'default' | 'matched'
}

export default function WaveButton({ toUserId, eventId, onWave, disabled, variant = 'default' }: Props) {
  const [loading, setLoading] = useState(false)

  const handleWave = async () => {
    if (disabled || loading) return

    setLoading(true)
    try {
      const res = await fetch('/api/waves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to_user_id: toUserId, event_id: eventId })
      })
      const data = await res.json()
      if (data.data.is_mutual) {
        toast.success('It\'s a match! 💕')
      } else {
        toast.success('Wave sent! 👋')
      }
      onWave?.()
    } catch (error) {
      toast.error('Failed to send wave')
    }
    setLoading(false)
  }

  if (variant === 'matched') {
    return (
      <button className="btn btn-primary btn-sm w-full opacity-50 cursor-not-allowed" disabled>
        ✅ Matched
      </button>
    )
  }

  return (
    <button
      onClick={handleWave}
      className="btn btn-primary btn-sm w-full"
      disabled={disabled || loading}
    >
      {loading ? 'Sending...' : '👋 Wave'}
    </button>
  )
}