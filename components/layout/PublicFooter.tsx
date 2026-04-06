import Link from 'next/link'
import { Zap } from 'lucide-react'

export function PublicFooter() {
  return (
    <footer className="border-t border-zinc-800/60 bg-zinc-950">
      <div className="page-container py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-zinc-950 fill-zinc-950" />
              </div>
              <span className="font-display font-bold tracking-tight">Synlo</span>
            </Link>
            <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">
              Nigeria's premier event infrastructure. Discover events, buy tickets, meet people.
            </p>
          </div>

          {/* Platform */}
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">Platform</p>
            <ul className="space-y-2.5">
              {[
                { label: 'Explore Events', href: '/explore' },
                { label: 'Create Event', href: '/organizer/create' },
                { label: 'Affiliate', href: '/affiliate' },
                { label: 'Plus One', href: '/explore' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-zinc-500 hover:text-zinc-200 transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">Company</p>
            <ul className="space-y-2.5">
              {['About', 'Blog', 'Careers', 'Press'].map(l => (
                <li key={l}>
                  <span className="text-sm text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer">{l}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">Legal</p>
            <ul className="space-y-2.5">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Refund Policy'].map(l => (
                <li key={l}>
                  <span className="text-sm text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer">{l}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-zinc-800/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-zinc-600">© 2025 Synlo Inc. All rights reserved. 🇳🇬 Built in Nigeria.</p>
          <div className="flex items-center gap-4">
            {['Twitter', 'Instagram', 'LinkedIn'].map(s => (
              <span key={s} className="text-xs text-zinc-600 hover:text-zinc-300 cursor-pointer transition-colors">{s}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
