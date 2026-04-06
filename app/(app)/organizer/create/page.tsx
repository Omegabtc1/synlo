// app/(app)/organizer/create/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Upload, Info } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import { slugify, nairaToKobo, CATEGORY_META, NIGERIAN_CITIES } from '@/lib/utils'

interface TierForm { name: string; type: string; description: string; price: string; quantity: string; max_per_order: string }

const DEFAULT_TIER: TierForm = { name: '', type: 'general', description: '', price: '', quantity: '', max_per_order: '10' }

export default function CreateEventPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  const [form, setForm] = useState({
    title: '', description: '', category: 'tech', tags: '',
    venue_name: '', venue_address: '', city: 'Lagos', state: 'Lagos',
    starts_at: '', ends_at: '',
    capacity: '500', is_private: false, status: 'draft',
    cover_image: '',
  })
  const [tiers, setTiers] = useState<TierForm[]>([{ ...DEFAULT_TIER, name: 'General', type: 'general' }])

  const updateField = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))
  const updateTier = (i: number, k: string, v: string) =>
    setTiers(prev => prev.map((t, idx) => idx === i ? { ...t, [k]: v } : t))

  const handleSubmit = async (publish: boolean) => {
    if (!form.title || !form.description || !form.venue_name || !form.starts_at || !form.ends_at) {
      toast.error('Please fill in all required fields')
      setStep(1)
      return
    }
    if (!tiers.length || tiers.some(t => !t.name || !t.quantity)) {
      toast.error('Please configure at least one ticket tier')
      setStep(2)
      return
    }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const slug = slugify(form.title) + '-' + Date.now().toString(36)

      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert({
          organizer_id: user.id,
          title: form.title,
          slug,
          description: form.description,
          category: form.category,
          tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
          venue_name: form.venue_name,
          venue_address: form.venue_address,
          city: form.city,
          state: form.state,
          starts_at: form.starts_at,
          ends_at: form.ends_at,
          capacity: parseInt(form.capacity),
          is_private: form.is_private,
          status: publish ? 'published' : 'draft',
          cover_image: form.cover_image || null,
        })
        .select()
        .single()

      if (eventError) throw eventError

      // Create ticket tiers
      await supabase.from('ticket_tiers').insert(
        tiers.map(t => ({
          event_id: event.id,
          name: t.name,
          type: t.type,
          description: t.description || null,
          price: t.price ? nairaToKobo(parseFloat(t.price)) : 0,
          quantity: parseInt(t.quantity),
          max_per_order: parseInt(t.max_per_order) || 10,
        }))
      )

      toast.success(publish ? '🎉 Event published!' : 'Event saved as draft')
      router.push(`/organizer/events/${event.id}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <div className="border-b border-zinc-800/40 bg-zinc-950/60 py-6">
        <div className="page-container flex items-center gap-4">
          <button onClick={() => router.back()} className="btn btn-ghost btn-sm">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold">Create Event</h1>
            <p className="text-zinc-500 text-sm">Step {step} of 3</p>
          </div>
        </div>
        {/* Steps */}
        <div className="page-container mt-4">
          <div className="flex gap-2">
            {['Event Details', 'Tickets', 'Review'].map((s, i) => (
              <button key={s} onClick={() => setStep(i + 1)}
                className={`flex-1 py-2 text-xs font-semibold rounded-synlo-sm transition-all ${step === i + 1 ? 'bg-accent text-zinc-950' : step > i + 1 ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-900 text-zinc-600'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="page-container py-8 max-w-3xl">
        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-up">
            <div className="card p-6 space-y-5">
              <h2 className="font-display text-lg font-bold">Event Details</h2>

              <div>
                <label className="label">Event Title <span className="text-red-400">*</span></label>
                <input className="input" value={form.title} onChange={e => updateField('title', e.target.value)} placeholder="e.g. Lagos Tech Connect 2025" />
              </div>

              <div>
                <label className="label">Description <span className="text-red-400">*</span></label>
                <textarea className="input min-h-[140px] resize-none" value={form.description}
                  onChange={e => updateField('description', e.target.value)}
                  placeholder="Tell attendees what makes this event special…" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Category</label>
                  <select className="input" value={form.category} onChange={e => updateField('category', e.target.value)}>
                    {Object.entries(CATEGORY_META).map(([k, { label, emoji }]) => (
                      <option key={k} value={k}>{emoji} {label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Tags <span className="text-zinc-600 font-normal">(comma separated)</span></label>
                  <input className="input" value={form.tags} onChange={e => updateField('tags', e.target.value)} placeholder="networking, startup, tech" />
                </div>
              </div>

              <div>
                <label className="label">Cover Image URL <span className="text-zinc-600 font-normal">(optional)</span></label>
                <input className="input" value={form.cover_image} onChange={e => updateField('cover_image', e.target.value)} placeholder="https://..." />
                <p className="text-xs text-zinc-600 mt-1">Recommended: 1200×628px. Upload to Cloudinary or Supabase Storage.</p>
              </div>
            </div>

            <div className="card p-6 space-y-5">
              <h2 className="font-display text-lg font-bold">Venue & Time</h2>
              <div>
                <label className="label">Venue Name <span className="text-red-400">*</span></label>
                <input className="input" value={form.venue_name} onChange={e => updateField('venue_name', e.target.value)} placeholder="The Zone Tech Hub" />
              </div>
              <div>
                <label className="label">Address</label>
                <input className="input" value={form.venue_address} onChange={e => updateField('venue_address', e.target.value)} placeholder="123 Victoria Island, Lagos" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">City</label>
                  <select className="input" value={form.city} onChange={e => updateField('city', e.target.value)}>
                    {NIGERIAN_CITIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Capacity</label>
                  <input type="number" className="input" value={form.capacity} onChange={e => updateField('capacity', e.target.value)} min="1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Start Date & Time <span className="text-red-400">*</span></label>
                  <input type="datetime-local" className="input" value={form.starts_at} onChange={e => updateField('starts_at', e.target.value)} />
                </div>
                <div>
                  <label className="label">End Date & Time <span className="text-red-400">*</span></label>
                  <input type="datetime-local" className="input" value={form.ends_at} onChange={e => updateField('ends_at', e.target.value)} />
                </div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-10 h-6 rounded-full transition-colors ${form.is_private ? 'bg-accent' : 'bg-zinc-700'} relative`}
                  onClick={() => updateField('is_private', !form.is_private)}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.is_private ? 'left-5' : 'left-1'}`} />
                </div>
                <span className="text-sm text-zinc-300">Private event (invite only)</span>
              </label>
            </div>
            <div className="flex justify-end">
              <button onClick={() => setStep(2)} className="btn btn-primary btn-md">Next: Ticket Setup →</button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-up">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display text-lg font-bold">Ticket Tiers</h2>
              <button onClick={() => setTiers(t => [...t, { ...DEFAULT_TIER }])} className="btn btn-ghost btn-sm">
                <Plus className="w-4 h-4" /> Add Tier
              </button>
            </div>

            <div className="flex items-start gap-2 p-3.5 rounded-synlo-sm bg-blue-500/8 border border-blue-500/15 text-blue-400 text-xs mb-4">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>Set your ticket price — a 10% platform fee will be added on top when buyers check out. You receive your full ticket price.</span>
            </div>

            {tiers.map((tier, i) => (
              <div key={i} className="card p-5 space-y-4 relative">
                <div className="absolute top-3 right-3">
                  {tiers.length > 1 && (
                    <button onClick={() => setTiers(t => t.filter((_, idx) => idx !== i))}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <h3 className="font-semibold text-sm text-zinc-300">Tier {i + 1}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Tier Name</label>
                    <input className="input" value={tier.name} onChange={e => updateTier(i, 'name', e.target.value)} placeholder="e.g. General, VIP" />
                  </div>
                  <div>
                    <label className="label">Type</label>
                    <select className="input" value={tier.type} onChange={e => updateTier(i, 'type', e.target.value)}>
                      <option value="general">General</option>
                      <option value="vip">VIP</option>
                      <option value="vvip">VVIP</option>
                      <option value="early_bird">Early Bird</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Description <span className="text-zinc-600 font-normal">(optional)</span></label>
                  <input className="input" value={tier.description} onChange={e => updateTier(i, 'description', e.target.value)} placeholder="What's included?" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="label">Price (₦)</label>
                    <input type="number" className="input" value={tier.price} onChange={e => updateTier(i, 'price', e.target.value)} placeholder="0 = Free" min="0" />
                  </div>
                  <div>
                    <label className="label">Quantity</label>
                    <input type="number" className="input" value={tier.quantity} onChange={e => updateTier(i, 'quantity', e.target.value)} placeholder="100" min="1" />
                  </div>
                  <div>
                    <label className="label">Max / Order</label>
                    <input type="number" className="input" value={tier.max_per_order} onChange={e => updateTier(i, 'max_per_order', e.target.value)} placeholder="10" min="1" />
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-between mt-4">
              <button onClick={() => setStep(1)} className="btn btn-ghost btn-md">← Back</button>
              <button onClick={() => setStep(3)} className="btn btn-primary btn-md">Review Event →</button>
            </div>
          </div>
        )}

        {/* STEP 3 — Review */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-up">
            <div className="card p-6">
              <h2 className="font-display text-lg font-bold mb-4">Review & Publish</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm"><span className="text-zinc-500">Title</span><span className="text-zinc-100 font-medium">{form.title}</span></div>
                <div className="flex justify-between text-sm"><span className="text-zinc-500">Category</span><span>{CATEGORY_META[form.category]?.emoji} {CATEGORY_META[form.category]?.label}</span></div>
                <div className="flex justify-between text-sm"><span className="text-zinc-500">Venue</span><span className="text-right">{form.venue_name}, {form.city}</span></div>
                <div className="flex justify-between text-sm"><span className="text-zinc-500">Capacity</span><span>{form.capacity} attendees</span></div>
                <div className="divider my-2" />
                <p className="text-sm font-semibold text-zinc-300">Ticket Tiers</p>
                {tiers.map((t, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-zinc-400">{t.name} ({t.type})</span>
                    <span>{t.price ? `₦${t.price} × ${t.quantity}` : `Free × ${t.quantity}`}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => setStep(2)} className="btn btn-ghost btn-md">← Back</button>
              <button onClick={() => handleSubmit(false)} disabled={loading} className="btn btn-ghost btn-md flex-1">
                {loading ? 'Saving…' : 'Save as Draft'}
              </button>
              <button onClick={() => handleSubmit(true)} disabled={loading} className="btn btn-primary btn-md flex-1">
                {loading ? <><div className="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" /> Publishing…</> : '🚀 Publish Event'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
