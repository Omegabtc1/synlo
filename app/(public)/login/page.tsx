'use client'

// app/(public)/login/page.tsx
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Zap, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

// Inner component uses useSearchParams — must be wrapped in Suspense
function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError('Please fill in all fields.')
      return
    }

    setError('')
    setLoading(true)

    try {
      const supabase = createClient()

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('Incorrect email or password. Please try again.')
        } else if (authError.message.includes('Email not confirmed')) {
          setError('Please verify your email address first.')
        } else {
          setError(authError.message)
        }
        return
      }

      // ── CRITICAL FIX ────────────────────────────────────────────────
      // After signInWithPassword, Supabase has set the session cookie
      // in the browser. BUT Next.js server components won't see the
      // new cookie until we do BOTH:
      //   1. router.refresh() — tells Next.js to re-run server components
      //      with the updated cookies (this is what makes the dashboard load)
      //   2. router.push() — navigates to the protected route
      //
      // The ORDER matters: refresh first, then push.
      // Without router.refresh(), the app/(app)/layout.tsx server component
      // runs with the OLD cookies (no session) and redirects back to /login.
      // ────────────────────────────────────────────────────────────────

      toast.success('Welcome back! 👋')
      router.refresh()
      router.push(redirectTo)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4" noValidate>
      {/* Error alert */}
      {error && (
        <div className="flex items-start gap-3 p-3.5 rounded-[var(--radius-sm)] bg-red-50 border border-red-200 text-red-700 text-sm animate-fade-in">
          <span className="flex-shrink-0 mt-0.5">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Email */}
      <div className="field">
        <label className="label" htmlFor="email">Email address</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError('') }}
          placeholder="you@example.com"
          className={`input ${error ? 'input-error' : ''}`}
          autoComplete="email"
          autoFocus
          required
        />
      </div>

      {/* Password */}
      <div className="field">
        <div className="flex items-center justify-between mb-1.5">
          <label className="label mb-0" htmlFor="password">Password</label>
          <button
            type="button"
            className="text-xs text-[var(--color-accent)] hover:underline"
            onClick={() => toast('Password reset coming soon')}
          >
            Forgot password?
          </button>
        </div>
        <div className="relative">
          <input
            id="password"
            type={showPwd ? 'text' : 'password'}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError('') }}
            placeholder="••••••••"
            className={`input pr-11 ${error ? 'input-error' : ''}`}
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPwd(!showPwd)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-3)] hover:text-[var(--color-text-2)] transition-colors"
            aria-label={showPwd ? 'Hide password' : 'Show password'}
          >
            {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="btn btn-dark btn-full mt-2"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Signing in…
          </>
        ) : (
          <>
            Sign in
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-20"
      style={{
        background: 'var(--color-bg)',
        backgroundImage: 'radial-gradient(ellipse 60% 40% at 50% 100%, rgba(232,65,10,0.06) 0%, transparent 70%)',
      }}
    >
      <div className="w-full max-w-[420px] animate-fade-up">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-10 group">
          <div className="w-9 h-9 rounded-xl bg-[var(--color-accent)] flex items-center justify-center shadow-[0_2px_12px_rgba(232,65,10,0.35)] group-hover:shadow-[0_4px_20px_rgba(232,65,10,0.45)] transition-shadow">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <span
            className="text-xl font-bold tracking-[-0.035em]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Synlo
          </span>
        </Link>

        {/* Card */}
        <div
          className="bg-white rounded-2xl p-8 relative overflow-hidden"
          style={{
            border: '1px solid var(--color-border)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          }}
        >
          {/* Top accent bar */}
          <div
            className="absolute inset-x-0 top-0 h-[3px]"
            style={{ background: 'linear-gradient(90deg, transparent, var(--color-accent), transparent)' }}
          />

          <h1
            className="text-2xl font-extrabold mb-1 tracking-tight"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.035em' }}
          >
            Welcome back
          </h1>
          <p className="text-sm mb-7" style={{ color: 'var(--color-text-3)' }}>
            Sign in to your Synlo account
          </p>

          <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100 rounded-lg" />}>
            <LoginForm />
          </Suspense>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--color-text-3)' }}>
            Don&apos;t have an account?{' '}
            <Link
              href="/signup"
              className="font-semibold hover:underline"
              style={{ color: 'var(--color-accent)' }}
            >
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
