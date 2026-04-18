'use client'

import { useState } from 'react'
import { Copy, Share2, MessageCircle, Twitter, Send } from 'lucide-react'
import toast from 'react-hot-toast'

interface Affiliate {
  id: string
  referral_code: string
  clicks: number
  conversions: number
  total_earned: number
}

interface Event {
  title: string
  slug: string
}

interface Props {
  affiliate: Affiliate
  event: Event
}

export default function ReferralLinkCard({ affiliate, event }: Props) {
  const [copied, setCopied] = useState(false)

  const referralUrl = `${window.location.origin}/event/${event.slug}?ref=${affiliate.referral_code}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl)
      setCopied(true)
      toast.success('Link copied!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy')
    }
  }

  const shareToWhatsApp = () => {
    const text = `Check out this event: ${event.title}\n${referralUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  const shareToTwitter = () => {
    const text = `Check out ${event.title} on Synlo! ${referralUrl}`
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank')
  }

  const shareToTelegram = () => {
    const text = `Check out ${event.title}: ${referralUrl}`
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div className="card p-6">
      <h3 className="font-semibold mb-2">{event.title}</h3>
      <p className="text-sm text-zinc-500 mb-4">
        {affiliate.clicks} clicks · {affiliate.conversions} sales · ₦{(affiliate.total_earned / 100).toLocaleString()} earned
      </p>

      <div className="bg-zinc-900 rounded p-3 mb-4">
        <p className="text-sm font-mono break-all">{referralUrl}</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={copyToClipboard}
          className="btn btn-outline btn-sm flex-1"
        >
          <Copy className="w-4 h-4 mr-2" />
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <button
          onClick={shareToWhatsApp}
          className="btn btn-outline btn-sm"
        >
          <MessageCircle className="w-4 h-4" />
        </button>
        <button
          onClick={shareToTwitter}
          className="btn btn-outline btn-sm"
        >
          <Twitter className="w-4 h-4" />
        </button>
        <button
          onClick={shareToTelegram}
          className="btn btn-outline btn-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}