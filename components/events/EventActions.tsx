'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Share2, Heart, Copy, MessageCircle, Twitter, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import { PaymentModal } from '@/components/payment/PaymentModal'
import { generateShareText, generateAffiliateShareText } from '@/lib/utils'
import type { Event, User } from '@/types'

interface EventActionsProps {
  event: Event
  user: User | null
  affiliateCode?: string
  mode?: 'all' | 'buy-only'
}

export function EventActions({ event, user, affiliateCode, mode = 'all' }: EventActionsProps) {
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const router = useRouter()

  const eventUrl = `${process.env.NEXT_PUBLIC_APP_URL}/event/${event.slug}`
  const affiliateUrl = affiliateCode ? `${eventUrl}?ref=${affiliateCode}` : eventUrl

  const handleBuyClick = () => {
    if (!user) {
      router.push(`/login?redirect=/event/${event.slug}`)
      return
    }
    setPaymentOpen(true)
  }

  const handleSharePlatform = (platform: string) => {
    const text = generateShareText(event.title, event.city, new Date(event.starts_at).toDateString(), affiliateUrl)
    const encoded = encodeURIComponent(text)
    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encoded}`,
      twitter: `https://twitter.com/intent/tweet?text=${encoded}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(affiliateUrl)}&text=${encodeURIComponent(event.title)}`,
    }
    if (urls[platform]) window.open(urls[platform], '_blank')
    setShareOpen(false)
  }

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(affiliateUrl)
    toast.success('Link copied!')
    setShareOpen(false)
  }

  const handlePaymentSuccess = (paymentId: string) => {
    router.push('/tickets?new=1')
  }

  if (mode === 'buy-only') {
    return (
      <>
        <button onClick={handleBuyClick} className="btn btn-primary btn-full text-base">
          🎟️ Get Tickets
        </button>
        {user && (
          <PaymentModal
            event={event}
            user={user}
            isOpen={paymentOpen}
            onClose={() => setPaymentOpen(false)}
            onSuccess={handlePaymentSuccess}
            affiliateCode={affiliateCode}
          />
        )}
      </>
    )
  }

  return (
    <>
      <div className="card p-5 space-y-4">
        <h3 className="font-display font-bold text-sm uppercase tracking-wider text-zinc-500">Share this event</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { platform: 'whatsapp', label: 'WhatsApp', icon: '💬', color: 'hover:border-green-500/40 hover:bg-green-500/5' },
            { platform: 'twitter', label: 'Twitter', icon: '𝕏', color: 'hover:border-sky-500/40 hover:bg-sky-500/5' },
            { platform: 'telegram', label: 'Telegram', icon: '✈️', color: 'hover:border-blue-500/40 hover:bg-blue-500/5' },
          ].map(({ platform, label, icon, color }) => (
            <button
              key={platform}
              onClick={() => handleSharePlatform(platform)}
              className={`card py-3 px-2 flex flex-col items-center gap-1.5 text-zinc-400 hover:text-zinc-100 transition-all ${color}`}
            >
              <span className="text-lg">{icon}</span>
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
          <button
            onClick={handleCopyLink}
            className="card py-3 px-2 flex flex-col items-center gap-1.5 text-zinc-400 hover:text-zinc-100 hover:border-zinc-600 transition-all"
          >
            <Copy className="w-4 h-4" />
            <span className="text-xs font-medium">Copy link</span>
          </button>
        </div>
      </div>

      {/* Plus One CTA */}
      <div className="card p-5 bg-gradient-to-br from-purple-950/40 to-zinc-900 border-purple-900/30">
        <div className="flex items-start gap-4">
          <div className="text-3xl">👫</div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-zinc-100 mb-1">Looking for a plus-one?</h3>
            <p className="text-sm text-zinc-500 mb-3">Connect with other solo attendees going to this event. Find your match, make it a night.</p>
            {user ? (
              <button className="btn btn-ghost btn-sm border-purple-800/60 text-purple-400 hover:bg-purple-500/10">
                <Heart className="w-4 h-4" /> Find Plus One
              </button>
            ) : (
              <a href="/signup" className="btn btn-ghost btn-sm border-purple-800/60 text-purple-400 hover:bg-purple-500/10">
                Sign up to connect
              </a>
            )}
          </div>
        </div>
      </div>

      {user && (
        <PaymentModal
          event={event}
          user={user}
          isOpen={paymentOpen}
          onClose={() => setPaymentOpen(false)}
          onSuccess={handlePaymentSuccess}
          affiliateCode={affiliateCode}
        />
      )}
    </>
  )
}
