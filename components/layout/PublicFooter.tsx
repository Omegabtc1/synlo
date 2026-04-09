import Link from 'next/link'
import { Zap } from 'lucide-react'

const FOOTER_LINKS = {
  Platform: [
    { label: 'Explore Events', href: '/explore' },
    { label: 'Create Event', href: '/organizer/create' },
    { label: 'Affiliate Programme', href: '/affiliate' },
    { label: 'Plus One', href: '/explore' },
    { label: 'Pricing', href: '/#pricing' },
  ],
  Organisers: [
    { label: 'Start Selling Tickets', href: '/organizer/create' },
    { label: 'Organiser Dashboard', href: '/organizer' },
    { label: 'QR Check-in', href: '/verify' },
    { label: 'Analytics', href: '/organizer' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
    { label: 'Refund Policy', href: '#' },
  ],
}

export function PublicFooter() {
  return (
    <footer className="bg-[var(--color-dark)] text-[#a8a29e]">
      <div className="wrap pt-[64px] pb-[48px]">

        {/* Top row: brand + columns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-8 h-8 rounded-[10px] bg-[var(--color-accent)] flex items-center justify-center">
                <Zap className="w-4 h-4 text-white fill-white" />
              </div>
              <span
                className="font-display font-bold text-[1.125rem] text-white tracking-[-0.03em]"
              >
                Synlo
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-[#78716c] max-w-[220px]">
              Tickets for every kind of experience, everywhere in the world.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <p className="text-xs font-bold text-[#57534e] uppercase tracking-[0.12em] mb-4">
                {section}
              </p>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-[#78716c] hover:text-[#d6d3d1] transition-colors duration-150"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-px bg-[rgba(255,255,255,0.07)] my-9" />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#57534e] text-center sm:text-left">
            © {new Date().getFullYear()} Synlo, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {['Twitter', 'Instagram', 'LinkedIn'].map(s => (
              <span
                key={s}
                className="text-xs text-[#57534e] hover:text-[#d6d3d1] cursor-pointer transition-colors"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
