'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Task, AppContext, Project } from '@/lib/types'
import { useProject } from '@/lib/project-context'
import toast from 'react-hot-toast'
import {
  Plus,
  X,
  Trash2,
  Calendar,
  CheckSquare,
  FileText,
  BarChart2,
  MessageCircle,
  Folder,
  Settings,
  Filter,
  GripVertical,
  Check,
  FolderKanban,
  Repeat,
  Clock,
  Play,
  Pause,
} from 'lucide-react'

interface TasksContentProps {
  initialTasks: Task[]
}

const APP_FILTERS = [
  { id: null, name: 'All Apps', icon: Filter, color: 'bg-muted' },
  { id: 'calendar', name: 'Calendar', icon: Calendar, color: 'bg-secondary' },
  { id: 'tasks', name: 'Tasks', icon: CheckSquare, color: 'bg-accent' },
  { id: 'notes', name: 'Notes', icon: FileText, color: 'bg-lime' },
  { id: 'analytics', name: 'Analytics', icon: BarChart2, color: 'bg-neon-purple' },
  { id: 'ai-chat', name: 'AI Chat', icon: MessageCircle, color: 'bg-hot-orange' },
  { id: 'files', name: 'Files', icon: Folder, color: 'bg-electric-blue' },
  { id: 'settings', name: 'Settings', icon: Settings, color: 'bg-muted' },
] as const

const PRIORITIES = [
  { id: 'urgent', label: 'Urgent', color: 'bg-destructive text-destructive-foreground' },
  { id: 'high', label: 'High', color: 'bg-hot-orange text-foreground' },
  { id: 'medium', label: 'Medium', color: 'bg-accent text-accent-foreground' },
  { id: 'low', label: 'Low', color: 'bg-muted text-muted-foreground' },
] as const

