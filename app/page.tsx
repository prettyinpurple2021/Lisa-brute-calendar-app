import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  Sparkles, 
  Zap, 
  Calendar, 
  CheckSquare, 
  FileText, 
  BarChart2, 
  MessageCircle, 
  Folder, 
  ArrowRight,
  Timer,
  Github,
  Bell,
  Download,
  Repeat,
  Clock,
  Check,
  Star,
} from 'lucide-react'

const FEATURES = [
  { icon: Calendar, name: 'Calendar', color: 'bg-secondary', desc: 'Events with AI meeting prep' },
  { icon: CheckSquare, name: 'Tasks', color: 'bg-accent', desc: 'Kanban with time tracking' },
  { icon: FileText, name: 'Notes', color: 'bg-lime', desc: 'Quick capture & organize' },
  { icon: BarChart2, name: 'Analytics', color: 'bg-neon-purple', desc: 'Habits & streaks' },
  { icon: MessageCircle, name: 'AI Chat', color: 'bg-hot-orange', desc: 'Your AI assistant' },
  { icon: Folder, name: 'Files', color: 'bg-electric-blue', desc: 'Cloud file storage' },
  { icon: Timer, name: 'Focus Timer', color: 'bg-primary', desc: 'Pomodoro sessions' },
  { icon: Sparkles, name: 'Dashboard', color: 'bg-magenta', desc: 'Daily command center' },
]

