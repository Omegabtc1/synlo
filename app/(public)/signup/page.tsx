// app/(public)/signup/page.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Zap, ArrowRight, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'attendee' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()
  const supabase = createClient()

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email address'
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters'
    return errs
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: { full_name: form.name, role: form.role },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
      })
      if (error) { setErrors({ form: error.message }); return }
      toast.success('Account created! Welcome to Synlo 🎉')
      router.push('/dashboard')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  const pwdStrength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3
  const pwdColors = ['', 'bg-red-500', 'bg-yellow-500', 'bg-green-500']
  const pwdLabels = ['', 'Weak', 'Good', 'Strong']

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />

      <div className="w-full max-w-md animate-fade-up">
        <Link href="/" className="flex items-center gap-2 justify-center mb-10 group">
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center group-hover:scale-105 transition-transform shadow-glow-sm">
            <Zap className="w-5 h-5 text-zinc-950 fill-zinc-950" />
          </div>
          <span className="font-display text-xl font-bold">Synlo</span>
        </Link>

        <div className="card p-8 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent" />

          <h1 className="font-display text-2xl font-bold mb-1">Create your account</h1>
          <p className="text-zinc-500 text-sm mb-8">Join thousands of Nigerians on Synlo 🇳🇬</p>

          {errors.form && (
            <div className="p-3.5 rounded-synlo-sm bg-red-500/10 border border-red-500/25 text-red-400 text-sm mb-6">
              ⚠️ {errors.form}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Chukwuemeka Okafor"
                className={`input ${errors.name ? 'input-error' : ''}`}
                autoComplete="name"
              />
              {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
                className={`input ${errors.email ? 'input-error' : ''}`}
                autoComplete="email"
              />
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Min. 8 characters"
                  className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password strength */}
              {form.password.length > 0 && (
                <div className="mt-1.5 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full ${i <= pwdStrength ? pwdColors[pwdStrength] : 'bg-zinc-800'} transition-all`} />
                    ))}
                  </div>
                  <p className={`text-xs ${pwdStrength === 1 ? 'text-red-400' : pwdStrength === 2 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {pwdLabels[pwdStrength]} password
                  </p>
                </div>
              )}
              {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
            </div>

            {/* Role selection */}
            <div>
              <label className="label">I'm joining as</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'attendee', label: '🎟️ Attendee', desc: 'Discover & buy tickets' },
                  { value: 'organizer', label: '🎪 Organiser', desc: 'Create & manage events' },
                ].map(({ value, label, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, role: value }))}
                    className={`p-3 rounded-synlo text-left border transition-all ${
                      form.role === value
                        ? 'border-accent/50 bg-accent/8 text-zinc-100'
                        : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="font-medium text-sm">{label}</span>
                      {form.role === value && <Check className="w-3.5 h-3.5 text-accent mt-0.5" />}
                    </div>
                    <p className="text-xs text-zinc-600 mt-0.5">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-zinc-600">
              By signing up, you agree to our{' '}
              <span className="text-accent cursor-pointer">Terms of Service</span> and{' '}
              <span className="text-accent cursor-pointer">Privacy Policy</span>.
            </p>

            <button type="submit" disabled={loading} className="btn btn-primary btn-full text-base">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" /> Creating account…</>
              ) : (
                <>Create Account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-accent hover:text-orange-400 font-medium transition-colors">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
