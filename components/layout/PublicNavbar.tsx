'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Zap, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { label: 'Explore',      href: '/explore' },
  { label: 'For Organisers', href: '/#organisers' },
  { label: 'Help',         href: '/help' },
]

export function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-200',
          scrolled
            ? 'bg-white border-b border-[#e5e4e0] shadow-[0_1px_8px_rgba(0,0,0,0.06)]'
            : 'bg-white/0'
        )}
      >
        <div className="wrap">
          <div className="flex items-center justify-between h-[64px] gap-6">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="w-[30px] h-[30px] rounded-[8px] bg-[#e8410a] flex items-center justify-center">
                <Zap className="w-[15px] h-[15px] text-white fill-white" />
              </div>
              <span className="font-display font-bold text-[1.1rem] tracking-[-0.03em] text-[#111110]">
                Synlo
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-0.5 flex-1">
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="px-3.5 py-2 rounded-lg text-[0.875rem] font-medium text-[#57534e] hover:text-[#111110] hover:bg-black/[0.04] transition-colors duration-150"
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="hidden md:flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-[#57534e] hover:text-[#111110] rounded-lg hover:bg-black/[0.04] transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="btn btn-dark btn-sm"
              >
                Sign up free
              </Link>
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 -mr-1 rounded-lg text-[#57534e] hover:text-[#111110] hover:bg-black/[0.05] transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-[64px] left-0 right-0 bg-white border-b border-[#e5e4e0] shadow-lg">
            <div className="wrap py-3">
              <div className="flex flex-col gap-0.5">
                {NAV_LINKS.map(({ label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 rounded-xl text-[0.9375rem] font-medium text-[#57534e] hover:text-[#111110] hover:bg-black/[0.04] transition-colors"
                  >
                    {label}
                  </Link>
                ))}
              </div>
              <div className="flex flex-col gap-2 pt-3 mt-2 border-t border-[#e5e4e0]">
                <Link
                  href="/login"
                  className="btn btn-outline btn-lg w-full"
                  onClick={() => setMobileOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="btn btn-dark btn-lg w-full"
                  onClick={() => setMobileOpen(false)}
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
