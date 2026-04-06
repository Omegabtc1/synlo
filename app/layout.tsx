// app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Synlo — Discover and Host Events Worldwide',
    template: '%s | Synlo',
  },
  description: 'Find events you love, buy tickets instantly, and connect with people who share your interests. Create and sell tickets for your events with powerful organiser tools.',
  keywords: ['events', 'tickets', 'concerts', 'festivals', 'networking', 'ticketing platform'],
  authors: [{ name: 'Synlo' }],
  openGraph: {
    type: 'website',
    siteName: 'Synlo',
    title: 'Synlo — Discover and Host Events Worldwide',
    description: 'Find events you love and host events that people remember.',
  },
  twitter: { card: 'summary_large_image' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f8f7f4',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#ffffff',
              color: '#111110',
              border: '1px solid #e5e4e0',
              borderRadius: '10px',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '14px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            },
            success: { iconTheme: { primary: '#16a34a', secondary: '#ffffff' } },
            error:   { iconTheme: { primary: '#e8410a', secondary: '#ffffff' } },
          }}
        />
      </body>
    </html>
  )
}
