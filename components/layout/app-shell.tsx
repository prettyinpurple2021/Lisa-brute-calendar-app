'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import {
  Home,
  Calendar,
  CheckSquare,
  FileText,
  BarChart2,
  MessageCircle,
  Folder,
  Settings,
  LogOut,
  Sparkles,
  Menu,
  X,
  Zap,
} from 'lucide-react'
import { QuickCaptureModal } from './quick-capture-modal'

const APPS = [
  { id: 'dashboard', name: 'Dashboard', icon: Home, color: 'bg-primary', href: '/dashboard', shortcut: '1' },
  { id: 'calendar', name: 'Calendar', icon: Calendar, color: 'bg-secondary', href: '/calendar', shortcut: '2' },
  { id: 'tasks', name: 'Tasks', icon: CheckSquare, color: 'bg-accent', href: '/tasks', shortcut: '3' },
  { id: 'notes', name: 'Notes', icon: FileText, color: 'bg-lime', href: '/notes', shortcut: '4' },
  { id: 'analytics', name: 'Analytics', icon: BarChart2, color: 'bg-neon-purple', href: '/analytics', shortcut: '5' },
  { id: 'ai-chat', name: 'AI Chat', icon: MessageCircle, color: 'bg-hot-orange', href: '/ai-chat', shortcut: '6' },
  { id: 'files', name: 'Files', icon: Folder, color: 'bg-electric-blue', href: '/files', shortcut: '7' },
  { id: 'settings', name: 'Settings', icon: Settings, color: 'bg-muted', href: '/settings', shortcut: '8' },
]

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false)
  const [user, setUser] = useState<{ email?: string; display_name?: string } | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({
          email: data.user.email,
          display_name: data.user.user_metadata?.display_name || data.user.email?.split('@')[0],
        })
      }
    })
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Quick capture: Cmd/Ctrl + K
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setQuickCaptureOpen(true)
      return
    }

    // App navigation: Cmd/Ctrl + 1-8
    if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '8') {
      e.preventDefault()
      const app = APPS[parseInt(e.key) - 1]
      if (app) {
        router.push(app.href)
      }
    }
  }, [router])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const currentApp = APPS.find(app => pathname.startsWith(app.href))

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 flex-col bg-card neo-border border-l-0 border-t-0 border-b-0 z-40">
        {/* Logo */}
        <div className="p-4 border-b-4 border-foreground">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary neo-border rounded-lg flex items-center justify-center group-hover:animate-wiggle">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-black">VibeOS</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {APPS.map((app, index) => {
            const Icon = app.icon
            const isActive = pathname.startsWith(app.href)
            return (
              <Link
                key={app.id}
                href={app.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold transition-all neo-hover slide-up opacity-0 ${
                  isActive
                    ? `${app.color} text-foreground neo-border neo-shadow-sm`
                    : 'hover:bg-muted'
                }`}
                style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }}
              >
                <Icon className="w-5 h-5" />
                <span className="flex-1">{app.name}</span>
                <kbd className="hidden xl:inline-flex h-5 px-1.5 text-[10px] font-mono bg-muted rounded border-2 border-foreground items-center">
                  {app.shortcut}
                </kbd>
              </Link>
            )
          })}
        </nav>

        {/* Quick Capture Button */}
        <div className="p-3 border-t-4 border-foreground">
          <button
            onClick={() => setQuickCaptureOpen(true)}
            className="w-full neo-btn bg-secondary text-secondary-foreground flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            <span>Quick Capture</span>
            <kbd className="h-5 px-1.5 text-[10px] font-mono bg-secondary-foreground/20 rounded">K</kbd>
          </button>
        </div>

        {/* User section */}
        <div className="p-3 border-t-4 border-foreground">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-accent neo-border rounded-full flex items-center justify-center font-bold text-accent-foreground">
              {user?.display_name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold truncate">{user?.display_name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full neo-btn bg-muted text-muted-foreground flex items-center justify-center gap-2 text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card neo-border border-l-0 border-r-0 border-t-0 z-40 flex items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary neo-border rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-black">VibeOS</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setQuickCaptureOpen(true)}
            className="neo-btn p-2 bg-secondary text-secondary-foreground"
          >
            <Zap className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="neo-btn p-2 bg-muted"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-30 pt-16">
          <div className="absolute inset-0 bg-foreground/50" onClick={() => setMobileMenuOpen(false)} />
          <nav className="relative bg-card neo-border border-t-0 max-h-[calc(100vh-4rem)] overflow-y-auto bounce-in">
            <div className="p-4 space-y-2">
              {APPS.map((app) => {
                const Icon = app.icon
                const isActive = pathname.startsWith(app.href)
                return (
                  <Link
                    key={app.id}
                    href={app.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all ${
                      isActive
                        ? `${app.color} text-foreground neo-border`
                        : 'hover:bg-muted'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{app.name}</span>
                  </Link>
                )
              })}
              <hr className="border-t-4 border-foreground my-4" />
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-destructive hover:bg-destructive/10 transition-all"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </nav>
        </div>
      )}

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-card neo-border border-l-0 border-r-0 border-b-0 z-40 flex items-center justify-around px-2">
        {APPS.slice(0, 5).map((app) => {
          const Icon = app.icon
          const isActive = pathname.startsWith(app.href)
          return (
            <Link
              key={app.id}
              href={app.href}
              className={`flex flex-col items-center justify-center w-14 h-14 rounded-lg transition-all ${
                isActive ? `${app.color} neo-border scale-110` : 'hover:bg-muted'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-bold mt-0.5">{app.name.slice(0, 4)}</span>
            </Link>
          )
        })}
      </nav>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 pb-20 lg:pb-0 min-h-screen">
        {/* Page Header */}
        {currentApp && (
          <div className={`${currentApp.color} neo-border border-l-0 border-r-0 border-t-0 px-6 py-4`}>
            <div className="flex items-center gap-3">
              <currentApp.icon className="w-6 h-6" />
              <h1 className="text-2xl font-black">{currentApp.name}</h1>
            </div>
          </div>
        )}
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>

      {/* Quick Capture Modal */}
      <QuickCaptureModal 
        open={quickCaptureOpen} 
        onClose={() => setQuickCaptureOpen(false)} 
      />
    </div>
  )
}
