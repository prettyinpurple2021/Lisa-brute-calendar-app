import {
  Calendar,
  CheckSquare,
  FileText,
  BarChart2,
  MessageCircle,
  Folder,
  Settings,
  Filter,
} from 'lucide-react'

export const APP_FILTERS = [
  { id: null, name: 'All Apps', icon: Filter, color: 'bg-muted' },
  { id: 'calendar', name: 'Calendar', icon: Calendar, color: 'bg-secondary' },
  { id: 'tasks', name: 'Tasks', icon: CheckSquare, color: 'bg-accent' },
  { id: 'notes', name: 'Notes', icon: FileText, color: 'bg-lime' },
  { id: 'analytics', name: 'Analytics', icon: BarChart2, color: 'bg-neon-purple' },
  { id: 'ai-chat', name: 'AI Chat', icon: MessageCircle, color: 'bg-hot-orange' },
  { id: 'files', name: 'Files', icon: Folder, color: 'bg-electric-blue' },
  { id: 'settings', name: 'Settings', icon: Settings, color: 'bg-muted' },
] as const

export const PRIORITIES = [
  { id: 'urgent', label: 'Urgent', color: 'bg-destructive text-destructive-foreground' },
  { id: 'high', label: 'High', color: 'bg-hot-orange text-foreground' },
  { id: 'medium', label: 'Medium', color: 'bg-accent text-accent-foreground' },
  { id: 'low', label: 'Low', color: 'bg-muted text-muted-foreground' },
] as const

export const STATUSES = [
  { id: 'todo', label: 'To Do', color: 'bg-muted' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-secondary' },
  { id: 'done', label: 'Done', color: 'bg-lime' },
] as const
