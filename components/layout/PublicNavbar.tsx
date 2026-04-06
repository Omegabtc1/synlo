'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { label: 'Explore', href: '/explore' },
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'For Organisers', href: '/#organisers' },
]

export function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/60 shadow-[0_1px_0_rgba(255,255,255,0.04)]'
            : 'bg-transparent'
        )}
      >
        <div className="page-container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shadow-glow-sm group-hover:scale-105 transition-transform">
                <Zap className="w-4 h-4 text-zinc-950 fill-zinc-950" />
              </div>
              <span className="font-display font-bold text-lg tracking-tight text-zinc-50">
                Synlo
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-100 rounded-synlo-sm hover:bg-zinc-800/50 transition-all duration-150"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* CTA buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/login" className="btn btn-ghost btn-sm">
                Log in
              </Link>
              <Link href="/signup" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-zinc-400 hover:text-zinc-100 transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div className="absolute top-16 left-0 right-0 bg-zinc-900 border-b border-zinc-800 p-4 space-y-1 animate-fade-in">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-3 text-sm font-medium text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 rounded-synlo-sm transition-all"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-zinc-800 flex flex-col gap-2">
              <Link href="/login" className="btn btn-ghost btn-md w-full" onClick={() => setMenuOpen(false)}>Log in</Link>
              <Link href="/signup" className="btn btn-primary btn-md w-full" onClick={() => setMenuOpen(false)}>Get Started Free</Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
