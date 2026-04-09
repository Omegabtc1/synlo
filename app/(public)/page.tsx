// app/(public)/page.tsx
import Link from 'next/link'
import {
  ArrowRight, Search, MapPin, Calendar, Users,
  BarChart3, Shield, Globe, TrendingUp, Zap, CheckCircle2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { EventCard } from '@/components/events/EventCard'
import { HeroSearch } from '@/components/landing/HeroSearch'
import { CATEGORY_META, formatNaira } from '@/lib/utils'

// ─── Data fetching ────────────────────────────────────────────────────────────

async function getTrendingEvents() {
  const supabase = createClient()
  const { data } = await supabase
    .from('events')
    .select('*, ticket_tiers(*), organizer:users(full_name)')
    .eq('status', 'published')
    .eq('is_private', false)
    .gte('starts_at', new Date().toISOString())
    .order('tickets_sold', { ascending: false })
    .limit(8)
  return data || []
}

async function getPlatformStats() {
  const supabase = createClient()
  const [{ count: events }, { count: tickets }, { count: users }] = await Promise.all([
    supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('tickets').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }),
  ])
  return { events: events ?? 0, tickets: tickets ?? 0, users: users ?? 0 }
}

// ─── Placeholder cards shown before any real events exist ─────────────────────

