// app/(public)/event/[slug]/page.tsx
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, MapPin, Users, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatDate, formatTime, formatNaira, CATEGORY_META } from '@/lib/utils'
import { EventCard } from '@/components/events/EventCard'
import { BuyTicketButton } from '@/components/events/BuyTicketButton'
import { PlusOneCTA } from '@/components/events/PlusOneCTA'
import { ShareButtons } from '@/components/events/ShareButtons'
import type { Event } from '@/types'

interface EventPageProps {
  params: { id: string }
  searchParams: { ref?: string }
}

export async function generateMetadata({ params }: EventPageProps) {
  const supabase = createClient()
  const { data: event } = await supabase
    .from('events')
    .select('title, description, cover_image')
    .eq('slug', params.id)
    .single()

  if (!event) return { title: 'Event Not Found' }

  return {
    title: event.title,
    description: event.description?.slice(0, 160),
    openGraph: {
      title: event.title,
      description: event.description?.slice(0, 160),
      images: event.cover_image ? [event.cover_image] : [],
    },
  }
}

export default async function EventPage({ params, searchParams }: EventPageProps) {
  const supabase = createClient()

  const { data: event } = await supabase
    .from('events')
    .select(`
      *,
      ticket_tiers(*),
      organizer:users(id, full_name, bio, avatar_url)
    `)
    .eq('slug', params.id)
    .eq('status', 'published')
    .single()

  if (!event) notFound()

  await supabase
    .from('events')
    .update({ views: (event.views || 0) + 1 })
    .eq('id', event.id)

  const { data: { user } } = await supabase.auth.getUser()
  let userHasTicket = false

  if (user) {
    const { data: ticket } = await supabase
      .from('tickets')
      .select('id')
      .eq('user_id', user.id)
      .eq('event_id', event.id)
      .eq('status', 'active')
      .single()

    userHasTicket = !!ticket
  }

  const { data: relatedEvents = [] } = await supabase
    .from('events')
    .select('*, ticket_tiers(*)')
    .eq('status', 'published')
    .eq('category', event.category)
    .neq('id', event.id)
    .limit(3)

  const meta = CATEGORY_META[event.category] || CATEGORY_META.other
  const activeTiers = (event.ticket_tiers || []).filter((tier: any) => tier.is_active)
  const isSoldOut = event.tickets_sold >= event.capacity

  return (
    <div className="min-h-screen">
      <div className="relative h-96 overflow-hidden">
        <Image
          src={event.cover_image || '/placeholder-event.jpg'}
          alt={event.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

        <div className="absolute top-4 left-4">
          <Link
            href="/explore"
            className="flex items-center gap-2 px-3 py-2 rounded-synlo-sm bg-zinc-950/60 backdrop-blur-sm border border-zinc-800/60 text-zinc-300 hover:text-zinc-100 text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Events
          </Link>
        </div>
      </div>

      <div className="page-container -mt-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <span className={`badge ${meta.color} mb-4`}>{meta.emoji} {meta.label}</span>
              <h1 className="font-display text-3xl sm:text-4xl font-bold mb-4">{event.title}</h1>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-zinc-500" />
                  <div>
                    <p className="font-medium text-zinc-200">{event.venue_name}, {event.city}</p>
                    {event.venue_address && <p className="text-zinc-500">{event.venue_address}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-zinc-500" />
                  <div>
                    <p className="font-medium text-zinc-200">{formatDate(event.starts_at)}</p>
                    <p className="text-zinc-500">{formatTime(event.starts_at)} — {formatTime(event.ends_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-zinc-500" />
                  <div>
                    <p className="font-medium text-zinc-200">{event.tickets_sold} / {event.capacity} attending</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="font-display text-xl font-bold mb-4">About this event</h2>
              <div className="text-zinc-400 leading-relaxed whitespace-pre-wrap">
                {event.description}
              </div>
            </div>

            {event.organizer && (
              <div>
                <h2 className="font-display text-xl font-bold mb-4">Organised by</h2>
                <div className="card p-6 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center font-display font-bold text-white text-xl">
                    {event.organizer.full_name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-100">{event.organizer.full_name}</p>
                    {event.organizer.bio && <p className="text-zinc-500 mt-1">{event.organizer.bio}</p>}
                  </div>
                </div>
              </div>
            )}

            <div>
              <h2 className="font-display text-xl font-bold mb-4">Share this event</h2>
              <ShareButtons event={event} affiliateCode={searchParams.ref} />
            </div>

            <PlusOneCTA event={event} userHasTicket={userHasTicket} />
          </div>

          <div className="space-y-6">
            <div className="sticky top-20">
              <div className="card p-6">
                <h2 className="font-display text-lg font-bold mb-4">Get Tickets</h2>

                {isSoldOut ? (
                  <div className="text-center py-8">
                    <p className="text-4xl mb-3">??</p>
                    <p className="font-semibold text-zinc-300">Sold Out</p>
                    <p className="text-sm text-zinc-600 mt-1">All tickets for this event have been sold</p>
                  </div>
                ) : (
                  <div className="space-y-4 mb-6">
                    {activeTiers.map((tier: any) => {
                      const available = tier.quantity - (tier.quantity_sold || 0)
                      return (
                        <div key={tier.id} className="flex items-center justify-between p-4 rounded-synlo bg-zinc-800/60 border border-zinc-700/60">
                          <div>
                            <p className="font-semibold text-sm text-zinc-100">{tier.name}</p>
                            {tier.description && <p className="text-xs text-zinc-500 mt-1">{tier.description}</p>}
                          </div>
                          <div className="text-right">
                            <p className="font-display font-bold text-accent">{tier.price === 0 ? 'Free' : formatNaira(tier.price)}</p>
                            <p className="text-xs text-zinc-500">{available} left</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {!isSoldOut && <BuyTicketButton event={event} />}

                <div className="mt-6 pt-6 border-t border-zinc-800">
                  <p className="font-semibold text-sm text-zinc-100 mb-2">?? Earn by sharing</p>
                  <p className="text-xs text-zinc-500 mb-4">Become an affiliate and earn 5% commission on every ticket sold through your link.</p>
                  {user ? (
                    <Link href="/affiliate" className="btn btn-ghost btn-sm w-full">Become an Affiliate</Link>
                  ) : (
                    <Link href="/signup" className="btn btn-ghost btn-sm w-full">Sign up to earn</Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {relatedEvents.length > 0 && (
          <div className="mt-16">
            <h2 className="font-display text-2xl font-bold mb-8">More {meta.label} events</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedEvents.map((e: any) => <EventCard key={e.id} event={e} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
