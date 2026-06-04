'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="neo-card p-8 bg-card">
          <div className="w-20 h-20 mx-auto mb-6 bg-destructive neo-border rounded-full flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-destructive-foreground" />
          </div>
          
          <h1 className="text-2xl font-black mb-2">Oops! Something Went Wrong</h1>
          <p className="text-muted-foreground mb-6">
            Don&apos;t worry, it&apos;s not your fault. We&apos;re looking into it.
          </p>
          
          {error.digest && (
            <p className="text-xs text-muted-foreground mb-4 font-mono">
              Error ID: {error.digest}
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="neo-btn bg-primary text-primary-foreground flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <Link
              href="/dashboard"
              className="neo-btn bg-secondary text-secondary-foreground flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go to Dashboard
            </Link>
          </div>
        </div>
        
        <p className="mt-6 text-sm text-muted-foreground">
          If this problem persists, please{' '}
          <a href="mailto:support@vibeos.app" className="text-primary hover:underline font-bold">
            contact support
          </a>
        </p>
      </div>
    </div>
  )
}
