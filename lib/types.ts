// Database types for VibeOS
export interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface CalendarEvent {
  id: string
  user_id: string
  title: string
  description: string | null
  start_time: string
  end_time: string
  color: string
  all_day: boolean
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  status: 'todo' | 'in_progress' | 'done'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  due_date: string | null
  app_context: AppContext | null
  created_at: string
  updated_at: string
}

export interface Habit {
  id: string
  user_id: string
  name: string
  icon: string
  color: string
  frequency: 'daily' | 'weekly'
  target_count: number
  created_at: string
  updated_at: string
}

export interface HabitCompletion {
  id: string
  habit_id: string
  user_id: string
  completed_date: string
  count: number
  created_at: string
}

export interface EnergyLog {
  id: string
  user_id: string
  logged_at: string
  level: 1 | 2 | 3 | 4 | 5
  note: string | null
  created_at: string
}

export interface QuickCapture {
  id: string
  user_id: string
  content: string
  capture_type: 'thought' | 'task' | 'idea' | 'link'
  processed: boolean
  created_at: string
}

// App context for tasks related to building the 7 apps
export type AppContext = 'calendar' | 'tasks' | 'notes' | 'analytics' | 'ai-chat' | 'files' | 'settings'

// App definitions for navigation
export interface AppDefinition {
  id: AppContext | 'dashboard'
  name: string
  icon: string
  color: string
  href: string
  shortcut?: string
}

export const APPS: AppDefinition[] = [
  { id: 'dashboard', name: 'Dashboard', icon: 'home', color: 'pink', href: '/dashboard', shortcut: '1' },
  { id: 'calendar', name: 'Calendar', icon: 'calendar', color: 'cyan', href: '/calendar', shortcut: '2' },
  { id: 'tasks', name: 'Tasks', icon: 'check-square', color: 'yellow', href: '/tasks', shortcut: '3' },
  { id: 'notes', name: 'Notes', icon: 'file-text', color: 'green', href: '/notes', shortcut: '4' },
  { id: 'analytics', name: 'Analytics', icon: 'bar-chart-2', color: 'purple', href: '/analytics', shortcut: '5' },
  { id: 'ai-chat', name: 'AI Chat', icon: 'message-circle', color: 'orange', href: '/ai-chat', shortcut: '6' },
  { id: 'files', name: 'Files', icon: 'folder', color: 'blue', href: '/files', shortcut: '7' },
  { id: 'settings', name: 'Settings', icon: 'settings', color: 'gray', href: '/settings', shortcut: '8' },
]
