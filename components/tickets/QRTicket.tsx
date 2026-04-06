'use client'
import { useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Download, Share2, Calendar, MapPin, User, Ticket as TicketIcon } from 'lucide-react'
import { formatDateTime, formatNaira, CATEGORY_META } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Ticket } from '@/types'

interface QRTicketProps {
  ticket: Ticket
  className?: string
}

export function QRTicket({ ticket, className }: QRTicketProps) {
  const ticketRef = useRef<HTMLDivElement>(null)
  const meta = ticket.event ? CATEGORY_META[ticket.event.category] : CATEGORY_META.other
  const isUsed = ticket.status === 'used'

  const handleShare = async () => {
    if (!ticket.event) return
    const text = `My ticket for ${ticket.event.title} 🎉\nCode: ${ticket.ticket_code}\n${process.env.NEXT_PUBLIC_APP_URL}/event/${ticket.event.slug}`
    if (navigator.share) {
      await navigator.share({ title: ticket.event.title, text })
    } else {
      await navigator.clipboard.writeText(text)
    }
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Ticket visual */}
      <div ref={ticketRef} className={cn('ticket-card relative overflow-hidden', isUsed && 'opacity-60')}>
        {/* Header gradient bar */}
        {ticket.event && (
          <div className={cn(
            'absolute inset-x-0 top-0 h-1',
            ticket.tier?.type === 'vip' ? 'bg-gradient-to-r from-transparent via-purple-400 to-transparent' :
            ticket.tier?.type === 'vvip' ? 'bg-gradient-to-r from-transparent via-yellow-400 to-transparent' :
            'bg-gradient-to-r from-transparent via-accent to-transparent'
          )} />
        )}

        {/* Status watermark */}
        {isUsed && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="rotate-[-35deg] border-4 border-red-500/40 text-red-500/40 text-4xl font-display font-black px-4 py-1 rounded tracking-widest">
              USED
            </div>
          </div>
        )}

        {/* Event info */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-synlo-sm bg-zinc-800 flex items-center justify-center text-2xl flex-shrink-0">
            {meta?.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-zinc-50 text-lg leading-tight">{ticket.event?.title}</p>
            <div className="flex flex-wrap gap-3 mt-1.5">
              {ticket.event?.starts_at && (
                <span className="flex items-center gap-1 text-xs text-zinc-400">
                  <Calendar className="w-3 h-3" />
                  {formatDateTime(ticket.event.starts_at)}
                </span>
              )}
              {ticket.event && (
                <span className="flex items-center gap-1 text-xs text-zinc-400">
                  <MapPin className="w-3 h-3" />
                  {ticket.event.venue_name}, {ticket.event.city}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Perforation */}
        <div className="ticket-perforation">
          <div className="w-5 h-5 rounded-full bg-zinc-950 absolute -left-6 z-10" />
          <div className="w-5 h-5 rounded-full bg-zinc-950 absolute -right-6 z-10" />
        </div>

        {/* QR + Details */}
        <div className="flex items-center gap-6 pt-4">
          {/* QR Code */}
          <div className={cn('p-2 bg-white rounded-synlo-sm flex-shrink-0', isUsed && 'grayscale')}>
            <QRCodeSVG
              value={ticket.ticket_code}
              size={100}
              level="H"
              includeMargin={false}
              bgColor="white"
              fgColor="#09090b"
            />
          </div>

          {/* Ticket details */}
          <div className="flex-1 space-y-2.5">
            <div>
              <p className="text-xs text-zinc-600 uppercase tracking-wider mb-0.5">Ticket Type</p>
              <p className={cn('font-semibold text-sm',
                ticket.tier?.type === 'vip' ? 'text-purple-400' :
                ticket.tier?.type === 'vvip' ? 'text-yellow-400' :
                'text-zinc-100'
              )}>
                {ticket.tier?.name || 'General'}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-600 uppercase tracking-wider mb-0.5">Holder</p>
              <p className="font-medium text-sm text-zinc-100">{ticket.holder_name}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-600 uppercase tracking-wider mb-0.5">Status</p>
              <span className={cn('badge text-xs', isUsed ? 'status-used' : 'status-active')}>
                {isUsed ? 'Used' : '✓ Active'}
              </span>
            </div>
          </div>
        </div>

        {/* Ticket code */}
        <div className="mt-4 pt-4 border-t border-dashed border-zinc-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-600 uppercase tracking-wider mb-0.5">Ticket Code</p>
              <p className="font-mono text-sm text-zinc-300 tracking-widest">{ticket.ticket_code}</p>
            </div>
            <TicketIcon className="w-5 h-5 text-zinc-700" />
          </div>
        </div>
      </div>

      {/* Actions */}
      {!isUsed && (
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="btn btn-ghost btn-sm flex-1"
          >
            <Share2 className="w-4 h-4" /> Share
          </button>
          <button
            onClick={() => window.print()}
            className="btn btn-ghost btn-sm flex-1"
          >
            <Download className="w-4 h-4" /> Download
          </button>
        </div>
      )}
    </div>
  )
}
