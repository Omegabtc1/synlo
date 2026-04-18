// app/(public)/explore/page.tsx
import { Suspense } from 'react'
import Link from 'next/link'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { EventCard, EventGridSkeleton } from '@/components/events/EventCard'
import { CATEGORY_META, NIGERIAN_CITIES } from '@/lib/utils'

interface ExplorePageProps {
  searchParams: {
    q?: string
    category?: string
    city?: string
    date?: string
    sort?: string
    page?: string
  }
}

function buildSearchUrl(params: Record<string, string | undefined>) {
  const url = new URL('/explore', 'http://localhost:3000')
  Object.entries(params).forEach(([key, value]) => {
    if (value && value !== 'all') url.searchParams.set(key, value)
  })
  return url.pathname + url.search
}

function ActiveFilters({ searchParams }: ExplorePageProps) {
  const activeFilters = []

  if (searchParams.q) activeFilters.push({ key: 'q', label: `Search: "${searchParams.q}"` })
  if (searchParams.category) activeFilters.push({ key: 'category', label: `${CATEGORY_META[searchParams.category]?.emoji} ${CATEGORY_META[searchParams.category]?.label}` })
  if (searchParams.city) activeFilters.push({ key: 'city', label: `📍 ${searchParams.city}` })
  if (searchParams.date && searchParams.date !== 'all') {
    const dateLabels = { today: 'Today', 'this-week': 'This Week', 'this-month': 'This Month' }
    activeFilters.push({ key: 'date', label: `📅 ${dateLabels[searchParams.date as keyof typeof dateLabels] || searchParams.date}` })
  }

  if (activeFilters.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <span className="text-sm text-zinc-500">Active filters:</span>
      {activeFilters.map(({ key, label }) => (
        <Link
          key={key}
          href={buildSearchUrl({ ...searchParams, [key]: undefined })}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-300 text-xs hover:bg-zinc-700 transition-colors"
        >
          {label}
          <X className="w-3 h-3" />
        </Link>
      ))}
      <Link
        href="/explore"
        className="text-xs text-accent hover:text-orange-400 transition-colors"
      >
        Clear all
      </Link>
    </div>
  )
}

async function EventResults({ searchParams }: ExplorePageProps) {
  const supabase = createClient()
  const page = parseInt(searchParams.page || '1')
  const limit = 24
  const offset = (page - 1) * limit

  let query = supabase
    .from('events')
    .select('*, ticket_tiers(*), organizer:users(full_name)')
    .eq('status', 'published')
    .eq('is_private', false)

  // Search filter
  if (searchParams.q) {
    query = query.or(`title.ilike.%${searchParams.q}%,description.ilike.%${searchParams.q}%,city.ilike.%${searchParams.q}%`)
  }

  // Category filter
  if (searchParams.category) {
    query = query.eq('category', searchParams.category)
  }

  // City filter
  if (searchParams.city) {
    query = query.eq('city', searchParams.city)
  }

  // Date filter
  if (searchParams.date) {
    const now = new Date()
    let startDate: Date
    let endDate: Date

    switch (searchParams.date) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
        break
      case 'this-week':
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - now.getDay())
        weekStart.setHours(0, 0, 0, 0)
        startDate = weekStart
        endDate = new Date(weekStart)
        endDate.setDate(startDate.getDate() + 7)
        break
      case 'this-month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
        break
      default:
        startDate = new Date(0)
        endDate = new Date(9999, 11, 31)
    }

    query = query.gte('starts_at', startDate.toISOString()).lt('starts_at', endDate.toISOString())
  }

  // Sorting
  const sortMap = {
    'popular': { col: 'tickets_sold', asc: false },
    'price-low': { col: 'ticket_tiers.price', asc: true },
    'price-high': { col: 'ticket_tiers.price', asc: false },
    'date': { col: 'starts_at', asc: true },
  }
  const sort = sortMap[searchParams.sort as keyof typeof sortMap] || sortMap.date
  query = query.order(sort.col, { ascending: sort.asc })

  // Pagination
  query = query.range(offset, offset + limit - 1)

  const { data: events = [], error } = await query

  if (error) {
    console.error('Error fetching events:', error)
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500">Failed to load events. Please try again.</p>
      </div>
    )
  }

  if (!events.length) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="font-display text-xl font-bold mb-2">No events found</h3>
        <p className="text-zinc-500 mb-6">Try adjusting your filters or search terms.</p>
        <Link href="/explore" className="btn btn-outline">
          Clear all filters
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {/* Pagination */}
      {events.length === limit && (
        <div className="text-center mt-12">
          <Link
            href={buildSearchUrl({ ...searchParams, page: (page + 1).toString() })}
            className="btn btn-outline"
          >
            Load more events
          </Link>
        </div>
      )}
    </>
  )
}

export default function ExplorePage({ searchParams }: ExplorePageProps) {
  return (
    <div className="min-h-screen">
      {/* Filter bar */}
      <div className="sticky top-16 z-10 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800">
        <div className="page-container py-6">
          <form method="GET" className="flex flex-col lg:flex-row gap-4">
            {/* Search input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                name="q"
                placeholder="Search events, venues, cities..."
                defaultValue={searchParams.q || ''}
                className="input pl-10 w-full"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <select name="category" defaultValue={searchParams.category || ''} className="input">
                <option value="">All Categories</option>
                {Object.entries(CATEGORY_META).map(([key, meta]) => (
                  <option key={key} value={key}>{meta.emoji} {meta.label}</option>
                ))}
              </select>

              <select name="city" defaultValue={searchParams.city || ''} className="input">
                <option value="">All Cities</option>
                {NIGERIAN_CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>

              <select name="date" defaultValue={searchParams.date || ''} className="input">
                <option value="">All Dates</option>
                <option value="today">Today</option>
                <option value="this-week">This Week</option>
                <option value="this-month">This Month</option>
              </select>

              <select name="sort" defaultValue={searchParams.sort || 'date'} className="input">
                <option value="date">Date</option>
                <option value="popular">Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>

              <button type="submit" className="btn btn-primary">
                <SlidersHorizontal className="w-4 h-4" />
                Filter
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="page-container py-8">
        <ActiveFilters searchParams={searchParams} />

        <div className="flex items-center justify-between mb-8">
          <p className="text-zinc-500">
            {/* This would show actual count in a real implementation */}
            Showing events
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500">Sort by:</span>
            <select
              value={searchParams.sort || 'date'}
              onChange={(e) => {
                const url = buildSearchUrl({ ...searchParams, sort: e.target.value })
                window.location.href = url
              }}
              className="input text-sm"
            >
              <option value="date">Date</option>
              <option value="popular">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        <Suspense fallback={<EventGridSkeleton />}>
          <EventResults searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  )
}
