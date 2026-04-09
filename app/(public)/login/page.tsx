// app/(public)/login/page.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Zap, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('Please fill in all fields.'); return }
    setError('')
    setLoading(true)
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) {
        setError(authError.message === 'Invalid login credentials'
          ? 'Incorrect email or password. Please try again.'
          : authError.message)
        return
      }
      toast.success('Welcome back! 👋')
      router.push(redirect)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />

      <div className="w-full max-w-md animate-fade-up">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 justify-center mb-10 group">
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center group-hover:scale-105 transition-transform shadow-glow-sm">
            <Zap className="w-5 h-5 text-zinc-950 fill-zinc-950" />
          </div>
          <span className="font-display text-xl font-bold">Synlo</span>
        </Link>

        <div className="card p-8 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent" />

          <h1 className="font-display text-2xl font-bold mb-1">Welcome back</h1>
          <p className="text-zinc-500 text-sm mb-8">Sign in to continue your journey 🚀</p>

          {/* Error alert */}
          {error && (
            <div className="flex items-start gap-3 p-3.5 rounded-synlo-sm bg-red-500/10 border border-red-500/25 text-red-400 text-sm mb-6">
              <span className="flex-shrink-0 mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                placeholder="you@example.com"
                className={`input ${error ? 'input-error' : ''}`}
                autoComplete="email"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label mb-0">Password</label>
                <span className="text-xs text-accent cursor-pointer hover:text-orange-400 transition-colors">Forgot password?</span>
              </div>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  placeholder="••••••••"
                  className={`input pr-10 ${error ? 'input-error' : ''}`}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-full mt-2 text-base">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" /> Signing in…</>
              ) : (
                <>Sign in <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="divider flex-1" />
            <span className="text-xs text-zinc-600">or</span>
            <div className="divider flex-1" />
          </div>

          <p className="text-center text-sm text-zinc-500">
            Don't have an account?{' '}
            <Link href="/signup" className="text-accent hover:text-orange-400 font-medium transition-colors">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
