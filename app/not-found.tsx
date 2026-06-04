import Link from 'next/link'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="neo-card p-8 bg-card">
          <div className="w-24 h-24 mx-auto mb-6 bg-primary neo-border rounded-full flex items-center justify-center">
            <span className="text-5xl font-black text-primary-foreground">404</span>
          </div>
          
          <h1 className="text-2xl font-black mb-2">Page Not Found</h1>
          <p className="text-muted-foreground mb-6">
            Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard"
              className="neo-btn bg-primary text-primary-foreground flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go to Dashboard
            </Link>
            <Link
              href="/"
              className="neo-btn bg-secondary text-secondary-foreground flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
        
        <p className="mt-6 text-sm text-muted-foreground">
          If you think this is a mistake, please{' '}
          <a href="mailto:support@vibeos.app" className="text-primary hover:underline font-bold">
            contact support
          </a>
        </p>
      </div>
    </div>
  )
}
