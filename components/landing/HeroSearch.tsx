'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, ChevronDown } from 'lucide-react'
import { NIGERIAN_CITIES } from '@/lib/utils'

// Broader city list for a global platform
const ALL_CITIES = [
  // Africa
  'Lagos', 'Abuja', 'Port Harcourt', 'Accra', 'Nairobi', 'Cairo', 'Johannesburg',
  'Cape Town', 'Dar es Salaam', 'Kampala', 'Addis Ababa', 'Casablanca', 'Tunis',
  // Europe
  'London', 'Paris', 'Berlin', 'Madrid', 'Amsterdam', 'Rome', 'Lisbon', 'Dublin',
  // Americas
  'New York', 'Los Angeles', 'Toronto', 'Miami', 'Chicago', 'São Paulo',
  // Asia / Middle East
  'Dubai', 'Doha', 'Riyadh', 'Mumbai', 'Singapore', 'Tokyo',
]

export function HeroSearch() {
  const [query, setQuery] = useState('')
  const [city, setCity] = useState('')
  const [cityOpen, setCityOpen] = useState(false)
  const [citySearch, setCitySearch] = useState('')
  const router = useRouter()
  const dropRef = useRef<HTMLDivElement>(null)

  const filtered = citySearch
    ? ALL_CITIES.filter(c => c.toLowerCase().includes(citySearch.toLowerCase()))
    : ALL_CITIES

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setCityOpen(false)
        setCitySearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (city) params.set('city', city)
    router.push(`/explore${params.toString() ? `?${params}` : ''}`)
  }

  return (
    <form
      onSubmit={handleSearch}
      className="relative flex flex-col sm:flex-row gap-0 bg-white rounded-2xl border border-[var(--color-border)] shadow-[0_4px_24px_rgba(0,0,0,0.08)] overflow-visible max-w-[660px] mx-auto"
      role="search"
      aria-label="Search events"
    >
      {/* Search input */}
      <div className="flex items-center flex-1 px-4 py-0 gap-3">
        <Search className="w-4 h-4 text-[var(--color-text-3)] flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search events, artists, venues…"
          className="flex-1 py-4 bg-transparent outline-none text-[0.9375rem] text-[var(--color-text)] placeholder:text-[var(--color-text-3)] font-medium"
          aria-label="Search query"
          autoComplete="off"
        />
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px h-10 self-center bg-[var(--color-border)]" aria-hidden />

      {/* City selector */}
      <div ref={dropRef} className="relative sm:w-[180px] flex-shrink-0">
        <button
          type="button"
          onClick={() => { setCityOpen(!cityOpen); setCitySearch('') }}
          className="w-full flex items-center gap-2 px-4 py-4 text-left text-[0.875rem] font-medium text-[var(--color-text-2)] hover:text-[var(--color-text)] transition-colors"
          aria-label="Select city"
          aria-expanded={cityOpen}
          aria-haspopup="listbox"
        >
          <MapPin className="w-4 h-4 text-[var(--color-text-3)] flex-shrink-0" />
          <span className="flex-1 truncate">{city || 'Any location'}</span>
          <ChevronDown className={`w-4 h-4 text-[var(--color-text-3)] transition-transform flex-shrink-0 ${cityOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown */}
        {cityOpen && (
          <div
            className="absolute top-full left-0 right-0 sm:left-auto sm:right-0 sm:w-[220px] mt-2 bg-white rounded-xl border border-[var(--color-border)] shadow-[0_8px_32px_rgba(0,0,0,0.1)] z-50 overflow-hidden animate-scale-in"
            role="listbox"
            aria-label="Select city"
          >
            {/* Search within cities */}
            <div className="p-2 border-b border-[var(--color-border)]">
              <input
                type="text"
                value={citySearch}
                onChange={e => setCitySearch(e.target.value)}
                placeholder="Search cities…"
                className="w-full px-3 py-2 text-sm bg-[var(--color-bg)] rounded-lg outline-none text-[var(--color-text)] placeholder:text-[var(--color-text-3)]"
                autoFocus
              />
            </div>

            {/* City list */}
            <div className="max-h-[220px] overflow-y-auto">
              {/* Clear option */}
              <button
                type="button"
                onClick={() => { setCity(''); setCityOpen(false); setCitySearch('') }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-[var(--color-bg)] ${!city ? 'text-[var(--color-accent)] font-semibold' : 'text-[var(--color-text-2)]'}`}
                role="option"
                aria-selected={!city}
              >
                Any location
              </button>

              {filtered.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => { setCity(c); setCityOpen(false); setCitySearch('') }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-[var(--color-bg)] ${city === c ? 'text-[var(--color-accent)] font-semibold bg-[var(--color-accent-bg)]' : 'text-[var(--color-text-2)]'}`}
                  role="option"
                  aria-selected={city === c}
                >
                  {c}
                </button>
              ))}

              {filtered.length === 0 && (
                <p className="px-4 py-4 text-sm text-[var(--color-text-3)] text-center">
                  No cities found
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="p-2 flex-shrink-0">
        <button
          type="submit"
          className="w-full sm:w-auto h-full sm:h-auto btn btn-primary btn-lg rounded-xl px-6 py-3 text-sm"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
          <span>Search</span>
        </button>
      </div>
    </form>
  )
}
