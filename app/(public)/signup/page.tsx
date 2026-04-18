'use client'

// app/(public)/signup/page.tsx
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Zap, ArrowRight, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

type Role = 'attendee' | 'organizer'

function getPasswordStrength(pwd: string): 0 | 1 | 2 | 3 {
  if (!pwd) return 0
  if (pwd.length < 6) return 1
  if (pwd.length < 10) return 2
  return 3
}

const STRENGTH_LABEL = ['', 'Weak', 'Fair', 'Strong']
const STRENGTH_COLOR = ['', 'bg-red-400', 'bg-yellow-400', 'bg-green-500']
const STRENGTH_TEXT  = ['', 'text-red-500', 'text-yellow-600', 'text-green-600']

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [role, setRole] = useState<Role>('attendee')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()

  const strength = getPasswordStrength(form.password)

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!form.name.trim() || form.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters'
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Please enter a valid email address'
    }
    if (form.password.length < 8) {
      errs.password = 'Password must be at least 8 characters'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)

    try {
      const supabase = createClient()

      const { error: authError } = await supabase.auth.signUp({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        options: {
          data: {
            full_name: form.name.trim(),
            role,
          },
          // Only set emailRedirectTo if email confirmation is ON
          // For local dev with confirmation OFF, this is ignored
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
          setErrors({ email: 'An account with this email already exists.' })
        } else {
          setErrors({ form: authError.message })
        }
        return
      }

      // ── SAME CRITICAL FIX AS LOGIN ───────────────────────────────────
      // router.refresh() re-runs server components with the new session
      // cookies. Without it, the app/(app)/layout.tsx sees no session
      // and kicks the user back to /login.
      // ────────────────────────────────────────────────────────────────
      toast.success('Account created! Welcome to Synlo 🎉')
      router.refresh()
      router.push('/dashboard')
    } catch (err) {
      setErrors({ form: 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const update = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }))
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-20"
      style={{
        background: 'var(--color-bg)',
        backgroundImage: 'radial-gradient(ellipse 60% 40% at 50% 100%, rgba(232,65,10,0.06) 0%, transparent 70%)',
      }}
    >
      <div className="w-full max-w-[440px] animate-fade-up">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-10 group">
          <div className="w-9 h-9 rounded-xl bg-[var(--color-accent)] flex items-center justify-center shadow-[0_2px_12px_rgba(232,65,10,0.35)] group-hover:shadow-[0_4px_20px_rgba(232,65,10,0.45)] transition-shadow">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="text-xl font-bold tracking-[-0.035em]" style={{ fontFamily: 'var(--font-display)' }}>
            Synlo
          </span>
        </Link>

        {/* Card */}
        <div
          className="bg-white rounded-2xl p-8 relative overflow-hidden"
          style={{ border: '1px solid var(--color-border)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
        >
          <div className="absolute inset-x-0 top-0 h-[3px]"
            style={{ background: 'linear-gradient(90deg, transparent, var(--color-accent), transparent)' }}
          />

          <h1 className="text-2xl font-extrabold mb-1 tracking-tight" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.035em' }}>
            Create your account
          </h1>
          <p className="text-sm mb-7" style={{ color: 'var(--color-text-3)' }}>
            Join thousands of event-goers on Synlo
          </p>

          {/* Form-level error */}
          {errors.form && (
            <div className="flex items-start gap-3 p-3.5 rounded-[var(--radius-sm)] bg-red-50 border border-red-200 text-red-700 text-sm mb-5 animate-fade-in">
              ⚠️ {errors.form}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4" noValidate>
            {/* Full name */}
            <div className="field">
              <label className="label" htmlFor="name">Full name</label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="Ada Okafor"
                className={`input ${errors.name ? 'input-error' : ''}`}
                autoComplete="name"
                autoFocus
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="field">
              <label className="label" htmlFor="signup-email">Email address</label>
              <input
                id="signup-email"
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="you@example.com"
                className={`input ${errors.email ? 'input-error' : ''}`}
                autoComplete="email"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="field">
              <label className="label" htmlFor="signup-password">Password</label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  placeholder="At least 8 characters"
                  className={`input pr-11 ${errors.password ? 'input-error' : ''}`}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-3)] hover:text-[var(--color-text-2)] transition-colors"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Strength meter */}
              {form.password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? STRENGTH_COLOR[strength] : 'bg-[var(--color-border)]'}`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${STRENGTH_TEXT[strength]}`}>
                    {STRENGTH_LABEL[strength]} password
                  </p>
                </div>
              )}
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            {/* Role selector */}
            <div className="field">
              <label className="label">I&apos;m joining as</label>
              <div className="grid grid-cols-2 gap-2.5">
                {([
                  { value: 'attendee', icon: '🎟️', label: 'Attendee', desc: 'Discover & buy tickets' },
                  { value: 'organizer', icon: '🎪', label: 'Organiser', desc: 'Create & sell tickets' },
                ] as const).map(({ value, icon, label, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRole(value)}
                    className={`relative p-4 rounded-xl text-left border-2 transition-all duration-150 ${
                      role === value
                        ? 'border-[var(--color-accent)] bg-[var(--color-accent-bg)]'
                        : 'border-[var(--color-border)] hover:border-[var(--color-border-2)] bg-white'
                    }`}
                  >
                    {role === value && (
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[var(--color-accent)] flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                      </div>
                    )}
                    <span className="text-xl block mb-1">{icon}</span>
                    <p className="font-semibold text-sm text-[var(--color-text)]">{label}</p>
                    <p className="text-xs text-[var(--color-text-3)] mt-0.5">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Terms */}
            <p className="text-xs" style={{ color: 'var(--color-text-3)' }}>
              By signing up, you agree to our{' '}
              <span className="text-[var(--color-accent)] cursor-pointer hover:underline">Terms of Service</span>
              {' '}and{' '}
              <span className="text-[var(--color-accent)] cursor-pointer hover:underline">Privacy Policy</span>.
            </p>

            {/* Submit */}
            <button type="submit" disabled={loading} className="btn btn-dark btn-full">
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--color-text-3)' }}>
            Already have an account?{' '}
            <Link href="/login" className="font-semibold hover:underline" style={{ color: 'var(--color-accent)' }}>
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
