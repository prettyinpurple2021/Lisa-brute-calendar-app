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
  FolderKanban,
  ChevronDown,
  Plus,
} from 'lucide-react'
import { QuickCaptureModal } from './quick-capture-modal'
import { useProject, ProjectProvider } from '@/lib/project-context'
import { ProjectColor } from '@/lib/types'

const APPS = [
  { id: 'dashboard', name: 'Dashboard', icon: Home, color: 'bg-primary', href: '/dashboard', shortcut: '1' },
  { id: 'calendar', name: 'Calendar', icon: Calendar, color: 'bg-secondary', href: '/calendar', shortcut: '2' },
  { id: 'tasks', name: 'Tasks', icon: CheckSquare, color: 'bg-accent', href: '/tasks', shortcut: '3' },
  { id: 'notes', name: 'Notes', icon: FileText, color: 'bg-lime', href: '/notes', shortcut: '4' },
  { id: 'analytics', name: 'Analytics', icon: BarChart2, color: 'bg-neon-purple', href: '/analytics', shortcut: '5' },
  { id: 'ai-chat', name: 'AI Chat', icon: MessageCircle, color: 'bg-hot-orange', href: '/ai-chat', shortcut: '6' },
  { id: 'files', name: 'Files', icon: Folder, color: 'bg-electric-blue', href: '/files', shortcut: '7' },
  { id: 'projects', name: 'Projects', icon: FolderKanban, color: 'bg-neon-green', href: '/projects', shortcut: '9' },
  { id: 'settings', name: 'Settings', icon: Settings, color: 'bg-muted', href: '/settings', shortcut: '8' },
]

const getProjectColorClass = (color: ProjectColor) => {
  const colorMap: Record<ProjectColor, string> = {
    pink: 'bg-hot-pink',
    cyan: 'bg-electric-cyan',
    yellow: 'bg-bright-yellow',
    lime: 'bg-lime',
    purple: 'bg-neon-purple',
    orange: 'bg-hot-orange',
    blue: 'bg-electric-blue',
  }
  return colorMap[color]
}

interface AppShellProps {
  children: React.ReactNode
  currentPage?: string
}

export function AppShell({ children, currentPage }: AppShellProps) {
  return (
    <ProjectProvider>
      <AppShellInner currentPage={currentPage}>{children}</AppShellInner>
    </ProjectProvider>
  )
}

function AppShellInner({ children, currentPage }: AppShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false)
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false)
  const [user, setUser] = useState<{ email?: string; display_name?: string } | null>(null)
  
  const { projects, selectedProjectId, selectedProject, setSelectedProjectId } = useProject()

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
      {/* Skip to main content link for keyboard users */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:neo-btn focus:bg-primary focus:text-primary-foreground"
      >
        Skip to main content
      </a>

      {/* Desktop Sidebar */}
      <aside 
        className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 flex-col bg-card neo-border border-l-0 border-t-0 border-b-0 z-40"
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="p-4 border-b-4 border-foreground">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary neo-border rounded-lg flex items-center justify-center group-hover:animate-wiggle">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-black">VibeOS</span>
          </Link>
        </div>

        {/* Project Switcher */}
        <div className="p-3 border-b-4 border-foreground relative">
          <button
            onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
            className="w-full neo-btn bg-white flex items-center gap-2 text-left"
            aria-expanded={projectDropdownOpen}
            aria-haspopup="listbox"
            aria-label={selectedProject ? `Current project: ${selectedProject.name}` : 'All projects selected'}
          >
            {selectedProject ? (
              <>
                <div className={`w-6 h-6 rounded-md border-2 border-black flex items-center justify-center text-sm ${getProjectColorClass(selectedProject.color)}`}>
                  {selectedProject.icon}
                </div>
                <span className="flex-1 font-bold truncate">{selectedProject.name}</span>
              </>
            ) : (
              <>
                <FolderKanban className="w-5 h-5" />
                <span className="flex-1 font-bold">All Projects</span>
              </>
            )}
            <ChevronDown className={`w-4 h-4 transition-transform ${projectDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {projectDropdownOpen && (
            <div 
              className="absolute left-3 right-3 top-full mt-1 bg-white border-4 border-black rounded-xl shadow-lg z-50 overflow-hidden"
              role="listbox"
              aria-label="Select project"
            >
              <button
                onClick={() => {
                  setSelectedProjectId(null)
                  setProjectDropdownOpen(false)
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 transition-colors ${
                  !selectedProjectId ? 'bg-primary/10' : ''
                }`}
                role="option"
                aria-selected={!selectedProjectId}
              >
                <FolderKanban className="w-5 h-5" />
                <span className="font-semibold">All Projects</span>
              </button>
              
              {projects.length > 0 && <div className="border-t-2 border-black" />}
              
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => {
                    setSelectedProjectId(project.id)
                    setProjectDropdownOpen(false)
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 transition-colors ${
                    selectedProjectId === project.id ? 'bg-primary/10' : ''
                  }`}
                  role="option"
                  aria-selected={selectedProjectId === project.id}
                >
                  <div className={`w-6 h-6 rounded-md border-2 border-black flex items-center justify-center text-sm ${getProjectColorClass(project.color)}`}>
                    {project.icon}
                  </div>
                  <span className="font-semibold truncate">{project.name}</span>
                </button>
              ))}
              
              <div className="border-t-2 border-black" />
              <Link
                href="/projects"
                onClick={() => setProjectDropdownOpen(false)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-gray-100 transition-colors text-sm text-muted-foreground"
              >
                <Plus className="w-4 h-4" />
                <span>Manage Projects</span>
              </Link>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto" aria-label="App navigation">
          {APPS.map((app, index) => {
            const Icon = app.icon
            const isActive = pathname.startsWith(app.href)
            return (
              <Link
                key={app.id}
                href={app.href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold transition-all neo-hover slide-up opacity-0 ${
                  isActive
                    ? `${app.color} text-foreground neo-border neo-shadow-sm`
                    : 'hover:bg-muted'
                }`}
                style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }}
              >
                <Icon className="w-5 h-5" />
                <span className="flex-1">{app.name}</span>
                <kbd className="hidden xl:inline-flex h-5 px-1.5 text-[10px] font-mono bg-muted rounded border-2 border-foreground items-center" aria-hidden="true">
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
            aria-label="Open quick capture (Keyboard shortcut: Ctrl+K)"
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
            aria-label="Sign out of your account"
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
            aria-label="Quick capture"
          >
            <Zap className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="neo-btn p-2 bg-muted"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-30 pt-16" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div className="absolute inset-0 bg-foreground/50" onClick={() => setMobileMenuOpen(false)} aria-hidden="true" />
          <nav className="relative bg-card neo-border border-t-0 max-h-[calc(100vh-4rem)] overflow-y-auto bounce-in" aria-label="Mobile navigation">
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
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-card neo-border border-l-0 border-r-0 border-b-0 z-40 flex items-center justify-around px-2" aria-label="Quick navigation">
        {APPS.slice(0, 5).map((app) => {
          const Icon = app.icon
          const isActive = pathname.startsWith(app.href)
          return (
            <Link
              key={app.id}
              href={app.href}
              aria-current={isActive ? 'page' : undefined}
              aria-label={app.name}
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
      <main className="lg:ml-64 pt-16 lg:pt-0 pb-20 lg:pb-0 min-h-screen" role="main" id="main-content">
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
