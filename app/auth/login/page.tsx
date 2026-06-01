'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-background polka-dots flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8 slide-up">
          <div className="inline-block neo-border bg-primary text-primary-foreground px-6 py-3 rounded-lg neo-shadow-lg mb-4">
            <h1 className="text-3xl font-black tracking-tight">VibeOS</h1>
          </div>
          <p className="text-muted-foreground font-medium">Your AI-powered startup command center</p>
        </div>

        {/* Login Card */}
        <div className="neo-card p-8 slide-up stagger-2">
          <h2 className="text-2xl font-black mb-6 text-center">Welcome Back!</h2>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-bold mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="neo-input w-full"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="neo-input w-full"
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div className="neo-border bg-destructive/10 border-destructive text-destructive px-4 py-3 rounded-lg text-sm font-medium bounce-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="neo-btn w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-lg py-3"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-3 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {"Don't have an account?"}{' '}
              <Link href="/auth/sign-up" className="font-bold text-primary hover:text-secondary transition-colors underline underline-offset-4">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="flex justify-center gap-4 mt-8">
          <div className="w-4 h-4 bg-primary rounded-full neo-border animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-4 h-4 bg-secondary rounded-full neo-border animate-bounce" style={{ animationDelay: '0.1s' }} />
          <div className="w-4 h-4 bg-accent rounded-full neo-border animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>
      </div>
    </div>
  )
}
