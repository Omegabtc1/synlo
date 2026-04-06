'use client'
import { useState } from 'react'
import { X, Plus, Minus, ShieldCheck, CreditCard, AlertCircle, ChevronRight } from 'lucide-react'
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3'
import toast from 'react-hot-toast'
import { formatNaira, calcPlatformFee, calcTotal } from '@/lib/utils'
import type { Event, TicketTier, FlutterwaveCallback } from '@/types'

interface CartItem {
  tier: TicketTier
  quantity: number
}

interface PaymentModalProps {
  event: Event
  user: { id: string; email: string; full_name: string; phone?: string }
  isOpen: boolean
  onClose: () => void
  onSuccess: (paymentId: string) => void
  affiliateCode?: string
}

export function PaymentModal({ event, user, isOpen, onClose, onSuccess, affiliateCode }: PaymentModalProps) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [step, setStep] = useState<'select' | 'review' | 'processing'>('select')
  const [paymentData, setPaymentData] = useState<any>(null)
  const [isInitializing, setIsInitializing] = useState(false)

  if (!isOpen) return null

  const activeTiers = (event.ticket_tiers || []).filter(t => t.is_active && t.quantity_sold < t.quantity)

  const getQty = (tierId: string) => cart.find(c => c.tier.id === tierId)?.quantity ?? 0

  const updateCart = (tier: TicketTier, delta: number) => {
    setCart(prev => {
      const existing = prev.find(c => c.tier.id === tier.id)
      const currentQty = existing?.quantity ?? 0
      const newQty = Math.max(0, Math.min(currentQty + delta, tier.max_per_order, tier.quantity - tier.quantity_sold))

      if (newQty === 0) return prev.filter(c => c.tier.id !== tier.id)
      if (existing) return prev.map(c => c.tier.id === tier.id ? { ...c, quantity: newQty } : c)
      return [...prev, { tier, quantity: newQty }]
    })
  }

  const subtotalKobo = cart.reduce((sum, { tier, quantity }) => sum + tier.price * quantity, 0)
  const feeKobo = calcPlatformFee(subtotalKobo)
  const totalKobo = calcTotal(subtotalKobo)
  const totalItems = cart.reduce((sum, { quantity }) => sum + quantity, 0)

  const handleInitializePayment = async () => {
    if (!cart.length) return
    setIsInitializing(true)
    try {
      const res = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_id: event.id,
          tiers: cart.map(({ tier, quantity }) => ({ tier_id: tier.id, quantity })),
          affiliate_code: affiliateCode,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to initialize payment')
      setPaymentData(json.data)
      setStep('review')
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setIsInitializing(false)
    }
  }

  const FlutterwaveButton = () => {
    const config = paymentData?.flutterwave_config
    const handleFlutterwave = useFlutterwave(config)

    const handlePay = () => {
      setStep('processing')
      handleFlutterwave({
        callback: async (response: FlutterwaveCallback) => {
          closePaymentModal()
          if (response.status === 'successful') {
            try {
              const verifyRes = await fetch('/api/payments/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  transaction_id: response.transaction_id,
                  tx_ref: response.tx_ref,
                }),
              })
              const verifyJson = await verifyRes.json()
              if (verifyRes.ok) {
                toast.success('🎉 Payment successful! Your tickets are ready.')
                onSuccess(paymentData.payment_id)
                onClose()
              } else {
                toast.error(verifyJson.error || 'Payment verification failed')
                setStep('review')
              }
            } catch {
              toast.error('Verification error. Please contact support.')
              setStep('review')
            }
          } else if (response.status === 'cancelled') {
            toast('Payment cancelled', { icon: '↩️' })
            setStep('review')
          } else {
            toast.error('Payment failed. Please try again.')
            setStep('review')
          }
        },
        onClose: () => {
          if (step === 'processing') setStep('review')
        },
      })
    }

    return (
      <button onClick={handlePay} className="btn btn-primary btn-full text-base">
        <CreditCard className="w-5 h-5" />
        Pay {formatNaira(totalKobo)} Now
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm" onClick={step !== 'processing' ? onClose : undefined} />

      <div className="relative w-full sm:max-w-lg bg-zinc-900 border border-zinc-800 rounded-t-[24px] sm:rounded-synlo-xl shadow-elevated animate-scale-in max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 flex-shrink-0">
          <div>
            <h2 className="font-display text-lg font-bold text-zinc-50">
              {step === 'select' ? 'Choose Tickets' : step === 'review' ? 'Order Summary' : 'Processing…'}
            </h2>
            <p className="text-sm text-zinc-500 truncate max-w-xs">{event.title}</p>
          </div>
          {step !== 'processing' && (
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 transition-all">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="overflow-y-auto scrollbar-thin flex-1">
          {step === 'select' && (
            <div className="p-5 space-y-3">
              {activeTiers.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  <p className="text-4xl mb-3">🎟️</p>
                  <p className="font-semibold text-zinc-300">No tickets available</p>
                  <p className="text-sm mt-1">All tiers are sold out or unavailable</p>
                </div>
              ) : (
                activeTiers.map(tier => {
                  const qty = getQty(tier.id)
                  const available = tier.quantity - tier.quantity_sold
                  const tierTypeColors: Record<string, string> = {
                    general: 'text-zinc-300',
                    vip: 'text-accent',
                    vvip: 'text-purple-400',
                    early_bird: 'text-green-400',
                    custom: 'text-blue-400',
                  }

                  return (
                    <div key={tier.id} className={`p-4 rounded-synlo border transition-all ${qty > 0 ? 'border-accent/40 bg-accent/5' : 'border-zinc-800 bg-zinc-900/50'}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className={`font-semibold text-sm ${tierTypeColors[tier.type] || 'text-zinc-300'}`}>{tier.name}</p>
                            <span className="text-xs text-zinc-600 uppercase tracking-wider">{tier.type}</span>
                          </div>
                          {tier.description && <p className="text-xs text-zinc-500 mb-2">{tier.description}</p>}
                          <p className="font-display text-lg font-bold text-zinc-100">
                            {tier.price === 0 ? 'Free' : formatNaira(tier.price)}
                          </p>
                          <p className="text-xs text-zinc-600 mt-0.5">{available.toLocaleString()} remaining · max {tier.max_per_order}/order</p>
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => updateCart(tier, -1)}
                            disabled={qty === 0}
                            className="w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:border-zinc-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className={`w-6 text-center font-bold text-sm ${qty > 0 ? 'text-zinc-100' : 'text-zinc-600'}`}>{qty}</span>
                          <button
                            onClick={() => updateCart(tier, 1)}
                            disabled={qty >= tier.max_per_order || qty >= available}
                            className="w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:border-zinc-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}

              {/* Fee notice */}
              <div className="flex items-start gap-2.5 p-3 rounded-synlo-sm bg-zinc-800/50 border border-zinc-700/50">
                <AlertCircle className="w-4 h-4 text-zinc-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-zinc-500">A 10% platform fee is added to the ticket price. This supports the Synlo platform.</p>
              </div>
            </div>
          )}

          {step === 'review' && paymentData && (
            <div className="p-5 space-y-4">
              {/* Items */}
              <div className="space-y-2">
                {paymentData.summary.tiers.map((t: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-zinc-300">{t.name} × {t.quantity}</span>
                    <span className="text-zinc-100 font-medium">{formatNaira(t.unit_price * t.quantity * 100)}</span>
                  </div>
                ))}
              </div>
              <div className="divider" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span>{formatNaira(paymentData.subtotal_naira * 100)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Platform fee (10%)</span>
                  <span>{formatNaira(paymentData.platform_fee_naira * 100)}</span>
                </div>
                <div className="flex justify-between font-bold text-base text-zinc-100 pt-1 border-t border-zinc-800">
                  <span>Total</span>
                  <span className="text-accent">{formatNaira(paymentData.amount_naira * 100)}</span>
                </div>
              </div>
              {/* Security badge */}
              <div className="flex items-center gap-2.5 p-3 rounded-synlo-sm bg-green-500/5 border border-green-500/15">
                <ShieldCheck className="w-4 h-4 text-green-400 flex-shrink-0" />
                <p className="text-xs text-green-400/80">Secured by Flutterwave. Your payment is protected.</p>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="p-12 flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-2 border-zinc-700 border-t-accent rounded-full animate-spin" />
              <p className="text-zinc-400 text-sm">Processing your payment…</p>
              <p className="text-zinc-600 text-xs">Please don't close this window</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== 'processing' && (
          <div className="p-5 border-t border-zinc-800 flex-shrink-0">
            {step === 'select' ? (
              <div className="space-y-3">
                {cart.length > 0 && (
                  <div className="flex justify-between text-sm font-medium text-zinc-300 px-1">
                    <span>{totalItems} ticket{totalItems > 1 ? 's' : ''}</span>
                    <span className="text-accent font-bold">{formatNaira(totalKobo)} total</span>
                  </div>
                )}
                <button
                  onClick={handleInitializePayment}
                  disabled={cart.length === 0 || isInitializing}
                  className="btn btn-primary btn-full text-base disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                >
                  {isInitializing ? (
                    <><div className="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" /> Preparing…</>
                  ) : (
                    <>Continue <ChevronRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            ) : step === 'review' && paymentData ? (
              <div className="space-y-2">
                <FlutterwaveButton />
                <button onClick={() => setStep('select')} className="btn btn-ghost btn-full text-sm">← Change selection</button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