const STATUSES = [
  { id: 'todo', label: 'To Do', color: 'bg-muted' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-secondary' },
  { id: 'done', label: 'Done', color: 'bg-lime' },
] as const

export function TasksContent({ initialTasks }: TasksContentProps) {
  const router = useRouter()
  const [tasks, setTasks] = useState(initialTasks)
  const [appFilter, setAppFilter] = useState<AppContext | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    status: 'todo' as Task['status'],
    appContext: null as AppContext | null,
    dueDate: '',
    projectId: null as string | null,
    isRecurring: false,
    recurrencePattern: 'daily' as 'daily' | 'weekly' | 'monthly',
    recurrenceInterval: 1,
    timeEstimate: '',
  })
  const [saving, setSaving] = useState(false)
  const [trackingTaskId, setTrackingTaskId] = useState<string | null>(null)
  
  const { selectedProjectId, projects } = useProject()

  // Find currently tracking task
  useEffect(() => {
    const tracking = tasks.find(t => t.is_tracking)
    setTrackingTaskId(tracking?.id || null)
  }, [tasks])

  // Filter tasks by selected project
  const projectFilteredTasks = selectedProjectId
    ? tasks.filter(t => t.project_id === selectedProjectId)
    : tasks

  const filteredTasks = appFilter
    ? projectFilteredTasks.filter(t => t.app_context === appFilter)
    : projectFilteredTasks

  const todoTasks = filteredTasks.filter(t => t.status === 'todo')
  const inProgressTasks = filteredTasks.filter(t => t.status === 'in_progress')
  const doneTasks = filteredTasks.filter(t => t.status === 'done')

  function openNewTaskModal() {
    setEditingTask(null)
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      status: 'todo',
      appContext: appFilter,
      dueDate: '',
      projectId: selectedProjectId,
      isRecurring: false,
      recurrencePattern: 'daily',
      recurrenceInterval: 1,
      timeEstimate: '',
    })
    setShowModal(true)
  }

  function openEditTaskModal(task: Task) {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      appContext: task.app_context,
      dueDate: task.due_date || '',
      projectId: task.project_id,
      isRecurring: task.is_recurring || false,
      recurrencePattern: task.recurrence_pattern || 'daily',
      recurrenceInterval: task.recurrence_interval || 1,
      timeEstimate: task.time_estimate_minutes ? String(task.time_estimate_minutes) : '',
    })
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.title.trim()) return

    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const taskData = {
      user_id: user.id,
      title: formData.title.trim(),
      description: formData.description.trim() || null,
      priority: formData.priority,
      status: formData.status,
      app_context: formData.appContext,
      due_date: formData.dueDate || null,
      project_id: formData.projectId,
      is_recurring: formData.isRecurring,
      recurrence_pattern: formData.isRecurring ? formData.recurrencePattern : null,
      recurrence_interval: formData.isRecurring ? formData.recurrenceInterval : 1,
      time_estimate_minutes: formData.timeEstimate ? parseInt(formData.timeEstimate) : null,
    }

    if (editingTask) {
      const { data, error } = await supabase
        .from('tasks')
        .update(taskData)
        .eq('id', editingTask.id)
        .select()
        .single()

      if (error) {
        toast.error('Failed to update task')
      } else if (data) {
        setTasks(tasks.map(t => t.id === editingTask.id ? data : t))
        toast.success('Task updated!')
      }
    } else {
      const { data, error } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single()

      if (error) {
        toast.error('Failed to create task')
      } else if (data) {
        setTasks([data, ...tasks])
        toast.success('Task created!')
      }
    }

    setSaving(false)
    setShowModal(false)
    router.refresh()
  }

  async function handleDelete() {
    if (!editingTask) return

    const supabase = createClient()
    const { error } = await supabase.from('tasks').delete().eq('id', editingTask.id)
    
    if (error) {
      toast.error('Failed to delete task')
    } else {
      setTasks(tasks.filter(t => t.id !== editingTask.id))
      toast.success('Task deleted!')
    }
    setShowModal(false)
    router.refresh()
  }

  async function updateTaskStatus(task: Task, newStatus: Task['status']) {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('tasks')
      .update({ status: newStatus })
      .eq('id', task.id)
      .select()
      .single()

    if (!error && data) {
      setTasks(tasks.map(t => t.id === task.id ? data : t))
    }
    router.refresh()
  }

  async function toggleTimeTracking(task: Task, e: React.MouseEvent) {
    e.stopPropagation()
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (task.is_tracking) {
      // Stop tracking
      const startedAt = new Date(task.tracking_started_at!)
      const now = new Date()
      const durationMinutes = Math.round((now.getTime() - startedAt.getTime()) / 60000)

      // Create time session
      await supabase.from('time_sessions').insert({
        user_id: user.id,
        task_id: task.id,
        started_at: task.tracking_started_at,
        ended_at: now.toISOString(),
        duration_minutes: durationMinutes,
      })

      // Update task
      const { data } = await supabase
        .from('tasks')
        .update({
          is_tracking: false,
          tracking_started_at: null,
          time_spent_minutes: (task.time_spent_minutes || 0) + durationMinutes,
        })
        .eq('id', task.id)
        .select()
        .single()

      if (data) {
        setTasks(tasks.map(t => t.id === task.id ? data : t))
        toast.success(`Tracked ${durationMinutes} minutes`)
      }
    } else {
      // Stop any other tracking task first
      if (trackingTaskId) {
        const trackingTask = tasks.find(t => t.id === trackingTaskId)
        if (trackingTask) {
          const startedAt = new Date(trackingTask.tracking_started_at!)
          const now = new Date()
          const durationMinutes = Math.round((now.getTime() - startedAt.getTime()) / 60000)

          await supabase.from('time_sessions').insert({
            user_id: user.id,
            task_id: trackingTask.id,
            started_at: trackingTask.tracking_started_at,
            ended_at: now.toISOString(),
            duration_minutes: durationMinutes,
          })

          await supabase
            .from('tasks')
            .update({
              is_tracking: false,
              tracking_started_at: null,
              time_spent_minutes: (trackingTask.time_spent_minutes || 0) + durationMinutes,
            })
            .eq('id', trackingTask.id)
        }
      }

      // Start tracking this task
      const { data } = await supabase
        .from('tasks')
        .update({
          is_tracking: true,
          tracking_started_at: new Date().toISOString(),
        })
        .eq('id', task.id)
        .select()
        .single()

      if (data) {
        setTasks(tasks.map(t => {
          if (t.id === task.id) return data
          if (t.id === trackingTaskId) return { ...t, is_tracking: false, tracking_started_at: null }
          return t
        }))
        toast.success('Timer started')
      }
    }
    router.refresh()
  }

  function TaskCard({ task }: { task: Task }) {
    const priorityConfig = PRIORITIES.find(p => p.id === task.priority)!
    const appConfig = APP_FILTERS.find(a => a.id === task.app_context)

    return (
      <div
        className={`neo-card bg-card p-3 cursor-pointer hover:translate-y-[-2px] transition-transform ${
          task.is_tracking ? 'ring-2 ring-lime ring-offset-2' : ''
        }`}
        onClick={() => openEditTaskModal(task)}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1 flex-wrap">
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${priorityConfig.color}`}>
              {priorityConfig.label}
            </span>
            {appConfig && appConfig.id && (
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${appConfig.color} text-foreground`}>
                {appConfig.name}
              </span>
            )}
          </div>
          {task.status !== 'done' && (
            <button
              onClick={(e) => toggleTimeTracking(task, e)}
              className={`p-1.5 rounded-lg transition-all ${
                task.is_tracking 
                  ? 'bg-lime neo-border animate-pulse' 
                  : 'bg-muted hover:bg-muted/80 neo-border border-2'
              }`}
              title={task.is_tracking ? 'Stop timer' : 'Start timer'}
            >
              {task.is_tracking ? (
                <Pause className="w-3.5 h-3.5" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
        <p className="font-bold mb-1 line-clamp-2">{task.title}</p>
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
        )}
        {task.due_date && (
          <p className="text-xs text-muted-foreground mt-2">
            Due: {new Date(task.due_date).toLocaleDateString()}
          </p>
        )}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          {task.is_recurring && (
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-secondary rounded-full">
              <Repeat className="w-3 h-3" />
              {task.recurrence_pattern}
            </span>
          )}
          {task.time_estimate_minutes && (
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-muted rounded-full">
              <Clock className="w-3 h-3" />
              {task.time_estimate_minutes}m
            </span>
          )}
          {task.time_spent_minutes > 0 && (
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-lime rounded-full">
              {task.time_spent_minutes}m tracked
            </span>
          )}
        </div>
      </div>
    )
  }

  function KanbanColumn({ 
    title, 
    tasks, 
    status, 
    color 
  }: { 
    title: string
    tasks: Task[]
    status: Task['status']
    color: string 
  }) {
    return (
      <div className="flex-1 min-w-[280px]">
        <div className={`${color} neo-border p-3 rounded-t-lg flex items-center justify-between`}>
          <h3 className="font-black">{title}</h3>
          <span className="px-2 py-0.5 bg-foreground/20 rounded-full text-sm font-bold">
            {tasks.length}
          </span>
        </div>
        <div className="neo-border border-t-0 rounded-b-lg p-3 min-h-[300px] space-y-3 bg-muted/30">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
          {tasks.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">
              No tasks
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="font-bold text-sm">Filter by app:</span>
        {APP_FILTERS.map((filter) => {
          const Icon = filter.icon
          const isActive = appFilter === filter.id
          return (
            <button
              key={filter.id ?? 'all'}
              onClick={() => setAppFilter(filter.id as AppContext | null)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-sm transition-all ${
                isActive
                  ? `${filter.color} neo-border neo-shadow-sm`
                  : 'bg-card hover:bg-muted neo-border border-2'
              }`}
            >
              <Icon className="w-4 h-4" />
              {filter.name}
            </button>
          )
        })}
        <button
          onClick={openNewTaskModal}
          className="ml-auto neo-btn bg-primary text-primary-foreground flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        <KanbanColumn title="To Do" tasks={todoTasks} status="todo" color="bg-muted" />
        <KanbanColumn title="In Progress" tasks={inProgressTasks} status="in_progress" color="bg-secondary" />
        <KanbanColumn title="Done" tasks={doneTasks} status="done" color="bg-lime" />
      </div>

      {/* Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-lg bounce-in">
            <div className="neo-card overflow-hidden">
              <div className="bg-accent px-4 py-3 flex items-center justify-between border-b-4 border-foreground">
                <h3 className="font-bold">{editingTask ? 'Edit Task' : 'New Task'}</h3>
                <button onClick={() => setShowModal(false)} className="hover:bg-foreground/10 p-1 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="neo-input w-full"
                    placeholder="What needs to be done?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="neo-input w-full h-20 resize-none"
                    placeholder="Optional details..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-1">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
                      className="neo-input w-full"
                    >
                      {PRIORITIES.map((p) => (
                        <option key={p.id} value={p.id}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as Task['status'] })}
                      className="neo-input w-full"
                    >
                      {STATUSES.map((s) => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-1">App Context</label>
                    <select
                      value={formData.appContext || ''}
                      onChange={(e) => setFormData({ ...formData, appContext: e.target.value as AppContext || null })}
                      className="neo-input w-full"
                    >
                      <option value="">None</option>
                      {APP_FILTERS.slice(1).map((a) => (
                        <option key={a.id} value={a.id!}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Due Date</label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="neo-input w-full"
                    />
                  </div>
                </div>

                {/* Project Selector */}
                <div>
                  <label className="block text-sm font-bold mb-1">Project</label>
                  <select
                    value={formData.projectId || ''}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value || null })}
                    className="neo-input w-full"
                  >
                    <option value="">No Project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Time Estimate */}
                <div>
                  <label className="block text-sm font-bold mb-1">Time Estimate (minutes)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.timeEstimate}
                    onChange={(e) => setFormData({ ...formData, timeEstimate: e.target.value })}
                    className="neo-input w-full"
                    placeholder="e.g., 30"
                  />
                </div>

                {/* Recurring */}
                <div className="p-3 border-2 border-dashed border-foreground/30 rounded-xl">
                  <label className="flex items-center gap-2 cursor-pointer mb-2">
                    <input
                      type="checkbox"
                      checked={formData.isRecurring}
                      onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                      className="w-5 h-5 rounded border-2 border-black"
                    />
                    <Repeat className="w-4 h-4" />
                    <span className="font-bold">Recurring Task</span>
                  </label>
                  
                  {formData.isRecurring && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm">Repeat every</span>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={formData.recurrenceInterval}
                        onChange={(e) => setFormData({ ...formData, recurrenceInterval: parseInt(e.target.value) || 1 })}
                        className="neo-input w-16 text-center"
                      />
                      <select
                        value={formData.recurrencePattern}
                        onChange={(e) => setFormData({ ...formData, recurrencePattern: e.target.value as 'daily' | 'weekly' | 'monthly' })}
                        className="neo-input"
                      >
                        <option value="daily">day(s)</option>
                        <option value="weekly">week(s)</option>
                        <option value="monthly">month(s)</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  {editingTask && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="neo-btn bg-destructive text-destructive-foreground p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={saving}
                    className="neo-btn flex-1 bg-primary text-primary-foreground disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
