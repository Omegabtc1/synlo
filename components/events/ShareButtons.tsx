'use client'
import { useState } from 'react'
import { Share2, MessageCircle, Send, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Event } from '@/types'

interface ShareButtonsProps {
  event: Event
  affiliateCode?: string
}

export function ShareButtons({ event, affiliateCode }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const eventUrl = `${baseUrl}/event/${event.slug}`
  const shareUrl = affiliateCode ? `${eventUrl}?ref=${affiliateCode}` : eventUrl

  const shareText = `Check out ${event.title} on Synlo!\n${shareUrl}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success('Link copied!')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Failed to copy link')
    }
  }

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(event.title)}`

  return (
    <div className="card p-6">
      <h3 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
        <Share2 className="w-5 h-5" />
        Share this event
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 rounded-synlo bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 transition-colors"
        >
          <MessageCircle className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium text-green-400">WhatsApp</span>
        </a>

        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 rounded-synlo bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
        >
          <Send className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-blue-400">Twitter</span>
        </a>

        <a
          href={telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-3 rounded-synlo bg-blue-600/10 border border-blue-600/20 hover:bg-blue-600/20 transition-colors"
        >
          <MessageSquare className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-blue-500">Telegram</span>
        </a>

        <button
          onClick={handleCopy}
          className="flex items-center gap-3 p-3 rounded-synlo bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 transition-colors"
        >
          <Share2 className="w-4 h-4 text-zinc-400" />
          <span className="text-sm font-medium text-zinc-400">
            {copied ? 'Copied!' : 'Copy Link'}
          </span>
        </button>
      </div>

      {affiliateCode && (
        <p className="text-xs text-zinc-500 mt-4">
          💰 Earn commission when people buy tickets through your shared links
        </p>
      )}
    </div>
  )
}