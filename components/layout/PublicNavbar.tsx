'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Find Events',  href: '/explore' },
  { label: 'Create Event', href: '/organizer/create' },
  { label: 'How it works', href: '/#how-it-works' },
]

export function PublicNavbar() {
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          height: '64px',
          background: scrolled ? 'rgba(248,247,244,0.95)' : 'rgba(248,247,244,0.8)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: scrolled ? '1px solid #e5e4e0' : '1px solid transparent',
          boxShadow: scrolled ? '0 1px 0 rgba(0,0,0,0.04)' : 'none',
        }}
      >
        <div className="wrap h-full flex items-center justify-between gap-6">

          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 flex-shrink-0 group"
            style={{ textDecoration: 'none' }}
          >
            {/* Wordmark-style logo */}
            <div
              className="flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
              style={{ background: '#111110' }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M4 2h5.5L13 6.5 8 14 3 6.5 4 2Z" fill="#e8410a"/>
                <path d="M8 14l2.5-7.5H5.5L8 14Z" fill="white" opacity="0.25"/>
              </svg>
            </div>
            <span
              style={{
                fontFamily: 'Syne, sans-serif',
                fontWeight: 800,
                fontSize: '18px',
                letterSpacing: '-0.03em',
                color: '#111110',
              }}
            >
              Synlo
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  color: '#57534e',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  transition: 'color 0.15s, background 0.15s',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = '#111110'
                  e.currentTarget.style.background = 'rgba(0,0,0,0.05)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = '#57534e'
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA buttons */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            <Link href="/login" className="btn btn-ghost btn-sm">
              Log in
            </Link>
            <Link
              href="/signup"
              className="btn btn-dark btn-sm"
              style={{ letterSpacing: '-0.01em' }}
            >
              Sign up free
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg transition-colors"
            style={{ background: menuOpen ? 'rgba(0,0,0,0.06)' : 'transparent' }}
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen
              ? <X size={18} color="#111110" strokeWidth={2} />
              : <Menu size={18} color="#111110" strokeWidth={2} />
            }
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(4px)' }}
            onClick={() => setMenuOpen(false)}
          />

          {/* Drawer panel */}
          <div
            className="absolute top-16 left-0 right-0 animate-fade-in"
            style={{
              background: '#ffffff',
              borderBottom: '1px solid #e5e4e0',
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            }}
          >
            <div className="wrap py-4 flex flex-col gap-1">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: 'block',
                    padding: '12px 14px',
                    fontFamily: 'DM Sans, sans-serif',
                    fontWeight: 500,
                    fontSize: '15px',
                    color: '#111110',
                    borderRadius: '8px',
                    transition: 'background 0.12s',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {link.label}
                </Link>
              ))}
              <div
                style={{
                  borderTop: '1px solid #e5e4e0',
                  marginTop: '8px',
                  paddingTop: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="btn btn-outline btn-md"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="btn btn-dark btn-md"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Sign up free
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
