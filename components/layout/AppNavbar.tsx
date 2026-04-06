'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Zap, Search, Ticket, Users, BarChart3, ShieldCheck,
  User, Settings, LogOut, ChevronDown, Menu, X, Bell
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn, initials } from '@/lib/utils'
import type { User as SynloUser } from '@/types'

const APP_NAV = [
  { label: 'Explore',    href: '/explore',    icon: Search },
  { label: 'My Tickets', href: '/tickets',    icon: Ticket },
  { label: 'Affiliate',  href: '/affiliate',  icon: Users },
  { label: 'Organiser',  href: '/organizer',  icon: BarChart3 },
]

interface AppNavbarProps {
  user: SynloUser
}

export function AppNavbar({ user }: AppNavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const isActive = (href: string) =>
    href === '/organizer'
      ? pathname.startsWith('/organizer')
      : pathname === href

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-zinc-950/92 backdrop-blur-xl border-b border-zinc-800/60'
            : 'bg-zinc-950/70 backdrop-blur-md border-b border-zinc-800/30'
        )}
      >
        <div className="page-container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/explore" className="flex items-center gap-2 group mr-6">
              <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center group-hover:scale-105 transition-transform">
                <Zap className="w-3.5 h-3.5 text-zinc-950 fill-zinc-950" />
              </div>
              <span className="font-display font-bold text-base tracking-tight hidden sm:block">
                Synlo
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1 flex-1">
              {APP_NAV.map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-synlo-sm transition-all duration-150',
                    isActive(href)
                      ? 'text-zinc-100 bg-zinc-800 border border-zinc-700'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  className={cn(
                    'flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-synlo-sm transition-all',
                    pathname.startsWith('/admin')
                      ? 'text-accent bg-accent/10 border border-accent/20'
                      : 'text-zinc-400 hover:text-accent hover:bg-accent/10'
                  )}
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin
                </Link>
              )}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Notifications (placeholder) */}
              <button className="hidden md:flex w-9 h-9 items-center justify-center rounded-synlo-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all relative">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
              </button>

              {/* Profile dropdown */}
              <div ref={dropRef} className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={cn(
                    'flex items-center gap-2 pl-1 pr-2 py-1 rounded-synlo-sm transition-all',
                    dropdownOpen ? 'bg-zinc-800 border border-zinc-700' : 'hover:bg-zinc-800/50'
                  )}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center text-xs font-bold text-white font-display">
                    {initials(user.full_name)}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-zinc-300 max-w-[100px] truncate">
                    {user.full_name.split(' ')[0]}
                  </span>
                  <ChevronDown className={cn('hidden sm:block w-3.5 h-3.5 text-zinc-500 transition-transform', dropdownOpen && 'rotate-180')} />
                </button>

                {/* Dropdown */}
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-synlo shadow-elevated animate-scale-in z-50">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-zinc-800">
                      <p className="text-sm font-semibold text-zinc-100 truncate">{user.full_name}</p>
                      <p className="text-xs text-zinc-500 truncate mt-0.5">{user.email}</p>
                      <span className={cn(
                        'inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full border font-medium capitalize',
                        user.role === 'organizer' ? 'text-accent border-accent/30 bg-accent/10' :
                        user.role === 'admin' ? 'text-purple-400 border-purple-500/30 bg-purple-500/10' :
                        'text-zinc-400 border-zinc-700 bg-zinc-800'
                      )}>
                        {user.role}
                      </span>
                    </div>

                    {/* Links */}
                    <div className="py-1.5">
                      <Link href="/profile" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-all">
                        <User className="w-4 h-4 text-zinc-500" /> Profile
                      </Link>
                      <Link href="/tickets" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-all">
                        <Ticket className="w-4 h-4 text-zinc-500" /> My Tickets
                      </Link>
                      <Link href="/organizer" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-all">
                        <BarChart3 className="w-4 h-4 text-zinc-500" /> Organiser Dashboard
                      </Link>
                      <Link href="/affiliate" onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-all">
                        <Users className="w-4 h-4 text-zinc-500" /> Affiliate
                      </Link>
                    </div>

                    <div className="border-t border-zinc-800 py-1.5">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                      >
                        <LogOut className="w-4 h-4" /> Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile hamburger */}
              <button
                className="md:hidden p-2 text-zinc-400 hover:text-zinc-100 transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-16 left-0 right-0 bg-zinc-900 border-b border-zinc-800 p-4 space-y-1 animate-fade-in">
            {APP_NAV.map(({ label, href, icon: Icon }) => (
              <Link key={href} href={href}
                className={cn('flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-synlo-sm transition-all',
                  isActive(href) ? 'text-zinc-100 bg-zinc-800' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800')}
                onClick={() => setMobileOpen(false)}>
                <Icon className="w-4 h-4" />{label}
              </Link>
            ))}
            <div className="pt-3 border-t border-zinc-800">
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-synlo-sm transition-all">
                <LogOut className="w-4 h-4" /> Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
