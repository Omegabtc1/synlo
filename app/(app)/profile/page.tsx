// app/(app)/profile/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Phone, FileText, Save, Camera } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { initials } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [form, setForm] = useState({ full_name: '', phone: '', bio: '' })

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase.from('users').select('*').eq('id', user.id).single()
      if (data) {
        setProfile(data)
        setForm({ full_name: data.full_name || '', phone: data.phone || '', bio: data.bio || '' })
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.full_name.trim()) { toast.error('Name is required'); return }
    setSaving(true)
    try {
      const { error } = await supabase
        .from('users')
        .update({ full_name: form.full_name, phone: form.phone, bio: form.bio, updated_at: new Date().toISOString() })
        .eq('id', profile.id)
      if (error) throw error
      setProfile((p: any) => ({ ...p, ...form }))
      toast.success('Profile updated!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-zinc-700 border-t-accent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="border-b border-zinc-800/40 bg-zinc-950/60 py-8">
        <div className="page-container">
          <h1 className="font-display text-3xl font-bold">Profile</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage your account details</p>
        </div>
      </div>

      <div className="page-container py-8 max-w-2xl">
        <div className="space-y-6">
          {/* Avatar */}
          <div className="card p-6 flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center font-display text-2xl font-bold text-white">
                {profile ? initials(profile.full_name) : '?'}
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-zinc-700 border-2 border-zinc-900 flex items-center justify-center text-zinc-300 hover:bg-zinc-600 transition-colors">
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
            <div>
              <p className="font-display font-bold text-lg text-zinc-100">{profile?.full_name}</p>
              <p className="text-sm text-zinc-500">{profile?.email}</p>
              <span className={`inline-block mt-1.5 text-xs px-2.5 py-0.5 rounded-full border font-medium capitalize
                ${profile?.role === 'organizer' ? 'text-accent border-accent/30 bg-accent/10' :
                  profile?.role === 'admin' ? 'text-purple-400 border-purple-500/30 bg-purple-500/10' :
                  'text-zinc-400 border-zinc-700 bg-zinc-800'}`}>
                {profile?.role}
              </span>
            </div>
          </div>

          {/* Edit form */}
          <form onSubmit={handleSave} className="card p-6 space-y-5">
            <h2 className="font-display text-base font-bold">Edit Details</h2>

            <div>
              <label className="label">
                <User className="w-3.5 h-3.5 inline mr-1.5 text-zinc-500" />
                Full Name
              </label>
              <input
                className="input"
                value={form.full_name}
                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                placeholder="Your full name"
                required
              />
            </div>

            <div>
              <label className="label">
                <Mail className="w-3.5 h-3.5 inline mr-1.5 text-zinc-500" />
                Email Address
              </label>
              <input
                className="input opacity-60 cursor-not-allowed"
                value={profile?.email}
                disabled
                title="Email cannot be changed here"
              />
              <p className="text-xs text-zinc-600 mt-1">Contact support to change your email address.</p>
            </div>

            <div>
              <label className="label">
                <Phone className="w-3.5 h-3.5 inline mr-1.5 text-zinc-500" />
                Phone Number <span className="text-zinc-600 font-normal">(optional)</span>
              </label>
              <input
                className="input"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+234 800 000 0000"
                type="tel"
              />
            </div>

            <div>
              <label className="label">
                <FileText className="w-3.5 h-3.5 inline mr-1.5 text-zinc-500" />
                Bio <span className="text-zinc-600 font-normal">(optional)</span>
              </label>
              <textarea
                className="input resize-none min-h-[90px]"
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                placeholder="Tell other Synlo users a bit about yourself…"
                maxLength={300}
              />
              <p className="text-xs text-zinc-600 mt-1 text-right">{form.bio.length}/300</p>
            </div>

            <button type="submit" disabled={saving} className="btn btn-primary btn-md">
              {saving
                ? <><div className="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" /> Saving…</>
                : <><Save className="w-4 h-4" /> Save Changes</>
              }
            </button>
          </form>

          {/* Account info */}
          <div className="card p-6 space-y-3">
            <h2 className="font-display text-base font-bold mb-1">Account Info</h2>
            {[
              { label: 'Member since', value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
              { label: 'Account ID', value: profile?.id?.slice(0, 8) + '…', mono: true },
              { label: 'Verified', value: profile?.is_verified ? '✅ Verified' : '⏳ Unverified' },
            ].map(({ label, value, mono }) => (
              <div key={label} className="flex justify-between items-center text-sm py-2 border-b border-zinc-800 last:border-0">
                <span className="text-zinc-500">{label}</span>
                <span className={`text-zinc-300 ${mono ? 'font-mono text-xs' : ''}`}>{value}</span>
              </div>
            ))}
          </div>

          {/* Danger zone */}
          <div className="card p-6 border-red-900/30 bg-red-950/10">
            <h2 className="font-display text-base font-bold text-red-400 mb-2">Danger Zone</h2>
            <p className="text-sm text-zinc-500 mb-4">
              Logging out will end your current session on this device.
            </p>
            <button
              onClick={async () => {
                await supabase.auth.signOut()
                router.push('/')
                router.refresh()
              }}
              className="btn btn-danger btn-sm"
            >
              Log out of Synlo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
