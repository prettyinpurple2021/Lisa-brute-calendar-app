'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
          `${window.location.origin}/auth/callback`,
        data: {
          display_name: displayName || email.split('@')[0],
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/auth/sign-up-success')
    }
  }

  return (
    <div className="min-h-screen bg-background polka-dots flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8 slide-up">
          <div className="inline-block neo-border bg-secondary text-secondary-foreground px-6 py-3 rounded-lg neo-shadow-lg mb-4">
            <h1 className="text-3xl font-black tracking-tight">VibeOS</h1>
          </div>
          <p className="text-muted-foreground font-medium">Start building your startup today</p>
        </div>

        {/* Sign Up Card */}
        <div className="neo-card p-8 slide-up stagger-2">
          <h2 className="text-2xl font-black mb-6 text-center">Create Account</h2>
          
          <form onSubmit={handleSignUp} className="space-y-5">
            <div>
              <label htmlFor="displayName" className="block text-sm font-bold mb-2">
                Display Name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="neo-input w-full"
                placeholder="Your name"
              />
            </div>

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
                placeholder="At least 6 characters"
                minLength={6}
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
              className="neo-btn w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed text-lg py-3"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-3 border-secondary-foreground/30 border-t-secondary-foreground rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                'Sign Up'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-bold text-secondary hover:text-primary transition-colors underline underline-offset-4">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="flex justify-center gap-4 mt-8">
          <div className="w-4 h-4 bg-secondary rounded-full neo-border animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-4 h-4 bg-accent rounded-full neo-border animate-bounce" style={{ animationDelay: '0.1s' }} />
          <div className="w-4 h-4 bg-primary rounded-full neo-border animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>
      </div>
    </div>
  )
}
