import Link from 'next/link'

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-background polka-dots flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Success Card */}
        <div className="neo-card p-8 text-center bounce-in">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-[hsl(var(--lime))] neo-border rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-black mb-4">Check Your Email!</h1>
          
          <p className="text-muted-foreground mb-6">
            {"We've sent you a confirmation link. Click it to activate your account and start building your startup with VibeOS!"}
          </p>
          
          <div className="space-y-3">
            <Link
              href="/auth/login"
              className="neo-btn block w-full bg-primary text-primary-foreground text-center py-3"
            >
              Back to Login
            </Link>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="flex justify-center gap-4 mt-8">
          <div className="w-4 h-4 bg-[hsl(var(--lime))] rounded-full neo-border float" style={{ animationDelay: '0s' }} />
          <div className="w-4 h-4 bg-secondary rounded-full neo-border float" style={{ animationDelay: '0.5s' }} />
          <div className="w-4 h-4 bg-accent rounded-full neo-border float" style={{ animationDelay: '1s' }} />
        </div>
      </div>
    </div>
  )
}
