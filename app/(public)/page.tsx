// app/(public)/page.tsx
import Link from 'next/link'
import { ArrowRight, Ticket, Users, BarChart3, Zap, Star, Shield, Globe } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { EventCard } from '@/components/events/EventCard'
import { formatNaira, CATEGORY_META, NIGERIAN_CITIES } from '@/lib/utils'

async function getFeaturedEvents() {
  const supabase = createClient()
  const { data } = await supabase
    .from('events')
    .select('*, ticket_tiers(*), organizer:users(full_name, avatar_url)')
    .eq('status', 'published')
    .eq('is_private', false)
    .order('tickets_sold', { ascending: false })
    .limit(9)
  return data || []
}

async function getStats() {
  const supabase = createClient()
  const [{ count: eventsCount }, { count: ticketsCount }, { count: usersCount }] = await Promise.all([
    supabase.from('events').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('users').select('id', { count: 'exact', head: true }),
  ])
  return {
    events: eventsCount || 0,
    tickets: ticketsCount || 0,
    users: usersCount || 0,
  }
}

export default async function HomePage() {
  const [events, stats] = await Promise.all([getFeaturedEvents(), getStats()])
  const featuredEvent = events[0]
  const gridEvents = events.slice(1, 7)

  return (
    <div className="noise">
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden pt-20 pb-16 px-4">
        {/* Background effects */}
        <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Live badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/25 bg-accent/8 text-accent text-xs font-semibold uppercase tracking-wider mb-8 animate-fade-up">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse-dot" />
          🇳🇬 Nigeria's #1 Event Platform
        </div>

        {/* Headline */}
        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold leading-[1.02] tracking-[-0.04em] max-w-5xl mb-6 animate-fade-up delay-100">
          Where your{' '}
          <span className="bg-gradient-to-r from-accent via-orange-400 to-amber-400 bg-clip-text text-transparent">
            vibe
          </span>
          <br className="hidden sm:block" />
          {' '}finds its match
        </h1>

        <p className="text-zinc-400 text-lg sm:text-xl max-w-2xl leading-relaxed mb-10 font-light animate-fade-up delay-200">
          Discover events, buy tickets securely, earn as an affiliate, and meet
          your plus-one — all in one place. Built for Nigeria.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center mb-16 animate-fade-up delay-300">
          <Link href="/explore" className="btn btn-primary btn-xl gap-3">
            Explore Events <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/organizer/create" className="btn btn-ghost btn-xl">
            Create an Event
          </Link>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 animate-fade-up delay-400">
          {[
            { value: `${stats.events.toLocaleString()}+`, label: 'Events listed' },
            { value: `${stats.tickets.toLocaleString()}+`, label: 'Tickets sold' },
            { value: `${stats.users.toLocaleString()}+`, label: 'People on Synlo' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <p className="font-display text-2xl sm:text-3xl font-black text-zinc-100">{stat.value}</p>
              <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-zinc-600 animate-bounce">
          <span className="text-xs uppercase tracking-widest">scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-zinc-600 to-transparent" />
        </div>
      </section>

      {/* ── FEATURED EVENT ── */}
      {featuredEvent && (
        <section className="section bg-zinc-950/50">
          <div className="page-container">
            <div className="section-label text-center">Featured</div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-center mb-12">Don't miss this</h2>
            <EventCard event={featuredEvent} variant="featured" className="max-w-4xl mx-auto" />
          </div>
        </section>
      )}

      {/* ── EVENT GRID ── */}
      {gridEvents.length > 0 && (
        <section className="section">
          <div className="page-container">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="section-label">Upcoming</div>
                <h2 className="font-display text-3xl sm:text-4xl font-bold">Events near you</h2>
              </div>
              <Link href="/explore" className="btn btn-ghost btn-sm hidden sm:flex">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {gridEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
            <div className="mt-8 text-center sm:hidden">
              <Link href="/explore" className="btn btn-ghost btn-md">View all events <ArrowRight className="w-4 h-4" /></Link>
            </div>
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="section bg-zinc-950/60 border-y border-zinc-800/40">
        <div className="page-container">
          <div className="text-center mb-16">
            <div className="section-label">How it works</div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold">Your event journey, simplified</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '01', icon: '🔍', title: 'Discover', desc: 'Browse hundreds of curated events across Nigeria, filtered by city, category, and price.' },
              { step: '02', icon: '🎟️', title: 'Buy Securely', desc: 'Get your ticket in seconds. Pay with card, bank transfer, or USSD. Secured by Flutterwave.' },
              { step: '03', icon: '📲', title: 'Get Your QR', desc: 'Receive a unique QR code ticket instantly. Show it at the door. No printing needed.' },
              { step: '04', icon: '🤝', title: 'Connect', desc: 'Find a plus-one, meet other attendees, build real connections. That\'s the Synlo difference.' },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="relative">
                <div className="card p-6 h-full hover:border-zinc-700 transition-colors">
                  <div className="text-3xl mb-4">{icon}</div>
                  <p className="font-display font-bold text-zinc-100 mb-2">{title}</p>
                  <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                  <span className="font-mono text-xs font-bold text-zinc-400">{step}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR ORGANISERS ── */}
      <section id="organisers" className="section">
        <div className="page-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="section-label">For Organisers</div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-6">
                Everything you need to run a great event
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-8 text-lg font-light">
                From ticket tiers to affiliate programs, real-time analytics to door verification — Synlo gives you the full infrastructure.
              </p>
              <div className="space-y-4 mb-10">
                {[
                  { icon: <BarChart3 className="w-5 h-5" />, title: 'Real-time analytics', desc: 'Track revenue, ticket sales, and attendee data live.' },
                  { icon: <Users className="w-5 h-5" />, title: 'Built-in affiliate system', desc: 'Let others promote your event for a commission.' },
                  { icon: <Shield className="w-5 h-5" />, title: 'QR door verification', desc: 'Assign verifiers and scan tickets from any phone.' },
                  { icon: <Globe className="w-5 h-5" />, title: 'Viral sharing tools', desc: 'One-click sharing to WhatsApp, Instagram, Twitter.' },
                ].map(({ icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-synlo-sm bg-accent/10 border border-accent/20 flex items-center justify-center text-accent flex-shrink-0">
                      {icon}
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-100 text-sm mb-0.5">{title}</p>
                      <p className="text-sm text-zinc-500">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/organizer/create" className="btn btn-primary btn-lg">
                Create Your Event <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Pricing card */}
            <div className="card p-8 relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent" />
              <div className="section-label">Transparent Pricing</div>
              <h3 className="font-display text-2xl font-bold mb-8">Simple, fair fee structure</h3>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-4 rounded-synlo bg-zinc-800/50 border border-zinc-700/50">
                  <div>
                    <p className="font-semibold text-zinc-100">Ticket price</p>
                    <p className="text-sm text-zinc-500">You set this — all goes to you</p>
                  </div>
                  <p className="font-display text-xl font-bold text-zinc-100">₦10,000</p>
                </div>
                <div className="flex items-center justify-between p-4 rounded-synlo bg-zinc-800/50 border border-zinc-700/50">
                  <div>
                    <p className="font-semibold text-zinc-400">Platform fee</p>
                    <p className="text-sm text-zinc-600">Paid by buyer, not you</p>
                  </div>
                  <p className="font-display text-xl font-bold text-accent">₦1,000</p>
                </div>
                <div className="flex items-center justify-between p-4 rounded-synlo bg-accent/8 border border-accent/20">
                  <div>
                    <p className="font-semibold text-zinc-100">Buyer pays total</p>
                    <p className="text-sm text-accent/70">You receive ₦10,000</p>
                  </div>
                  <p className="font-display text-2xl font-black text-accent">₦11,000</p>
                </div>
              </div>
              <p className="text-xs text-zinc-600 text-center">
                10% platform fee is added on top of your ticket price — you always get your full amount.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="section bg-zinc-950/60 border-y border-zinc-800/40">
        <div className="page-container">
          <div className="text-center mb-12">
            <div className="section-label">Browse by Category</div>
            <h2 className="font-display text-3xl font-bold">Find your vibe</h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {Object.entries(CATEGORY_META).map(([key, { label, emoji, color }]) => (
              <Link
                key={key}
                href={`/explore?category=${key}`}
                className="card-hover flex flex-col items-center gap-2 p-4 text-center"
              >
                <span className="text-2xl">{emoji}</span>
                <span className={`text-xs font-semibold ${color.split(' ')[0]}`}>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ── */}
      <section className="section">
        <div className="page-container">
          <div className="relative overflow-hidden rounded-synlo-xl border border-zinc-800 bg-zinc-900 p-10 sm:p-16 text-center">
            <div className="absolute inset-0 bg-hero-glow opacity-60" />
            <div className="relative">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-accent fill-accent" />
              </div>
              <h2 className="font-display text-3xl sm:text-5xl font-black mb-4">Ready to find your vibe?</h2>
              <p className="text-zinc-400 max-w-lg mx-auto mb-8 text-lg font-light">
                Join thousands of Nigerians already discovering events, buying tickets, and making memories on Synlo.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/signup" className="btn btn-primary btn-xl">
                  Join Synlo Free <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/explore" className="btn btn-ghost btn-xl">Browse Events</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
