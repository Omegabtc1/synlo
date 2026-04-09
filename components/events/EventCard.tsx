import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Calendar, Users, ArrowRight } from 'lucide-react'
import { cn, formatNaira, formatDateTime, CATEGORY_META, truncate, koboToNaira } from '@/lib/utils'
import type { Event } from '@/types'

interface EventCardProps {
  event: Event
  variant?: 'default' | 'compact' | 'featured'
  className?: string
}

// Gradient map for events without a cover image
const GRADIENT_MAP: Record<string, string> = {
  tech:       'from-indigo-950 via-indigo-900/60 to-zinc-900',
  music:      'from-pink-950 via-pink-900/60 to-zinc-900',
  arts:       'from-purple-950 via-purple-900/60 to-zinc-900',
  food:       'from-yellow-950 via-yellow-900/40 to-zinc-900',
  sports:     'from-green-950 via-green-900/60 to-zinc-900',
  business:   'from-teal-950 via-teal-900/60 to-zinc-900',
  education:  'from-blue-950 via-blue-900/60 to-zinc-900',
  fashion:    'from-rose-950 via-rose-900/60 to-zinc-900',
  comedy:     'from-orange-950 via-orange-900/60 to-zinc-900',
  campus:     'from-emerald-950 via-emerald-900/60 to-zinc-900',
  other:      'from-zinc-900 via-zinc-800/60 to-zinc-900',
}

export function EventCard({ event, variant = 'default', className }: EventCardProps) {
  const meta = CATEGORY_META[event.category] || CATEGORY_META.other
  const gradient = GRADIENT_MAP[event.category] || GRADIENT_MAP.other
  const minPrice = event.ticket_tiers?.reduce((min, t) => Math.min(min, t.price), Infinity) ?? 0
  const isFree = minPrice === 0
  const availableCapacity = event.capacity - event.tickets_sold
  const soldOutPct = Math.round((event.tickets_sold / event.capacity) * 100)
  const isAlmostFull = soldOutPct >= 80 && soldOutPct < 100
  const isSoldOut = event.tickets_sold >= event.capacity

  if (variant === 'compact') {
    return (
      <Link href={`/event/${event.slug}`} className={cn('card-hover flex gap-4 p-4', className)}>
        <div className={cn('w-16 h-16 rounded-synlo-sm bg-gradient-to-br flex-shrink-0 flex items-center justify-center text-2xl', gradient)}>
          {meta.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-zinc-100 truncate">{event.title}</p>
          <p className="text-xs text-zinc-500 mt-0.5">{event.city} · {formatDateTime(event.starts_at)}</p>
          <p className="text-xs font-semibold text-accent mt-1">{isFree ? 'Free' : `From ${formatNaira(minPrice)}`}</p>
        </div>
      </Link>
    )
  }

  if (variant === 'featured') {
    return (
      <Link href={`/event/${event.slug}`} className={cn('group relative overflow-hidden rounded-synlo-lg border border-zinc-800 hover:border-zinc-600 transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated block', className)}>
        {/* Cover image / gradient */}
        <div className={cn('relative h-72 bg-gradient-to-br', gradient)}>
          {event.cover_image && (
            <Image src={event.cover_image} alt={event.title} fill className="object-cover opacity-60 group-hover:opacity-70 transition-opacity duration-300" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
          {!event.cover_image && (
            <div className="absolute inset-0 flex items-center justify-center text-7xl opacity-40">{meta.emoji}</div>
          )}
          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            <span className={cn('badge text-xs', meta.color)}>{meta.emoji} {meta.label}</span>
            {isAlmostFull && <span className="badge text-orange-400 bg-orange-500/10 border-orange-500/20">🔥 Almost Full</span>}
            {isSoldOut && <span className="badge text-red-400 bg-red-500/10 border-red-500/20">Sold Out</span>}
          </div>
        </div>
        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="font-display text-2xl font-bold text-zinc-50 mb-2 leading-tight">{event.title}</h3>
          <div className="flex items-center gap-4 text-sm text-zinc-400">
            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{event.city}</span>
            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{formatDateTime(event.starts_at)}</span>
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="font-display text-xl font-bold text-accent">
              {isFree ? 'Free' : `From ${formatNaira(minPrice)}`}
            </span>
            <span className="flex items-center gap-1 text-sm text-zinc-400">
              <Users className="w-3.5 h-3.5" />{event.tickets_sold.toLocaleString()} going
            </span>
          </div>
        </div>
      </Link>
    )
  }

  // Default card
  return (
    <Link
      href={`/event/${event.slug}`}
      className={cn(
        'group card-hover flex flex-col overflow-hidden',
        className
      )}
    >
      {/* Image */}
      <div className={cn('relative h-48 bg-gradient-to-br', gradient)}>
        {event.cover_image && (
          <Image src={event.cover_image} alt={event.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        )}
        {!event.cover_image && (
          <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-50">{meta.emoji}</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 to-transparent" />
        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <span className={cn('badge text-xs', meta.color)}>{meta.emoji} {meta.label}</span>
          {isAlmostFull && !isSoldOut && (
            <span className="badge text-orange-400 bg-orange-500/15 border-orange-500/25 text-xs">🔥 {100 - soldOutPct}% left</span>
          )}
          {isSoldOut && (
            <span className="badge text-zinc-400 bg-zinc-800 border-zinc-700 text-xs">Sold Out</span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4">
        <p className="font-display text-base font-bold text-zinc-100 leading-snug mb-2 group-hover:text-accent transition-colors">
          {event.title}
        </p>
        <p className="text-xs text-zinc-500 leading-relaxed mb-3 flex-1">
          {truncate(event.description, 90)}
        </p>

        {/* Meta */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <MapPin className="w-3 h-3 text-zinc-600 flex-shrink-0" />
            <span className="truncate">{event.venue_name}, {event.city}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Calendar className="w-3 h-3 text-zinc-600 flex-shrink-0" />
            <span>{formatDateTime(event.starts_at)}</span>
          </div>
        </div>

        {/* Capacity bar */}
        {!isSoldOut && (
          <div className="mb-3">
            <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all', soldOutPct >= 80 ? 'bg-orange-500' : 'bg-accent')}
                style={{ width: `${Math.min(soldOutPct, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
          <div>
            <p className="font-display text-base font-bold text-accent">
              {isFree ? 'Free' : `From ${formatNaira(minPrice)}`}
            </p>
            <p className="text-xs text-zinc-600">
              {isSoldOut ? 'No tickets available' : `${(event.capacity - event.tickets_sold).toLocaleString()} left`}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center group-hover:bg-accent/20 group-hover:text-accent transition-all">
            <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-accent transition-colors" />
          </div>
        </div>
      </div>
    </Link>
  )
}

// Skeleton loader
export function EventCardSkeleton({ variant = 'default' }: { variant?: 'default' | 'featured' }) {
  if (variant === 'featured') {
    return <div className="rounded-synlo-lg h-72 shimmer" />
  }
  return (
    <div className="card overflow-hidden">
      <div className="h-48 shimmer" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 skeleton" />
        <div className="h-3 w-full skeleton" />
        <div className="h-3 w-1/2 skeleton" />
        <div className="h-8 w-full skeleton mt-2" />
      </div>
    </div>
  )
}
