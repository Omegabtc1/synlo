// app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Syne, DM_Sans, JetBrains_Mono } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-syne',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'Synlo — Where Your Vibe Finds Its Match', template: '%s | Synlo' },
  description: 'Nigeria\'s premier event ticketing and social discovery platform. Discover events, buy tickets, meet people.',
  keywords: ['events', 'tickets', 'nigeria', 'lagos', 'abuja', 'concerts', 'networking'],
  authors: [{ name: 'Synlo' }],
  creator: 'Synlo',
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'Synlo',
    title: 'Synlo — Where Your Vibe Finds Its Match',
    description: 'Discover events, buy tickets, meet people in Nigeria.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Synlo',
    description: 'Nigeria\'s event platform',
  },
  icons: { icon: '/favicon.ico', apple: '/apple-touch-icon.png' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#09090b',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-bg text-zinc-50 font-body antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#18181b',
              color: '#fafafa',
              border: '1px solid #27272a',
              borderRadius: '8px',
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#22c55e', secondary: '#18181b' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#18181b' } },
          }}
        />
      </body>
    </html>
  )
}
