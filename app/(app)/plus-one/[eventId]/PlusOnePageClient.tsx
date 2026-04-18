'use client'

import { useState } from 'react'
import { Users, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface PlusOneRequest {
  id: string
  status: 'looking_for' | 'available_as' | 'matched' | 'inactive'
  bio_note?: string
  user: {
    id: string
    full_name: string
  }
}

interface Event {
  title: string
}

interface Props {
  event: Event
  requests: PlusOneRequest[]
  myRequest: PlusOneRequest | null
  userId: string
  eventId: string
}

export default function PlusOnePageClient({ event, requests, myRequest, userId, eventId }: Props) {
  const [status, setStatus] = useState(myRequest?.status || '')
  const [bioNote, setBioNote] = useState(myRequest?.bio_note || '')
  const [loading, setLoading] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/plus-one', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId, status: newStatus, bio_note: bioNote })
      })
      if (res.ok) {
        setStatus(newStatus)
        toast.success('Status updated!')
      } else {
        toast.error('Failed to update status')
      }
    } catch (error) {
      toast.error('Error updating status')
    }
    setLoading(false)
  }

  const handleSaveBio = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/plus-one', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId, status, bio_note: bioNote })
      })
      if (res.ok) {
        toast.success('Bio updated!')
      } else {
        toast.error('Failed to update bio')
      }
    } catch (error) {
      toast.error('Error updating bio')
    }
    setLoading(false)
  }

  const handleWave = async (toUserId: string) => {
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
    } catch (error) {
      toast.error('Failed to send wave')
    }
  }

  return (
    <div className="min-h-screen">
      <div className="page-container py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold mb-2">👋 Plus One</h1>
            <h2 className="text-xl text-zinc-300">{event.title}</h2>
            <p className="text-zinc-500 mt-2">Find someone to go with</p>
          </div>

          {/* My Status */}
          <div className="card p-6 mb-8">
            <h3 className="font-semibold mb-4">You are:</h3>
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => handleStatusChange('looking_for')}
                className={`btn ${status === 'looking_for' ? 'btn-primary' : 'btn-outline'} btn-sm`}
                disabled={loading}
              >
                Looking for Plus One
              </button>
              <button
                onClick={() => handleStatusChange('available_as')}
                className={`btn ${status === 'available_as' ? 'btn-primary' : 'btn-outline'} btn-sm`}
                disabled={loading}
              >
                Available as Plus One
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a bio note..."
                value={bioNote}
                onChange={(e) => setBioNote(e.target.value)}
                className="input flex-1"
              />
              <button
                onClick={handleSaveBio}
                className="btn btn-outline btn-sm"
                disabled={loading}
              >
                Save
              </button>
            </div>
          </div>

          {/* Other People */}
          <div className="mb-8">
            <h3 className="font-semibold mb-4">{requests.length} people are looking</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {requests.map((req) => (
                <div key={req.id} className="card p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">{req.user.full_name.split(' ')[0]} {req.user.full_name.split(' ')[1]?.[0]}.</p>
                      <p className="text-sm text-zinc-500">{req.status === 'looking_for' ? 'Looking' : 'Available'}</p>
                    </div>
                  </div>
                  {req.bio_note && (
                    <p className="text-sm text-zinc-400 mb-3">"{req.bio_note}"</p>
                  )}
                  <button
                    onClick={() => handleWave(req.user.id)}
                    className="btn btn-primary btn-sm w-full"
                  >
                    👋 Wave
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}