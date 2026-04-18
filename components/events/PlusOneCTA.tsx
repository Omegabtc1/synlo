'use client'
import Link from 'next/link'
import { useUser } from '@/hooks/useUser'
import type { Event } from '@/types'

interface PlusOneCTAProps {
  event: Event
  userHasTicket: boolean
}

export function PlusOneCTA({ event, userHasTicket }: PlusOneCTAProps) {
  const { user } = useUser()

  if (!user) {
    return (
      <div className="card p-6 bg-gradient-to-br from-accent/10 to-purple-500/10 border-accent/20">
        <h3 className="font-display text-lg font-bold mb-2">👥 Find your Plus One</h3>
        <p className="text-zinc-400 text-sm mb-4">
          Connect with other attendees and find someone to attend this event with.
        </p>
        <Link href="/signup" className="btn btn-outline btn-sm">
          Sign up to join
        </Link>
      </div>
    )
  }

  if (!userHasTicket) {
    return (
      <div className="card p-6 bg-zinc-800/50 border-zinc-700">
        <h3 className="font-display text-lg font-bold mb-2">👥 Plus One</h3>
        <p className="text-zinc-400 text-sm">
          Get a ticket first to find your Plus One for this event.
        </p>
      </div>
    )
  }

  return (
    <div className="card p-6 bg-gradient-to-br from-accent/10 to-purple-500/10 border-accent/20">
      <h3 className="font-display text-lg font-bold mb-2">👥 Find your Plus One</h3>
      <p className="text-zinc-400 text-sm mb-4">
        Connect with other attendees and find someone to attend this event with.
      </p>
      <Link href={`/plus-one/${event.id}`} className="btn btn-primary btn-sm">
        Find Plus One
      </Link>
    </div>
  )
}