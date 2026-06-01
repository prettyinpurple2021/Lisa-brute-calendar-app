import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Sparkles, Zap, Calendar, CheckSquare, FileText, BarChart2, MessageCircle, Folder, ArrowRight } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If logged in, redirect to dashboard
  if (user) {
    redirect('/dashboard')
  }

  // Otherwise show landing page
  return (
    <div className="min-h-screen bg-background polka-dots">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card neo-border border-t-0 border-x-0 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary neo-border rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-black">VibeOS</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="neo-btn bg-muted px-4 py-2">
              Sign In
            </Link>
            <Link href="/auth/sign-up" className="neo-btn bg-primary text-primary-foreground px-4 py-2">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center py-16 lg:py-24">
            <div className="inline-block neo-card bg-secondary px-4 py-2 mb-6 bounce-in">
              <p className="text-sm font-bold">Built for solo founders using AI</p>
            </div>
            <h1 className="text-4xl lg:text-6xl font-black mb-6 slide-up">
              Your Startup{' '}
              <span className="text-primary">Command Center</span>
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 slide-up stagger-2">
              7 essential apps in one funky interface. Track habits, manage tasks, log energy, 
              and build your startup - all with a Lisa Frank Y2K vibe.
            </p>
            <div className="flex flex-wrap justify-center gap-4 slide-up stagger-3">
              <Link href="/auth/sign-up" className="neo-btn bg-primary text-primary-foreground px-8 py-4 text-lg flex items-center gap-2">
                Start Building <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/auth/login" className="neo-btn bg-card px-8 py-4 text-lg">
                Sign In
              </Link>
            </div>
          </div>

          {/* Apps Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {[
              { icon: Calendar, name: 'Calendar', color: 'bg-secondary', desc: 'Schedule events' },
              { icon: CheckSquare, name: 'Tasks', color: 'bg-accent', desc: 'Track work per app' },
              { icon: FileText, name: 'Notes', color: 'bg-lime', desc: 'Quick capture inbox' },
              { icon: BarChart2, name: 'Analytics', color: 'bg-neon-purple', desc: 'Habits & energy' },
              { icon: MessageCircle, name: 'AI Chat', color: 'bg-hot-orange', desc: 'Coming soon' },
              { icon: Folder, name: 'Files', color: 'bg-electric-blue', desc: 'Coming soon' },
              { icon: Zap, name: 'Quick Capture', color: 'bg-primary', desc: 'Cmd+K anywhere' },
              { icon: Sparkles, name: 'Dashboard', color: 'bg-magenta', desc: 'Daily planning' },
            ].map((app, i) => (
              <div 
                key={app.name} 
                className={`neo-card p-4 ${app.color} slide-up`}
                style={{ animationDelay: `${0.3 + i * 0.05}s` }}
              >
                <app.icon className="w-8 h-8 mb-2" />
                <h3 className="font-black">{app.name}</h3>
                <p className="text-sm opacity-80">{app.desc}</p>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mb-16">
            <div className="neo-card p-6">
              <h3 className="text-xl font-black mb-2">Daily Planning</h3>
              <p className="text-muted-foreground">
                Start each day with a clear view of your schedule, urgent tasks, and habit streaks.
              </p>
            </div>
            <div className="neo-card p-6">
              <h3 className="text-xl font-black mb-2">Energy Tracking</h3>
              <p className="text-muted-foreground">
                Log your energy levels throughout the day to optimize when you do deep work.
              </p>
            </div>
            <div className="neo-card p-6">
              <h3 className="text-xl font-black mb-2">App-Specific Tasks</h3>
              <p className="text-muted-foreground">
                Organize tasks by which of your 7 apps they relate to for focused development.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="neo-card p-8 text-center y2k-gradient-warm">
            <h2 className="text-2xl lg:text-3xl font-black mb-4 text-foreground">
              Ready to build something amazing?
            </h2>
            <Link href="/auth/sign-up" className="neo-btn bg-foreground text-background px-8 py-4 text-lg inline-flex items-center gap-2">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="neo-border border-b-0 border-x-0 bg-card py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="font-bold">VibeOS</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built with Supabase, Next.js, and lots of neon colors.
          </p>
        </div>
      </footer>
    </div>
  )
}
