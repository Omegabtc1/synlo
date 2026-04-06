// app/(app)/affiliate/page.tsx
import Link from 'next/link'
import { TrendingUp, Copy, DollarSign, MousePointer, RefreshCw, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatNaira } from '@/lib/utils'
import { AffiliateActions } from '@/components/affiliate/AffiliateActions'

export default async function AffiliatePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: affiliates = [] } = await supabase
    .from('affiliates')
    .select('*, event:events(id, title, slug, city, starts_at, status)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const totalEarned = affiliates.reduce((sum: number, a: any) => sum + a.total_earned, 0)
  const totalWithdrawn = affiliates.reduce((sum: number, a: any) => sum + a.total_withdrawn, 0)
  const available = totalEarned - totalWithdrawn
  const totalClicks = affiliates.reduce((sum: number, a: any) => sum + a.clicks, 0)
  const totalConversions = affiliates.reduce((sum: number, a: any) => sum + a.conversions, 0)
  const conversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : '0'

  return (
    <div className="min-h-screen">
      <div className="border-b border-zinc-800/40 bg-zinc-950/60 py-8">
        <div className="page-container">
          <h1 className="font-display text-3xl font-bold">Affiliate Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-1">Earn 5% commission on every ticket sold through your links</p>
        </div>
      </div>

      <div className="page-container py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <DollarSign className="w-5 h-5 text-green-400 mb-2" />
            <p className="stat-value">{formatNaira(totalEarned)}</p>
            <p className="stat-label">Total Earned</p>
          </div>
          <div className="stat-card relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent" />
            <TrendingUp className="w-5 h-5 text-accent mb-2" />
            <p className="stat-value text-accent">{formatNaira(available)}</p>
            <p className="stat-label">Available Balance</p>
          </div>
          <div className="stat-card">
            <MousePointer className="w-5 h-5 text-blue-400 mb-2" />
            <p className="stat-value">{totalClicks.toLocaleString()}</p>
            <p className="stat-label">Total Clicks</p>
          </div>
          <div className="stat-card">
            <RefreshCw className="w-5 h-5 text-purple-400 mb-2" />
            <p className="stat-value">{conversionRate}%</p>
            <p className="stat-label">Conversion Rate</p>
          </div>
        </div>

        {/* Withdraw CTA */}
        {available > 0 && (
          <div className="card p-5 bg-gradient-to-r from-green-950/30 to-zinc-900 border-green-800/30 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-display font-bold text-zinc-100">Ready to withdraw</p>
              <p className="text-sm text-zinc-500 mt-0.5">You have {formatNaira(available)} available for withdrawal</p>
            </div>
            <button className="btn btn-primary btn-md">
              <DollarSign className="w-4 h-4" /> Withdraw Funds
            </button>
          </div>
        )}

        {/* Affiliate links */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-bold">Your Affiliate Links</h2>
            <Link href="/explore" className="btn btn-ghost btn-sm">
              <Plus className="w-4 h-4" /> Join Event
            </Link>
          </div>

          {affiliates.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-5xl mb-4">🤝</p>
              <p className="font-display text-xl font-bold text-zinc-300 mb-2">No affiliate links yet</p>
              <p className="text-zinc-500 mb-6">Browse events and become an affiliate to start earning</p>
              <Link href="/explore" className="btn btn-primary btn-md">Browse Events</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {affiliates.map((aff: any) => (
                <div key={aff.id} className="card p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                    <div>
                      <p className="font-display font-bold text-zinc-100">{aff.event?.title}</p>
                      <p className="text-sm text-zinc-500">{aff.event?.city} · {Math.round(aff.commission_rate * 100)}% commission</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-lg font-bold text-accent">{formatNaira(aff.total_earned)}</p>
                      <p className="text-xs text-zinc-600">earned</p>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: 'Clicks', value: aff.clicks.toLocaleString() },
                      { label: 'Conversions', value: aff.conversions.toLocaleString() },
                      { label: 'Rate', value: aff.clicks > 0 ? `${((aff.conversions / aff.clicks) * 100).toFixed(1)}%` : '—' },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-zinc-800/50 rounded-synlo-sm p-3 text-center">
                        <p className="font-bold text-sm text-zinc-100">{value}</p>
                        <p className="text-xs text-zinc-600">{label}</p>
                      </div>
                    ))}
                  </div>

                  <AffiliateActions
                    referralCode={aff.referral_code}
                    eventSlug={aff.event?.slug}
                    eventTitle={aff.event?.title}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* How it works */}
        <div className="card p-6">
          <h3 className="font-display font-bold mb-4">How Affiliate Earnings Work</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            {[
              { step: '1', text: 'Share your unique referral link to an event' },
              { step: '2', text: 'Someone clicks your link and buys a ticket' },
              { step: '3', text: 'You earn 5% of the ticket subtotal, automatically' },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-xs font-bold flex-shrink-0">
                  {step}
                </div>
                <p className="text-zinc-400">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
