import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-background polka-dots flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Error Card */}
        <div className="neo-card p-8 text-center bounce-in">
          {/* Error Icon */}
          <div className="w-20 h-20 bg-destructive neo-border rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-destructive-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-black mb-4">Oops! Something went wrong</h1>
          
          <p className="text-muted-foreground mb-6">
            We couldn&apos;t complete your authentication. This might be because the link expired or was already used.
          </p>
          
          <div className="space-y-3">
            <Link
              href="/auth/login"
              className="neo-btn block w-full bg-primary text-primary-foreground text-center py-3"
            >
              Try Again
            </Link>
            <Link
              href="/auth/sign-up"
              className="neo-btn block w-full bg-secondary text-secondary-foreground text-center py-3"
            >
              Create New Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