const PRICING_PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started',
    features: [
      'All core apps',
      'Up to 100 tasks',
      'Basic calendar',
      '5 habits tracking',
      'Community support',
    ],
    cta: 'Get Started',
    ctaLink: '/auth/sign-up',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$12',
    period: '/month',
    description: 'For serious solo founders',
    features: [
      'Everything in Free',
      'Unlimited tasks & habits',
      'AI meeting prep',
      'Time tracking',
      'GitHub integration',
      'Data export (CSV/PDF)',
      'Push notifications',
      'Priority support',
    ],
    cta: 'Start Pro Trial',
    ctaLink: '/auth/sign-up?plan=pro',
    highlighted: true,
  },
  {
    name: 'Lifetime',
    price: '$199',
    period: 'one-time',
    description: 'Pay once, use forever',
    features: [
      'Everything in Pro',
      'Lifetime updates',
      'Early feature access',
      'Direct founder support',
      'Custom integrations',
    ],
    cta: 'Get Lifetime',
    ctaLink: '/auth/sign-up?plan=lifetime',
    highlighted: false,
  },
]

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

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
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="font-bold hover:text-primary transition-colors">Features</a>
            <a href="#pricing" className="font-bold hover:text-primary transition-colors">Pricing</a>
          </nav>
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

      <main className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center py-16 lg:py-24">
            <div className="inline-block neo-card bg-secondary px-4 py-2 mb-6 bounce-in">
              <p className="text-sm font-bold">Built for solo founders</p>
            </div>
            <h1 className="text-4xl lg:text-6xl font-black mb-6 slide-up text-balance">
              Your Startup{' '}
              <span className="text-primary">Command Center</span>
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 slide-up stagger-2 text-pretty">
              8 essential productivity apps in one vibrant interface. Track habits, manage tasks, 
              schedule events, and build your startup - all with AI assistance.
            </p>
            <div className="flex flex-wrap justify-center gap-4 slide-up stagger-3">
              <Link href="/auth/sign-up" className="neo-btn bg-primary text-primary-foreground px-8 py-4 text-lg flex items-center gap-2">
                Start Free <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#features" className="neo-btn bg-card px-8 py-4 text-lg">
                See Features
              </a>
            </div>
          </div>

          {/* Apps Grid */}
          <section id="features" className="scroll-mt-24 mb-24">
            <h2 className="text-3xl font-black text-center mb-4">Everything You Need</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
              8 powerful apps working together to help you build, launch, and grow your startup.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {FEATURES.map((app, i) => (
                <div 
                  key={app.name} 
                  className={`neo-card p-4 ${app.color} slide-up`}
                  style={{ animationDelay: `${0.1 + i * 0.05}s` }}
                >
                  <app.icon className="w-8 h-8 mb-2" />
                  <h3 className="font-black">{app.name}</h3>
                  <p className="text-sm opacity-80">{app.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Key Features */}
          <section className="mb-24">
            <h2 className="text-3xl font-black text-center mb-12">Power Features</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Github, title: 'GitHub Integration', desc: 'Link repositories to projects and track your coding progress alongside tasks.' },
                { icon: Bell, title: 'Push Notifications', desc: 'Never miss an event or deadline with browser push notifications.' },
                { icon: Download, title: 'Data Export', desc: 'Export your data anytime as CSV or PDF files. Your data is yours.' },
                { icon: Repeat, title: 'Recurring Tasks', desc: 'Set up recurring tasks and events that repeat daily, weekly, or monthly.' },
                { icon: Clock, title: 'Time Tracking', desc: 'Track time spent on tasks with a built-in timer and detailed reports.' },
                { icon: Zap, title: 'Quick Capture', desc: 'Press Cmd+K anywhere to quickly capture thoughts, tasks, or ideas.' },
              ].map((feature, i) => (
                <div key={feature.title} className="neo-card p-6 bg-card">
                  <div className="w-12 h-12 bg-primary/10 neo-border rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-black mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Pricing */}
          <section id="pricing" className="scroll-mt-24 mb-24">
            <h2 className="text-3xl font-black text-center mb-4">Simple Pricing</h2>
            <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
              Start free, upgrade when you need more. No hidden fees.
            </p>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {PRICING_PLANS.map((plan) => (
                <div 
                  key={plan.name} 
                  className={`neo-card p-6 ${plan.highlighted ? 'bg-primary/10 ring-4 ring-primary scale-105' : 'bg-card'}`}
                >
                  {plan.highlighted && (
                    <div className="text-center mb-4">
                      <span className="neo-btn bg-primary text-primary-foreground px-3 py-1 text-xs">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <h3 className="text-2xl font-black mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-black">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-muted-foreground mb-6">{plan.description}</p>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-lime shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link 
                    href={plan.ctaLink} 
                    className={`neo-btn w-full text-center ${plan.highlighted ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* Testimonials */}
          <section className="mb-24">
            <h2 className="text-3xl font-black text-center mb-12">Loved by Founders</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: 'Sarah K.', role: 'Indie Hacker', quote: 'Finally, a productivity app that gets solo founders. The energy tracking feature alone changed how I work.' },
                { name: 'Marcus J.', role: 'SaaS Founder', quote: 'The GitHub integration is seamless. I can see my commits alongside tasks - perfect for tracking progress.' },
                { name: 'Emily R.', role: 'Creator', quote: 'Love the vibrant design! It makes planning actually fun. The habit streaks keep me accountable.' },
              ].map((testimonial) => (
                <div key={testimonial.name} className="neo-card p-6 bg-card">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-lime text-lime" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">&quot;{testimonial.quote}&quot;</p>
                  <div>
                    <p className="font-bold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="neo-card p-8 text-center y2k-gradient-warm">
            <h2 className="text-2xl lg:text-3xl font-black mb-4 text-foreground">
              Ready to build something amazing?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
              Join thousands of solo founders using VibeOS to stay productive and ship faster.
            </p>
            <Link href="/auth/sign-up" className="neo-btn bg-foreground text-background px-8 py-4 text-lg inline-flex items-center gap-2">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="neo-border border-b-0 border-x-0 bg-card py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary neo-border rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-black">VibeOS</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The productivity toolkit for solo founders.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="text-muted-foreground hover:text-foreground">Features</a></li>
                <li><a href="#pricing" className="text-muted-foreground hover:text-foreground">Pricing</a></li>
                <li><Link href="/auth/sign-up" className="text-muted-foreground hover:text-foreground">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="mailto:support@vibeos.app" className="text-muted-foreground hover:text-foreground">support@vibeos.app</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t-2 border-foreground/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} VibeOS. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Built with Next.js, Supabase & Vercel
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