const PLACEHOLDER_EVENTS = [
  { title: 'Tech Summit 2025', city: 'San Francisco', date: 'May 12', price: '$45', cat: 'Tech', emoji: '💻', g: 'from-violet-100 to-indigo-50' },
  { title: 'Summer Music Festival', city: 'London', date: 'Jun 7', price: '£35', cat: 'Music', emoji: '🎵', g: 'from-rose-100 to-pink-50' },
  { title: 'Creative Arts Expo', city: 'Lagos', date: 'May 28', price: '₦5,000', cat: 'Arts', emoji: '🎨', g: 'from-purple-100 to-violet-50' },
  { title: 'Startup Networking Night', city: 'New York', date: 'May 15', price: '$25', cat: 'Business', emoji: '🤝', g: 'from-emerald-100 to-teal-50' },
  { title: 'Food & Wine Festival', city: 'Paris', date: 'Jun 14', price: '€55', cat: 'Food', emoji: '🍷', g: 'from-amber-100 to-yellow-50' },
  { title: 'Stand-Up Comedy Night', city: 'Abuja', date: 'May 22', price: '₦8,000', cat: 'Comedy', emoji: '😂', g: 'from-orange-100 to-amber-50' },
  { title: 'Campus Hackathon 2025', city: 'Nairobi', date: 'Jun 3', price: 'Free', cat: 'Campus', emoji: '⌨️', g: 'from-sky-100 to-blue-50' },
  { title: 'Sports & Fitness Expo', city: 'Dubai', date: 'Jun 19', price: '$30', cat: 'Sports', emoji: '🏃', g: 'from-green-100 to-emerald-50' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const [events, stats] = await Promise.all([getTrendingEvents(), getPlatformStats()])
  const hasEvents = events.length > 0

  return (
    <div className="overflow-x-hidden">

      {/* ══════════════════════════════════════════
          HERO
          White background, clean typography,
          search bar is the primary action
      ══════════════════════════════════════════ */}
      <section className="relative bg-[var(--color-bg)] pt-[96px] pb-[72px] overflow-hidden">

        {/* Subtle warm radial behind content */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background: `
              radial-gradient(ellipse 65% 50% at 50% 100%, rgba(232,65,10,0.055) 0%, transparent 70%),
              radial-gradient(ellipse 40% 30% at 80% 20%, rgba(249,115,22,0.04) 0%, transparent 60%)
            `,
          }}
        />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.018]"
          aria-hidden="true"
          style={{
            backgroundImage: `
              linear-gradient(var(--color-text) 1px, transparent 1px),
              linear-gradient(90deg, var(--color-text) 1px, transparent 1px)
            `,
            backgroundSize: '64px 64px',
          }}
        />

        <div className="wrap relative">
          <div className="max-w-[760px] mx-auto text-center">

            {/* Eyebrow pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[var(--color-border)] shadow-sm mb-7 animate-fade-up">
              <span
                className="w-2 h-2 rounded-full bg-[var(--color-accent)]"
                style={{ boxShadow: '0 0 0 3px rgba(232,65,10,0.18)' }}
              />
              <span className="text-xs font-semibold text-[var(--color-text-2)] tracking-wide">
                Tickets for every kind of event, worldwide
              </span>
            </div>

            {/* Headline */}
            <h1
              className="animate-fade-up delay-75"
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: 'clamp(40px, 7vw, 76px)',
                lineHeight: 1.04,
                letterSpacing: '-0.042em',
                color: 'var(--color-text)',
              }}
            >
              Find experiences
              <br />
              <span
                style={{
                  background: 'linear-gradient(135deg, #e8410a 10%, #f97316 55%, #e8410a 100%)',
                  backgroundSize: '200% auto',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'gradientShift 6s ease infinite',
                }}
              >
                worth showing up for.
              </span>
            </h1>

            <style>{`
              @keyframes gradientShift {
                0%, 100% { background-position: 0% center; }
                50%       { background-position: 100% center; }
              }
            `}</style>

            <p
              className="mt-5 mb-10 text-[1.0625rem] leading-[1.7] animate-fade-up delay-150"
              style={{ color: 'var(--color-text-2)' }}
            >
              Discover concerts, conferences, festivals, and more.
              Buy tickets in seconds — no hidden surprises.
            </p>

            {/* Search bar — the real CTA */}
            <div className="animate-fade-up delay-200">
              <HeroSearch />
            </div>

            {/* Quick category pills below search */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-5 animate-fade-up delay-300">
              <span className="text-xs text-[var(--color-text-3)] font-medium mr-1">Trending:</span>
              {['Music', 'Tech', 'Food', 'Sports', 'Comedy', 'Arts'].map(cat => (
                <Link
                  key={cat}
                  href={`/explore?category=${cat.toLowerCase()}`}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-[var(--color-border)] text-[var(--color-text-2)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-bg)] transition-all duration-150 shadow-sm"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          SOCIAL PROOF BAR
          Numbers only — no copy fluff
      ══════════════════════════════════════════ */}
      <div className="bg-white border-y border-[var(--color-border)]">
        <div className="wrap">
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 py-5">
            {[
              { n: stats.events > 10 ? `${stats.events.toLocaleString()}+` : '10,000+', label: 'events listed' },
              { n: stats.tickets > 100 ? `${stats.tickets.toLocaleString()}+` : '500,000+', label: 'tickets sold' },
              { n: stats.users > 100 ? `${stats.users.toLocaleString()}+` : '200,000+', label: 'people attending' },
              { n: '80+', label: 'cities worldwide' },
            ].map(({ n, label }) => (
              <div key={label} className="flex items-baseline gap-2">
                <span
                  className="text-[1.5rem] font-extrabold tracking-tight"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}
                >
                  {n}
                </span>
                <span className="text-sm text-[var(--color-text-3)]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* ══════════════════════════════════════════
          TRENDING EVENTS
          Horizontal scroll on mobile, grid on desktop
      ══════════════════════════════════════════ */}
      <section className="py-[72px] bg-[var(--color-bg)]">
        <div className="wrap">

          {/* Section header */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-[0.15em] mb-2">
                Trending now
              </p>
              <h2
                className="text-[2rem] sm:text-[2.5rem] tracking-tight"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.04em' }}
              >
                What's happening
              </h2>
            </div>
            <Link
              href="/explore"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-text-2)] hover:text-[var(--color-text)] group transition-colors"
            >
              Browse all
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Event grid or placeholder */}
          {hasEvents ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {events.map((event, i) => (
                <div key={event.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {PLACEHOLDER_EVENTS.map((e, i) => (
                <Link
                  key={i}
                  href="/explore"
                  className="group bg-white rounded-[var(--radius-lg)] border border-[var(--color-border)] overflow-hidden hover:border-[var(--color-border-2)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-200"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {/* Image area */}
                  <div className={`relative h-44 bg-gradient-to-br ${e.g} flex items-center justify-center overflow-hidden`}>
                    <span className="text-5xl opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-400 select-none">
                      {e.emoji}
                    </span>
                    {/* Category badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur-sm text-[var(--color-text)] border border-white/60 shadow-sm">
                        {e.cat}
                      </span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-4">
                    <p className="font-semibold text-[var(--color-text)] text-[0.9375rem] leading-snug mb-2.5 group-hover:text-[var(--color-accent)] transition-colors">
                      {e.title}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-[var(--color-text-3)]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {e.city}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {e.date}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--color-border)]">
                      <span
                        className="font-extrabold text-[0.9375rem]"
                        style={{ fontFamily: 'var(--font-display)', color: 'var(--color-accent)' }}
                      >
                        {e.price}
                      </span>
                      <span className="text-xs font-medium text-[var(--color-text-3)]">Get tickets →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Mobile view all */}
          <div className="mt-8 text-center sm:hidden">
            <Link href="/explore" className="btn btn-outline btn-md">
              Browse all events <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          CATEGORY BROWSER
          Clean icon grid — visual, scannable
      ══════════════════════════════════════════ */}
      <section className="py-[64px] bg-white border-y border-[var(--color-border)]">
        <div className="wrap">
          <div className="text-center mb-10">
            <h2
              className="text-[1.75rem] sm:text-[2.25rem] tracking-tight"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.04em' }}
            >
              Browse by category
            </h2>
            <p className="mt-2 text-sm text-[var(--color-text-3)]">
              Whatever you're into, there's an event for you
            </p>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-11 gap-2.5">
            {Object.entries(CATEGORY_META).map(([key, { label, emoji }]) => (
              <Link
                key={key}
                href={`/explore?category=${key}`}
                className="group flex flex-col items-center gap-2 p-3.5 rounded-xl bg-[var(--color-bg)] border border-transparent hover:bg-white hover:border-[var(--color-border)] hover:shadow-sm transition-all duration-150 text-center"
              >
                <span className="text-[1.625rem] group-hover:scale-110 transition-transform duration-200">
                  {emoji}
                </span>
                <span className="text-[11px] font-semibold text-[var(--color-text-3)] group-hover:text-[var(--color-text)] transition-colors leading-tight">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          FOR ORGANISERS
          Two-column. Benefit list left,
          clean feature visual right.
          NO pricing, NO fee details.
      ══════════════════════════════════════════ */}
      <section id="organisers" className="py-[88px] bg-[var(--color-bg)]">
        <div className="wrap">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left — copy */}
            <div>
              <p className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-[0.15em] mb-4">
                For organisers
              </p>
              <h2
                className="text-[2rem] sm:text-[2.75rem] leading-[1.08] tracking-tight mb-5"
                style={{ fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.04em' }}
              >
                Everything you need
                <br />
                to sell out your event.
              </h2>
              <p className="text-[1rem] text-[var(--color-text-2)] leading-[1.75] mb-9 max-w-md">
                From the first ticket sale to the final check-in, Synlo gives organisers
                the tools to create, grow, and manage any event — anywhere in the world.
              </p>

              {/* Benefits */}
              <ul className="space-y-4 mb-10">
                {[
                  { icon: <TrendingUp className="w-4 h-4" />, title: 'Real-time sales dashboard', desc: 'Watch tickets sell and revenue grow as it happens.' },
                  { icon: <Users className="w-4 h-4" />, title: 'Built-in affiliate system', desc: 'Turn your audience into a distribution network.' },
                  { icon: <Shield className="w-4 h-4" />, title: 'Secure QR door check-in', desc: 'Assign staff. Scan tickets. Stop fraud instantly.' },
                  { icon: <Globe className="w-4 h-4" />, title: 'Share-ready event pages', desc: 'Beautiful pages that work across every platform.' },
                  { icon: <BarChart3 className="w-4 h-4" />, title: 'Attendee & revenue analytics', desc: 'Know your audience, plan your next event better.' },
                ].map(({ icon, title, desc }) => (
                  <li key={title} className="flex items-start gap-3.5">
                    <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-bg)] border border-[var(--color-accent-border)] flex items-center justify-center text-[var(--color-accent)] flex-shrink-0 mt-0.5">
                      {icon}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[var(--color-text)]">{title}</p>
                      <p className="text-xs text-[var(--color-text-3)] mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-3">
                <Link href="/organizer/create" className="btn btn-dark btn-lg">
                  Create your event <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/explore" className="btn btn-outline btn-lg">
                  See how it works
                </Link>
              </div>
            </div>

            {/* Right — feature visual: organiser dashboard preview */}
            <div className="relative">
              {/* Glow */}
              <div
                className="absolute -inset-8 rounded-3xl pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at center, rgba(232,65,10,0.05) 0%, transparent 70%)' }}
              />

              {/* Dashboard mockup card */}
              <div className="relative bg-white rounded-2xl border border-[var(--color-border)] shadow-[0_8px_40px_rgba(0,0,0,0.08)] overflow-hidden">

                {/* Top bar */}
                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[var(--color-border)] bg-[var(--color-bg)]">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="ml-3 text-xs text-[var(--color-text-3)] font-mono">synlo.com/organizer</span>
                </div>

                <div className="p-5">
                  <p className="text-xs font-bold text-[var(--color-text-3)] uppercase tracking-wider mb-4">Sales Overview</p>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    {[
                      { val: '1,247', lbl: 'Tickets sold', up: '+12%' },
                      { val: '$28,400', lbl: 'Revenue', up: '+8%' },
                      { val: '94%', lbl: 'Capacity', up: '' },
                    ].map(({ val, lbl, up }) => (
                      <div key={lbl} className="bg-[var(--color-bg)] rounded-xl p-3.5 border border-[var(--color-border)]">
                        <p className="font-extrabold text-[1.125rem] text-[var(--color-text)] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>{val}</p>
                        <p className="text-[10px] text-[var(--color-text-3)] mt-0.5">{lbl}</p>
                        {up && <p className="text-[10px] font-bold text-green-600 mt-0.5">{up}</p>}
                      </div>
                    ))}
                  </div>

                  {/* Mini chart bars */}
                  <div className="mb-4">
                    <p className="text-[11px] font-semibold text-[var(--color-text-3)] mb-2.5">Daily ticket sales</p>
                    <div className="flex items-end gap-1.5 h-[56px]">
                      {[35, 58, 42, 71, 89, 65, 94, 78, 100, 88, 72, 96, 84, 91].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-sm transition-all"
                          style={{
                            height: `${h}%`,
                            background: i >= 11 ? 'var(--color-accent)' : 'var(--color-border)',
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Ticket tier row */}
                  <div className="space-y-2">
                    {[
                      { name: 'General Admission', sold: 800, total: 1000, pct: 80 },
                      { name: 'VIP Access', sold: 447, total: 500, pct: 89 },
                    ].map(({ name, sold, total, pct }) => (
                      <div key={name} className="flex items-center gap-3">
                        <p className="text-xs text-[var(--color-text-2)] w-36 flex-shrink-0 truncate">{name}</p>
                        <div className="flex-1 h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[var(--color-accent)]"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-[var(--color-text-3)] w-16 text-right flex-shrink-0">
                          {sold}/{total}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 bg-white rounded-xl px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-[var(--color-border)] flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-xs font-bold text-[var(--color-text)]">Sold out in 6 hours</p>
                  <p className="text-[10px] text-[var(--color-text-3)]">Summer Music Festival</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          HOW IT WORKS
          4 steps. Clean numbered layout.
      ══════════════════════════════════════════ */}
      <section id="how-it-works" className="py-[80px] bg-white border-t border-[var(--color-border)]">
        <div className="wrap">
          <div className="text-center mb-14">
            <h2
              className="text-[1.75rem] sm:text-[2.5rem] tracking-tight"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.04em' }}
            >
              From discovery to the door
            </h2>
            <p className="mt-3 text-[var(--color-text-2)] max-w-md mx-auto text-sm leading-relaxed">
              Finding and attending events should be effortless. Here's how Synlo makes it happen.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                n: '01',
                icon: <Search className="w-5 h-5" />,
                title: 'Search & discover',
                desc: 'Browse events by category, city, or date. Filter by price. Find exactly what you\'re looking for.',
              },
              {
                n: '02',
                icon: <Calendar className="w-5 h-5" />,
                title: 'Pick your tickets',
                desc: 'Choose your tier. See real availability. No artificial urgency, no surprise fees at checkout.',
              },
              {
                n: '03',
                icon: <Zap className="w-5 h-5" />,
                title: 'Pay in seconds',
                desc: 'Card, bank transfer, or USSD. Payment is processed securely and your tickets arrive instantly.',
              },
              {
                n: '04',
                icon: <Users className="w-5 h-5" />,
                title: 'Show up & connect',
                desc: 'Your QR ticket lives in the app. Scan in, find your plus-one, enjoy the experience.',
              },
            ].map(({ n, icon, title, desc }, i) => (
              <div
                key={n}
                className="relative group animate-fade-up"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                {/* Connector line */}
                {i < 3 && (
                  <div className="hidden lg:block absolute top-[22px] left-[calc(50%+28px)] right-0 h-px bg-[var(--color-border)] z-0" />
                )}

                <div className="relative z-10 flex flex-col items-start">
                  {/* Number + icon */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-2)] group-hover:bg-[var(--color-accent)] group-hover:text-white group-hover:border-[var(--color-accent)] transition-all duration-200">
                      {icon}
                    </div>
                    <span
                      className="text-3xl font-extrabold text-[var(--color-border-2)]"
                      style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.05em' }}
                    >
                      {n}
                    </span>
                  </div>
                  <h3
                    className="text-[1rem] mb-2"
                    style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-0.02em' }}
                  >
                    {title}
                  </h3>
                  <p className="text-sm text-[var(--color-text-3)] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          FINAL CTA
          Dark section. Bold. One action.
      ══════════════════════════════════════════ */}
      <section className="py-[80px] section-dark">
        <div className="wrap">
          <div className="max-w-[620px] mx-auto text-center">
            <h2
              className="text-[2rem] sm:text-[3rem] mb-5"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.04em', color: '#f5f4f1' }}
            >
              Your next great
              <br />experience is out there.
            </h2>
            <p className="text-[#a8a29e] text-[1.0625rem] leading-relaxed mb-9 max-w-md mx-auto">
              Join hundreds of thousands of people discovering events, buying tickets, and creating
              memories on Synlo every day.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/explore" className="btn btn-primary btn-xl">
                Find an event <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/signup" className="btn btn-white btn-xl">
                Create account — it's free
              </Link>
            </div>
            {/* Trust line */}
            <p className="mt-7 text-[13px] text-[#57534e] flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" />
                Secure payments
              </span>
              <span aria-hidden>·</span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                Instant QR tickets
              </span>
              <span aria-hidden>·</span>
              <span>Free to join</span>
            </p>
          </div>
        </div>
      </section>

    </div>
  )
}
