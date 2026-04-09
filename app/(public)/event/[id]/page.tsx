// app/(public)/event/[id]/page.tsx
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, MapPin, Users, Share2, ArrowLeft, Clock, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatDateTime, formatDate, formatTime, formatNaira, CATEGORY_META, truncate } from '@/lib/utils'
import { EventCard } from '@/components/events/EventCard'
import { EventActions } from '@/components/events/EventActions'

interface EventPageProps {
  params: { id: string }
  searchParams: { ref?: string }
}

export async function generateMetadata({ params }: EventPageProps) {
  const supabase = createClient()
  const { data: event } = await supabase
    .from('events')
    .select('title, description, cover_image, city')
    .or(`id.eq.${params.id},slug.eq.${params.id}`)
    .single()

  if (!event) return { title: 'Event Not Found' }
  return {
    title: event.title,
    description: truncate(event.description, 160),
    openGraph: {
      title: event.title,
      description: truncate(event.description, 160),
      images: event.cover_image ? [event.cover_image] : [],
    },
  }
}

export default async function EventPage({ params, searchParams }: EventPageProps) {
  const supabase = createClient()

  // Fetch event by slug or id
  const { data: event, error } = await supabase
    .from('events')
    .select(`
      *,
      ticket_tiers(*),
      organizer:users(id, full_name, avatar_url, bio)
    `)
    .or(`id.eq.${params.id},slug.eq.${params.id}`)
    .eq('status', 'published')
    .single()

  if (error || !event) notFound()

  // Increment view count
  await supabase
    .from('events')
    .update({ views: (event.views || 0) + 1 })
    .eq('id', event.id)

  // Fetch current user
  const { data: { user } } = await supabase.auth.getUser()
  let profile = null
  if (user) {
    const { data } = await supabase.from('users').select('*').eq('id', user.id).single()
    profile = data
  }

  // Fetch related events
  const { data: relatedEvents = [] } = await supabase
    .from('events')
    .select('*, ticket_tiers(*)')
    .eq('status', 'published')
    .eq('category', event.category)
    .neq('id', event.id)
    .limit(3)

  const meta = CATEGORY_META[event.category] || CATEGORY_META.other
  const minPrice = event.ticket_tiers?.reduce((min: number, t: any) => Math.min(min, t.price), Infinity) ?? 0
  const soldOutPct = Math.round((event.tickets_sold / event.capacity) * 100)
  const isSoldOut = event.tickets_sold >= event.capacity
  const activeTiers = (event.ticket_tiers || []).filter((t: any) => t.is_active)

  return (
    <div className="pt-16 min-h-screen">
      {/* ── HERO BANNER ── */}
      <div className="relative h-[40vh] sm:h-[50vh] overflow-hidden">
        {event.cover_image ? (
          <Image src={event.cover_image} alt={event.title} fill className="object-cover" priority />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center">
            <span className="text-[120px] opacity-20">{meta.emoji}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-zinc-950/20" />

        {/* Back button */}
        <div className="absolute top-4 left-4">
          <Link href="/explore" className="flex items-center gap-2 px-3 py-2 rounded-synlo-sm bg-zinc-950/60 backdrop-blur-sm border border-zinc-800/60 text-zinc-300 hover:text-zinc-100 text-sm transition-all">
            <ArrowLeft className="w-4 h-4" /> Events
          </Link>
        </div>
      </div>

      <div className="page-container">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 -mt-16 relative z-10">
          {/* ── LEFT: Event info ── */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title block */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className={`badge ${meta.color}`}>{meta.emoji} {meta.label}</span>
                {event.is_private && <span className="badge text-zinc-400 bg-zinc-800 border-zinc-700">🔒 Private</span>}
              </div>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
                {event.title}
              </h1>
              {/* Event meta */}
              <div className="flex flex-wrap gap-5 text-sm text-zinc-400">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-synlo-sm bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-600 uppercase tracking-wider">Date</p>
                    <p className="text-zinc-200 font-medium">{formatDate(event.starts_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-synlo-sm bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-600 uppercase tracking-wider">Time</p>
                    <p className="text-zinc-200 font-medium">{formatTime(event.starts_at)} — {formatTime(event.ends_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-synlo-sm bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-600 uppercase tracking-wider">Venue</p>
                    <p className="text-zinc-200 font-medium">{event.venue_name}</p>
                    <p className="text-xs text-zinc-500">{event.venue_address}, {event.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-synlo-sm bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                    <Users className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-600 uppercase tracking-wider">Attendance</p>
                    <p className="text-zinc-200 font-medium">{event.tickets_sold.toLocaleString()} / {event.capacity.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Capacity bar */}
            {!isSoldOut && (
              <div>
                <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
                  <span>{soldOutPct}% sold</span>
                  <span>{(event.capacity - event.tickets_sold).toLocaleString()} left</span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${soldOutPct >= 80 ? 'bg-orange-500' : 'bg-accent'}`}
                    style={{ width: `${Math.min(soldOutPct, 100)}%` }}
                  />
                </div>
                {soldOutPct >= 80 && (
                  <p className="text-xs text-orange-400 mt-1.5">🔥 Going fast — only {event.capacity - event.tickets_sold} tickets left!</p>
                )}
              </div>
            )}

            {/* Description */}
            <div>
              <h2 className="font-display text-xl font-bold mb-4">About this event</h2>
              <div className="text-zinc-400 leading-relaxed whitespace-pre-wrap text-[15px]">
                {event.description}
              </div>
            </div>

            {/* Organizer */}
            {event.organizer && (
              <div className="card p-5">
                <h3 className="font-display font-bold text-sm uppercase tracking-wider text-zinc-500 mb-4">Organised by</h3>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center font-display font-bold text-white text-lg flex-shrink-0">
                    {event.organizer.full_name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-100">{event.organizer.full_name}</p>
                    {event.organizer.bio && <p className="text-sm text-zinc-500 mt-0.5">{truncate(event.organizer.bio, 100)}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Share + Plus One */}
            <EventActions event={event} user={profile} affiliateCode={searchParams.ref} />
          </div>

          {/* ── RIGHT: Ticket sidebar ── */}
          <div className="space-y-4">
            <div className="sticky top-20">
              {/* Ticket tiers */}
              <div className="card p-5 relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent" />

                <h2 className="font-display text-lg font-bold mb-1">Get Tickets</h2>
                {minPrice > 0 && (
                  <p className="text-sm text-zinc-500 mb-5">From <span className="text-accent font-bold">{formatNaira(minPrice)}</span> + 10% fee</p>
                )}

                {isSoldOut ? (
                  <div className="text-center py-8">
                    <p className="text-4xl mb-3">😢</p>
                    <p className="font-semibold text-zinc-300">Sold Out</p>
                    <p className="text-sm text-zinc-600 mt-1">All tickets for this event have been sold</p>
                  </div>
                ) : (
                  <div className="space-y-3 mb-5">
                    {activeTiers.map((tier: any) => {
                      const available = tier.quantity - tier.quantity_sold
                      return (
                        <div key={tier.id} className="flex items-center justify-between p-3.5 rounded-synlo bg-zinc-800/60 border border-zinc-700/60">
                          <div>
                            <p className="font-semibold text-sm text-zinc-100">{tier.name}</p>
                            {tier.description && <p className="text-xs text-zinc-500 mt-0.5">{tier.description}</p>}
                            <p className="text-xs text-zinc-600 mt-1">{available.toLocaleString()} left</p>
                          </div>
                          <div className="text-right">
                            <p className="font-display font-bold text-accent">{tier.price === 0 ? 'Free' : formatNaira(tier.price)}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Buy button rendered client-side */}
                {!isSoldOut && (
                  <EventActions
                    event={event}
                    user={profile}
                    affiliateCode={searchParams.ref}
                    mode="buy-only"
                  />
                )}

                <p className="text-xs text-zinc-600 text-center mt-3">
                  🔒 Secured by Flutterwave · No hidden charges
                </p>
              </div>

              {/* Affiliate CTA */}
              <div className="card p-4 bg-gradient-to-br from-zinc-900 to-zinc-900/50">
                <p className="font-semibold text-sm text-zinc-100 mb-1">💰 Earn by sharing</p>
                <p className="text-xs text-zinc-500 mb-3">Become an affiliate and earn 5% commission on every ticket sold through your link.</p>
                {user ? (
                  <Link href="/affiliate" className="btn btn-ghost btn-sm w-full">Become an Affiliate</Link>
                ) : (
                  <Link href="/signup" className="btn btn-ghost btn-sm w-full">Sign up to earn</Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related events */}
        {relatedEvents.length > 0 && (
          <div className="mt-20 pb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-2xl font-bold">More {meta.label} events</h2>
              <Link href={`/explore?category=${event.category}`} className="btn btn-ghost btn-sm">
                See all <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedEvents.map((e: any) => <EventCard key={e.id} event={e} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
