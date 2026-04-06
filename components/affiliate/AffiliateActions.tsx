'use client'
import { Copy, Share2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { generateAffiliateShareText } from '@/lib/utils'

interface AffiliateActionsProps {
  referralCode: string
  eventSlug: string
  eventTitle: string
}

export function AffiliateActions({ referralCode, eventSlug, eventTitle }: AffiliateActionsProps) {
  const referralUrl = `${process.env.NEXT_PUBLIC_APP_URL}/event/${eventSlug}?ref=${referralCode}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralUrl)
    toast.success('Referral link copied!')
  }

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`🎉 Check out this event: ${eventTitle}\n\nGet your ticket here 👇\n${referralUrl}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  return (
    <div className="space-y-2">
      {/* Link display */}
      <div className="flex items-center gap-2 p-2.5 rounded-synlo-sm bg-zinc-800/60 border border-zinc-700/50">
        <p className="font-mono text-xs text-zinc-400 truncate flex-1">{referralUrl}</p>
        <button onClick={handleCopy} className="btn btn-ghost btn-sm flex-shrink-0 py-1 px-2">
          <Copy className="w-3.5 h-3.5" /> Copy
        </button>
      </div>
      {/* Share buttons */}
      <div className="flex gap-2">
        <button onClick={handleWhatsApp}
          className="btn btn-ghost btn-sm flex-1 border-green-800/40 text-green-400 hover:bg-green-500/10">
          💬 WhatsApp
        </button>
        <button onClick={() => {
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`🎟️ ${eventTitle}\n${referralUrl}`)}`, '_blank')
        }} className="btn btn-ghost btn-sm flex-1 border-sky-800/40 text-sky-400 hover:bg-sky-500/10">
          𝕏 Twitter
        </button>
        <button onClick={() => {
          window.open(`https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${encodeURIComponent(eventTitle)}`, '_blank')
        }} className="btn btn-ghost btn-sm flex-1 border-blue-800/40 text-blue-400 hover:bg-blue-500/10">
          ✈️ Telegram
        </button>
      </div>
    </div>
  )
}
