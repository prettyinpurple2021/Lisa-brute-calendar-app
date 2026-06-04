'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="en">
      <body className="bg-background">
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="border-4 border-black rounded-3xl p-8 bg-white shadow-[8px_8px_0_0_#1a1a2e]">
              <div className="w-20 h-20 mx-auto mb-6 bg-red-500 border-4 border-black rounded-full flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-white" />
              </div>
              
              <h1 className="text-2xl font-black mb-2">Something Went Wrong</h1>
              <p className="text-gray-600 mb-6">
                We encountered an unexpected error. Our team has been notified and is working on a fix.
              </p>
              
              {error.digest && (
                <p className="text-xs text-gray-400 mb-4 font-mono">
                  Error ID: {error.digest}
                </p>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={reset}
                  className="px-6 py-3 border-4 border-black rounded-xl font-bold bg-lime-400 hover:bg-lime-500 transition-colors flex items-center justify-center gap-2 shadow-[4px_4px_0_0_#1a1a2e] hover:translate-y-[-2px]"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
                <Link
                  href="/"
                  className="px-6 py-3 border-4 border-black rounded-xl font-bold bg-white hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-[4px_4px_0_0_#1a1a2e] hover:translate-y-[-2px]"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </Link>
              </div>
            </div>
            
            <p className="mt-6 text-sm text-gray-500">
              If this problem persists, please{' '}
              <a href="mailto:support@vibeos.app" className="text-pink-500 hover:underline font-bold">
                contact support
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}
