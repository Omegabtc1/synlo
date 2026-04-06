// app/(public)/page.tsx
import Link from 'next/link'
import { ArrowRight, Search, MapPin, Calendar, Users, Zap, Shield, BarChart3, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { CATEGORY_META } from '@/lib/utils'

// ─── Data fetching ────────────────────────────────────────────
async function getEvents() {
  const supabase = createClient()
  const { data } = await supabase
    .from('events')
    .select('*, ticket_tiers(*)')
    .eq('status', 'published')
    .eq('is_private', false)
    .order('starts_at', { ascending: true })
    .limit(8)
  return data ?? []
}

async function getStats() {
  const supabase = createClient()
  const [{ count: events }, { count: tickets }, { count: users }] = await Promise.all([
    supabase.from('events').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('tickets').select('id', { count: 'exact', head: true }),
    supabase.from('users').select('id', { count: 'exact', head: true }),
  ])
  return { events: events ?? 0, tickets: tickets ?? 0, users: users ?? 0 }
}

// ─── Helpers ─────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatPrice(kobo: number) {
  if (kobo === 0) return 'Free'
  const symbol = '₦' // default; real app would use event currency
  return symbol + (kobo / 100).toLocaleString()
}

// Gradient map — no emojis as event stand-ins on a real platform
const COVER_GRADIENTS = [
  'linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  'linear-gradient(145deg, #2d1b69 0%, #11998e 100%)',
  'linear-gradient(145deg, #3a0647 0%, #841b2d 100%)',
  'linear-gradient(145deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
  'linear-gradient(145deg, #1a1a1a 0%, #4a0e0e 100%)',
  'linear-gradient(145deg, #0d1117 0%, #1e3a1e 100%)',
  'linear-gradient(145deg, #1a0a00 0%, #4a2c00 100%)',
  'linear-gradient(145deg, #0a0a2e 0%, #1a1a4a 100%)',
]

// ─── Page ────────────────────────────────────────────────────
export default async function HomePage() {
  const [events, stats] = await Promise.all([getEvents(), getStats()])

  // Fallback placeholder events when DB is empty
  const placeholders = [
    { id: 'p1', title: 'Global Tech Summit 2025', city: 'London', starts_at: '2025-05-14T10:00:00Z', category: 'tech',     slug: '/explore', ticket_tiers: [{ price: 4500000 }] },
    { id: 'p2', title: 'Afrobeats Live Festival',  city: 'Lagos',  starts_at: '2025-05-20T18:00:00Z', category: 'music',    slug: '/explore', ticket_tiers: [{ price: 800000  }] },
    { id: 'p3', title: 'Design & Brand Intensive', city: 'Nairobi',starts_at: '2025-05-28T09:00:00Z', category: 'arts',     slug: '/explore', ticket_tiers: [{ price: 1200000 }] },
    { id: 'p4', title: 'Startup Founders Dinner',  city: 'Dubai',  starts_at: '2025-06-02T19:00:00Z', category: 'business', slug: '/explore', ticket_tiers: [{ price: 2000000 }] },
    { id: 'p5', title: 'Comedy Night Unplugged',   city: 'Accra',  starts_at: '2025-06-07T20:00:00Z', category: 'comedy',   slug: '/explore', ticket_tiers: [{ price: 500000  }] },
    { id: 'p6', title: 'Campus Innovation Expo',   city: 'Ibadan', starts_at: '2025-06-15T10:00:00Z', category: 'campus',   slug: '/explore', ticket_tiers: [{ price: 0       }] },
  ]

  const displayEvents = events.length >= 4 ? events : placeholders

  const displayStats = [
    { value: stats.events  > 10 ? `${stats.events.toLocaleString()}+`  : '500+',    label: 'Events worldwide' },
    { value: stats.tickets > 100 ? `${stats.tickets.toLocaleString()}+` : '50,000+', label: 'Tickets sold'     },
    { value: stats.users   > 50  ? `${stats.users.toLocaleString()}+`   : '20,000+', label: 'People on Synlo'  },
  ]

  return (
    <>
      {/* ══════════════════════════════════════════
          HERO
          Light warm background. Left-aligned.
          Search bar front and center.
      ══════════════════════════════════════════ */}
      <section
        style={{
          background: 'linear-gradient(180deg, #f0ece4 0%, #f8f7f4 60%)',
          paddingTop: '100px',
          paddingBottom: '64px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle geometric decoration — top right */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: '-80px',
            right: '-80px',
            width: '520px',
            height: '520px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(232,65,10,0.07) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        {/* Grid lines — very subtle */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(rgba(0,0,0,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.025) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            pointerEvents: 'none',
          }}
        />

        <div className="wrap relative">
          <div style={{ maxWidth: '760px' }}>
            {/* Live indicator */}
            <div
              className="animate-fade-up"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#ffffff',
                border: '1px solid #e5e4e0',
                borderRadius: '99px',
                padding: '6px 14px 6px 10px',
                marginBottom: '28px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#22c55e',
                  flexShrink: 0,
                  boxShadow: '0 0 0 3px rgba(34,197,94,0.2)',
                  animation: 'pulseGlow 2s ease-in-out infinite',
                }}
              />
              <span style={{ fontFamily: 'DM Sans', fontWeight: 600, fontSize: '13px', color: '#57534e', letterSpacing: '0.01em' }}>
                Events happening worldwide
              </span>
            </div>

            {/* Headline */}
            <h1
              className="animate-fade-up delay-75"
              style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: 800,
                fontSize: 'clamp(44px, 7vw, 76px)',
                lineHeight: '1.02',
                letterSpacing: '-0.04em',
                color: '#111110',
                marginBottom: '22px',
              }}
            >
              The smarter way<br />
              to discover and<br />
              <span style={{ color: '#e8410a' }}>host events.</span>
            </h1>

            <p
              className="animate-fade-up delay-150"
              style={{
                fontFamily: 'DM Sans',
                fontWeight: 300,
                fontSize: 'clamp(17px, 2.2vw, 20px)',
                lineHeight: 1.6,
                color: '#57534e',
                maxWidth: '520px',
                marginBottom: '40px',
              }}
            >
              Find events you'll love, buy tickets in seconds, and connect with people who share your interests — anywhere in the world.
            </p>

            {/* Search bar — the main CTA */}
            <form
              action="/explore"
              method="GET"
              className="animate-fade-up delay-200"
              style={{
                display: 'flex',
                gap: '8px',
                maxWidth: '580px',
                marginBottom: '48px',
              }}
            >
              <div style={{ position: 'relative', flex: 1 }}>
                <Search
                  size={16}
                  color="#a8a29e"
                  style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                />
                <input
                  name="q"
                  type="text"
                  placeholder="Search events, cities, categories…"
                  className="input"
                  style={{
                    paddingLeft: '40px',
                    height: '50px',
                    fontSize: '15px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                  }}
                />
              </div>
              <button
                type="submit"
                className="btn btn-dark btn-lg"
                style={{ height: '50px', paddingLeft: '20px', paddingRight: '20px', flexShrink: 0 }}
              >
                Search
              </button>
            </form>

            {/* Stats row */}
            <div
              className="animate-fade-up delay-300"
              style={{ display: 'flex', flexWrap: 'wrap', gap: '32px' }}
            >
              {displayStats.map(({ value, label }) => (
                <div key={label}>
                  <div style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '26px', letterSpacing: '-0.04em', color: '#111110' }}>
                    {value}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 500, color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '2px' }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          CATEGORY PILLS — quick filter row
      ══════════════════════════════════════════ */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e5e4e0', overflowX: 'auto' }}>
        <div className="wrap">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '14px 0', minWidth: 'max-content' }}>
            <Link
              href="/explore"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '7px 16px',
                background: '#111110', color: '#ffffff',
                borderRadius: '99px',
                fontSize: '13px', fontWeight: 600,
                whiteSpace: 'nowrap', textDecoration: 'none',
                flexShrink: 0,
              }}
            >
              All Events
            </Link>
            {Object.entries(CATEGORY_META).slice(0, 9).map(([key, { label, emoji }]) => (
              <Link
                key={key}
                href={`/explore?category=${key}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '7px 14px',
                  background: 'transparent',
                  border: '1px solid #e5e4e0',
                  color: '#57534e',
                  borderRadius: '99px',
                  fontSize: '13px', fontWeight: 500,
                  whiteSpace: 'nowrap', textDecoration: 'none',
                  transition: 'all 0.15s',
                  flexShrink: 0,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#f8f7f4'
                  e.currentTarget.style.borderColor = '#d1cfc9'
                  e.currentTarget.style.color = '#111110'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.borderColor = '#e5e4e0'
                  e.currentTarget.style.color = '#57534e'
                }}
              >
                {emoji} {label}
              </Link>
            ))}
          </div>
        </div>
      </div>


      {/* ══════════════════════════════════════════
          EVENT GRID
          Clean cards, real information hierarchy.
          Title → Location + Date → Price
      ══════════════════════════════════════════ */}
      <section style={{ background: '#f8f7f4', padding: '56px 0 72px' }}>
        <div className="wrap">
          {/* Section header */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#e8410a', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px' }}>
                Upcoming
              </div>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(24px, 3.5vw, 34px)', letterSpacing: '-0.03em', color: '#111110' }}>
                Events you might like
              </h2>
            </div>
            <Link
              href="/explore"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                fontFamily: 'DM Sans', fontWeight: 600, fontSize: '14px',
                color: '#57534e', textDecoration: 'none',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#111110'}
              onMouseLeave={e => e.currentTarget.style.color = '#57534e'}
            >
              Browse all <ArrowRight size={15} />
            </Link>
          </div>

          {/* Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            {displayEvents.slice(0, 6).map((event: any, i: number) => {
              const meta = CATEGORY_META[event.category] ?? CATEGORY_META.other
              const minPrice = (event.ticket_tiers ?? []).reduce(
                (min: number, t: any) => Math.min(min, t.price ?? 0), Infinity
              )
              const priceLabel = !isFinite(minPrice) || minPrice === 0
                ? 'Free'
                : `From ${formatPrice(minPrice)}`

              return (
                <Link
                  key={event.id}
                  href={`/event/${event.slug ?? '#'}`}
                  style={{ textDecoration: 'none', display: 'block' }}
                >
                  <article
                    style={{
                      background: '#ffffff',
                      borderRadius: '14px',
                      border: '1px solid #e5e4e0',
                      overflow: 'hidden',
                      transition: 'box-shadow 0.2s, transform 0.2s, border-color 0.2s',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget
                      el.style.boxShadow = '0 8px 28px rgba(0,0,0,0.1)'
                      el.style.transform = 'translateY(-3px)'
                      el.style.borderColor = '#d1cfc9'
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget
                      el.style.boxShadow = 'none'
                      el.style.transform = 'translateY(0)'
                      el.style.borderColor = '#e5e4e0'
                    }}
                  >
                    {/* Cover image or gradient */}
                    <div
                      style={{
                        height: '180px',
                        background: event.cover_image
                          ? `url(${event.cover_image}) center/cover no-repeat`
                          : COVER_GRADIENTS[i % COVER_GRADIENTS.length],
                        position: 'relative',
                      }}
                    >
                      {/* Category badge */}
                      <span
                        style={{
                          position: 'absolute',
                          top: '12px',
                          left: '12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 10px',
                          background: 'rgba(255,255,255,0.92)',
                          backdropFilter: 'blur(8px)',
                          borderRadius: '99px',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#111110',
                          letterSpacing: '0.02em',
                          border: '1px solid rgba(255,255,255,0.5)',
                        }}
                      >
                        {meta.label}
                      </span>
                    </div>

                    {/* Card body */}
                    <div style={{ padding: '16px 18px 18px' }}>
                      <h3
                        style={{
                          fontFamily: 'Syne',
                          fontWeight: 700,
                          fontSize: '15px',
                          letterSpacing: '-0.02em',
                          color: '#111110',
                          marginBottom: '10px',
                          lineHeight: 1.3,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {event.title}
                      </h3>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#78716c' }}>
                          <MapPin size={12} color="#a8a29e" />
                          {event.city}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#78716c' }}>
                          <Calendar size={12} color="#a8a29e" />
                          {formatDate(event.starts_at)}
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingTop: '12px',
                          borderTop: '1px solid #f0efec',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: 'Syne',
                            fontWeight: 800,
                            fontSize: '15px',
                            letterSpacing: '-0.02em',
                            color: priceLabel === 'Free' ? '#16a34a' : '#e8410a',
                          }}
                        >
                          {priceLabel}
                        </span>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#e8410a',
                          }}
                        >
                          Get tickets <ChevronRight size={13} />
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              )
            })}
          </div>

          {/* Browse all CTA */}
          <div style={{ textAlign: 'center', marginTop: '36px' }}>
            <Link href="/explore" className="btn btn-outline btn-lg">
              Browse all events <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          HOW IT WORKS
          Dark section. Bold numbered steps.
          Clean, editorial layout.
      ══════════════════════════════════════════ */}
      <section
        id="how-it-works"
        style={{ background: '#111110', padding: '80px 0 88px', color: '#f5f4f1' }}
      >
        <div className="wrap">
          <div style={{ maxWidth: '520px', marginBottom: '56px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#e8410a', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '14px' }}>
              How it works
            </div>
            <h2
              style={{
                fontFamily: 'Syne',
                fontWeight: 800,
                fontSize: 'clamp(30px, 4.5vw, 48px)',
                letterSpacing: '-0.04em',
                color: '#f5f4f1',
                lineHeight: 1.08,
              }}
            >
              From curious to front row in minutes.
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1px',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '16px',
              overflow: 'hidden',
            }}
          >
            {[
              {
                num: '01',
                title: 'Discover',
                body: 'Search or browse thousands of events worldwide. Filter by city, date, category, or keyword.',
              },
              {
                num: '02',
                title: 'Buy tickets',
                body: 'Choose your ticket type, pay securely in seconds. Multiple payment methods supported.',
              },
              {
                num: '03',
                title: 'Get your QR',
                body: 'Your unique QR ticket arrives instantly. Saved in your account. No printing needed.',
              },
              {
                num: '04',
                title: 'Show up',
                body: 'Present your QR at the door. Verified in under a second. Enjoy your event.',
              },
            ].map(({ num, title, body }) => (
              <div
                key={num}
                style={{
                  background: '#1c1917',
                  padding: '32px 28px',
                  cursor: 'default',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#292524')}
                onMouseLeave={e => (e.currentTarget.style.background = '#1c1917')}
              >
                <div
                  style={{
                    fontFamily: 'Syne',
                    fontWeight: 800,
                    fontSize: '56px',
                    letterSpacing: '-0.05em',
                    color: 'rgba(255,255,255,0.07)',
                    lineHeight: 1,
                    marginBottom: '20px',
                    userSelect: 'none',
                  }}
                >
                  {num}
                </div>
                <h3
                  style={{
                    fontFamily: 'Syne',
                    fontWeight: 700,
                    fontSize: '17px',
                    color: '#f5f4f1',
                    marginBottom: '10px',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {title}
                </h3>
                <p style={{ fontSize: '13.5px', color: '#78716c', lineHeight: 1.65 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          FOR ORGANISERS
          Light section. Feature list + CTA.
          NO fee breakdown here.
      ══════════════════════════════════════════ */}
      <section
        id="organisers"
        style={{ background: '#f8f7f4', padding: '88px 0' }}
      >
        <div className="wrap">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '64px',
              alignItems: 'center',
            }}
          >
            {/* Left */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#e8410a', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '16px' }}>
                For Organisers
              </div>
              <h2
                style={{
                  fontFamily: 'Syne',
                  fontWeight: 800,
                  fontSize: 'clamp(28px, 4vw, 44px)',
                  letterSpacing: '-0.04em',
                  color: '#111110',
                  lineHeight: 1.08,
                  marginBottom: '20px',
                }}
              >
                Everything you need to run a great event.
              </h2>
              <p
                style={{
                  fontSize: '16px',
                  fontWeight: 300,
                  color: '#78716c',
                  lineHeight: 1.7,
                  maxWidth: '440px',
                  marginBottom: '36px',
                }}
              >
                Create your event in minutes. Set ticket tiers, track sales in real time, manage your door, and grow with built-in affiliate tools.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '40px' }}>
                {[
                  { icon: <BarChart3 size={17} />, title: 'Real-time dashboard',   desc: 'Live revenue, sales, and attendee data.' },
                  { icon: <Users size={17} />,     title: 'Affiliate programme',   desc: 'Let your audience earn by sharing your events.' },
                  { icon: <Shield size={17} />,    title: 'QR door verification',  desc: 'Assign staff, scan tickets, stop fraud.' },
                  { icon: <Zap size={17} />,       title: 'Instant payouts',       desc: 'Revenue transfers directly to your account.' },
                ].map(({ icon, title, desc }) => (
                  <div key={title} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <div
                      style={{
                        width: '36px', height: '36px',
                        background: '#ffffff',
                        border: '1px solid #e5e4e0',
                        borderRadius: '9px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#e8410a',
                        flexShrink: 0,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                      }}
                    >
                      {icon}
                    </div>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '14px', color: '#111110', marginBottom: '2px' }}>{title}</p>
                      <p style={{ fontSize: '13px', color: '#a8a29e' }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <Link href="/organizer/create" className="btn btn-primary btn-lg">
                  Create your event <ArrowRight size={16} />
                </Link>
                <Link href="/explore" className="btn btn-outline btn-lg">
                  See how it works
                </Link>
              </div>
            </div>

            {/* Right — visual mockup of dashboard stat cards */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e5e4e0',
                  borderRadius: '18px',
                  padding: '28px',
                  boxShadow: '0 12px 48px rgba(0,0,0,0.08)',
                }}
              >
                {/* Mini dashboard header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
                  <div>
                    <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '15px', color: '#111110' }}>Event Overview</p>
                    <p style={{ fontSize: '12px', color: '#a8a29e', marginTop: '2px' }}>Live · Updates every 30s</p>
                  </div>
                  <span style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 0 3px rgba(34,197,94,0.2)', display: 'inline-block', animation: 'pulseGlow 2s ease-in-out infinite' }} />
                </div>

                {/* Stat grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
                  {[
                    { label: 'Revenue',      value: '₦482,000', up: true  },
                    { label: 'Tickets sold', value: '247',      up: true  },
                    { label: 'Check-ins',    value: '189',      up: null  },
                    { label: 'Conversion',   value: '76.5%',    up: true  },
                  ].map(({ label, value, up }) => (
                    <div
                      key={label}
                      style={{
                        background: '#f8f7f4',
                        border: '1px solid #e5e4e0',
                        borderRadius: '10px',
                        padding: '14px 16px',
                      }}
                    >
                      <p style={{ fontSize: '11px', fontWeight: 600, color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>{label}</p>
                      <p style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '20px', letterSpacing: '-0.04em', color: '#111110' }}>{value}</p>
                      {up !== null && (
                        <p style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600, marginTop: '3px' }}>↑ vs last event</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Mini progress bar for capacity */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#78716c', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 500 }}>Capacity</span>
                    <span style={{ fontWeight: 600, color: '#111110' }}>247 / 300</span>
                  </div>
                  <div style={{ height: '6px', background: '#f0efec', borderRadius: '99px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: '82%',
                        background: 'linear-gradient(90deg, #e8410a, #f97316)',
                        borderRadius: '99px',
                      }}
                    />
                  </div>
                  <p style={{ fontSize: '11.5px', color: '#e8410a', fontWeight: 600, marginTop: '5px' }}>🔥 82% sold — selling fast</p>
                </div>
              </div>

              {/* Floating notification — social proof */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '-18px',
                  left: '-16px',
                  background: '#ffffff',
                  border: '1px solid #e5e4e0',
                  borderRadius: '12px',
                  padding: '11px 15px',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  animation: 'float 6s ease-in-out infinite',
                }}
              >
                <div
                  style={{
                    width: '32px', height: '32px',
                    background: 'linear-gradient(135deg, #e8410a, #f97316)',
                    borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff',
                    fontSize: '14px',
                    flexShrink: 0,
                  }}
                >
                  🎟️
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '12px', color: '#111110' }}>New ticket sold</p>
                  <p style={{ fontSize: '11px', color: '#a8a29e', marginTop: '1px' }}>VIP · 2 seconds ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          AFFILIATE SECTION
          Simple. Benefit-led. Not salesy.
      ══════════════════════════════════════════ */}
      <section style={{ background: '#ffffff', borderTop: '1px solid #e5e4e0', padding: '80px 0' }}>
        <div className="wrap">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '48px',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#e8410a', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '16px' }}>
                Affiliate Programme
              </div>
              <h2
                style={{
                  fontFamily: 'Syne',
                  fontWeight: 800,
                  fontSize: 'clamp(26px, 3.5vw, 40px)',
                  letterSpacing: '-0.04em',
                  color: '#111110',
                  lineHeight: 1.1,
                  marginBottom: '16px',
                }}
              >
                Share events.<br />Earn every time.
              </h2>
              <p
                style={{
                  fontSize: '16px',
                  fontWeight: 300,
                  color: '#78716c',
                  lineHeight: 1.7,
                  maxWidth: '400px',
                  marginBottom: '32px',
                }}
              >
                Get a unique referral link for any event. Every ticket sold through your link earns you a commission. No minimum, no cap.
              </p>
              <Link href="/signup" className="btn btn-primary btn-lg">
                Start earning <ArrowRight size={16} />
              </Link>
            </div>

            {/* Three steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { step: '1', title: 'Pick an event',    desc: 'Browse and find an event worth sharing.' },
                { step: '2', title: 'Share your link',  desc: 'Send it to your network via WhatsApp, social, or email.' },
                { step: '3', title: 'Earn commission',  desc: 'Get paid a percentage every time someone buys through your link.' },
              ].map(({ step, title, desc }) => (
                <div
                  key={step}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                    background: '#f8f7f4',
                    border: '1px solid #e5e4e0',
                    borderRadius: '12px',
                    padding: '18px 20px',
                  }}
                >
                  <div
                    style={{
                      width: '28px', height: '28px',
                      background: '#111110',
                      color: '#fff',
                      borderRadius: '8px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'Syne', fontWeight: 800, fontSize: '13px',
                      flexShrink: 0,
                    }}
                  >
                    {step}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '14px', color: '#111110', marginBottom: '3px' }}>{title}</p>
                    <p style={{ fontSize: '13px', color: '#78716c' }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════
          FINAL CTA — Dark, confident, minimal
      ══════════════════════════════════════════ */}
      <section style={{ background: '#111110', padding: '96px 0' }}>
        <div className="wrap" style={{ textAlign: 'center' }}>
          <h2
            style={{
              fontFamily: 'Syne',
              fontWeight: 800,
              fontSize: 'clamp(34px, 5.5vw, 64px)',
              letterSpacing: '-0.045em',
              color: '#f5f4f1',
              lineHeight: 1.04,
              maxWidth: '700px',
              margin: '0 auto 20px',
            }}
          >
            The event you're looking for is already here.
          </h2>
          <p
            style={{
              fontSize: '17px',
              fontWeight: 300,
              color: '#78716c',
              maxWidth: '420px',
              margin: '0 auto 40px',
              lineHeight: 1.65,
            }}
          >
            Join thousands of people discovering events, buying tickets, and making memories on Synlo.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" className="btn btn-primary btn-xl">
              Create free account <ArrowRight size={17} />
            </Link>
            <Link href="/explore" className="btn btn-white btn-xl">
              Browse events
            </Link>
          </div>

          {/* Trust line */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '20px',
              flexWrap: 'wrap',
              marginTop: '36px',
              fontSize: '12px',
              color: '#57534e',
              fontWeight: 500,
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Shield size={13} /> Secured by Flutterwave
            </span>
            <span style={{ color: '#292524' }}>·</span>
            <span>No hidden fees</span>
            <span style={{ color: '#292524' }}>·</span>
            <span>Instant QR tickets</span>
            <span style={{ color: '#292524' }}>·</span>
            <span>Free to join</span>
          </div>
        </div>
      </section>
    </>
  )
}
