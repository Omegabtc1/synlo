'use client'

import { Users } from 'lucide-react'

interface PlusOneRequest {
  id: string
  status: 'looking_for' | 'available_as' | 'matched' | 'inactive'
  bio_note?: string
  user: {
    id: string
    full_name: string
  }
}

interface Props {
  request: PlusOneRequest
  onWave: () => void
  isMatched?: boolean
}

export default function PlusOneCard({ request, onWave, isMatched }: Props) {
  const displayName = `${request.user.full_name.split(' ')[0]} ${request.user.full_name.split(' ')[1]?.[0] || ''}.`

  return (
    <div className="card p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <p className="font-medium">{displayName}</p>
          <p className="text-sm text-zinc-500">
            {request.status === 'looking_for' ? 'Looking' : 'Available'}
          </p>
        </div>
      </div>
      {request.bio_note && (
        <p className="text-sm text-zinc-400 mb-3">"{request.bio_note}"</p>
      )}
      <button
        onClick={onWave}
        className={`btn btn-primary btn-sm w-full ${isMatched ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={isMatched}
      >
        {isMatched ? '✅ Matched' : '👋 Wave'}
      </button>
    </div>
  )
}