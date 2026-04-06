// app/(public)/explore/page.tsx
import { Suspense } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { EventCard, EventCardSkeleton } from '@/components/events/EventCard'
import { CATEGORY_META, NIGERIAN_CITIES } from '@/lib/utils'

interface ExplorePageProps {
  searchParams: {
    q?: string
    category?: string
    city?: string
    date?: string
    sort?: string
  }
}

async function EventResults({ searchParams }: ExplorePageProps) {
  const supabase = createClient()
  let query = supabase
    .from('events')
    .select('*, ticket_tiers(*), organizer:users(full_name)')
    .eq('status', 'published')
    .eq('is_private', false)

  if (searchParams.q) {
    query = query.or(`title.ilike.%${searchParams.q}%,description.ilike.%${searchParams.q}%`)
  }
  if (searchParams.category) {
    query = query.eq('category', searchParams.category)
  }
  if (searchParams.city) {
    query = query.eq('city', searchParams.city)
  }

  const sortField = searchParams.sort === 'popular' ? 'tickets_sold' : 'starts_at'
  query = query.order(sortField, { ascending: sortField === 'starts_at' }).limit(24)

  const { data: events = [] } = await query

  if (!events.length) {
    return (
      <div className="text-center py-24">
        <p className="text-5xl mb-4">🔍</p>
        <p className="font-display text-xl font-bold text-zinc-300 mb-2">No events found</p>
        <p className="text-zinc-500">Try adjusting your search or filters</p>
      </div>
    )
  }

  return (
    <>
      <p className="text-sm text-zinc-500 mb-5">{events.length} event{events.length !== 1 ? 's' : ''} found</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {events.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </>
  )
}

export default function ExplorePage({ searchParams }: ExplorePageProps) {
  const activeFilters = [searchParams.q, searchParams.category, searchParams.city].filter(Boolean).length

  return (
    <div className="pt-20 min-h-screen">
      {/* Header */}
      <div className="border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-sm sticky top-16 z-30">
        <div className="page-container py-4">
          <form method="GET" className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                name="q"
                defaultValue={searchParams.q}
                placeholder="Search events, artists, venues…"
                className="input pl-10"
              />
            </div>
            {/* Category */}
            <select name="category" defaultValue={searchParams.category || ''} className="input w-full sm:w-44">
              <option value="">All Categories</option>
              {Object.entries(CATEGORY_META).map(([key, { label, emoji }]) => (
                <option key={key} value={key}>{emoji} {label}</option>
              ))}
            </select>
            {/* City */}
            <select name="city" defaultValue={searchParams.city || ''} className="input w-full sm:w-44">
              <option value="">All Cities</option>
              {NIGERIAN_CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            {/* Sort */}
            <select name="sort" defaultValue={searchParams.sort || 'date'} className="input w-full sm:w-36">
              <option value="date">By Date</option>
              <option value="popular">Most Popular</option>
            </select>
            <button type="submit" className="btn btn-primary btn-md whitespace-nowrap">
              <SlidersHorizontal className="w-4 h-4" /> Filter
            </button>
          </form>
          {/* Active filter pills */}
          {activeFilters > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {searchParams.q && (
                <span className="badge text-zinc-300 bg-zinc-800 border-zinc-700">
                  Search: "{searchParams.q}"
                </span>
              )}
              {searchParams.category && (
                <span className="badge text-zinc-300 bg-zinc-800 border-zinc-700">
                  {CATEGORY_META[searchParams.category]?.emoji} {CATEGORY_META[searchParams.category]?.label}
                </span>
              )}
              {searchParams.city && (
                <span className="badge text-zinc-300 bg-zinc-800 border-zinc-700">
                  📍 {searchParams.city}
                </span>
              )}
              <a href="/explore" className="badge text-red-400 bg-red-500/10 border-red-500/20 cursor-pointer hover:bg-red-500/20 transition-colors">
                ✕ Clear all
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="page-container py-8">
        <Suspense fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <EventCardSkeleton key={i} />)}
          </div>
        }>
          <EventResults searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  )
}
