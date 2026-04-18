'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatNaira } from '@/lib/utils'
import { useUser } from '@/hooks/useUser'
import { PaymentModal } from '@/components/payment/PaymentModal'
import type { Event } from '@/types'

interface BuyTicketButtonProps {
  event: Event
  affiliateCode?: string
}

export function BuyTicketButton({ event, affiliateCode }: BuyTicketButtonProps) {
  const { user } = useUser()
  const router = useRouter()
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  const handleClick = () => {
    if (!user) {
      router.push(`/login?redirect=/event/${event.slug}`)
      return
    }
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = (paymentId: string) => {
    router.push(`/tickets?payment=${paymentId}`)
  }

  const isSoldOut = event.ticket_tiers?.every(t => t.quantity_sold >= t.quantity)
  const minPrice = event.ticket_tiers?.reduce((min, t) => Math.min(min, t.price), Infinity) ?? 0

  return (
    <>
      <button onClick={handleClick} disabled={isSoldOut} className="btn btn-dark btn-full">
        {isSoldOut ? 'Sold Out' : `Get Tickets — From ${formatNaira(minPrice)}`}
      </button>

      {user && (
        <PaymentModal
          event={event}
          user={user}
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
          affiliateCode={affiliateCode}
        />
      )}
    </>
  )
}