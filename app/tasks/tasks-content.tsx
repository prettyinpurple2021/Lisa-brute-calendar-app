'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Task, AppContext } from '@/lib/types'
import { useProject } from '@/lib/project-context'
import toast from 'react-hot-toast'
import type { FormEvent, MouseEvent } from 'react'
import { Plus } from 'lucide-react'
import { APP_FILTERS } from './constants'
import { KanbanColumn } from '@/components/tasks/kanban-column'
import { TaskModal } from '@/components/tasks/task-modal'
import type { TaskFormData } from '@/components/tasks/task-form-data'

interface TasksContentProps {
  initialTasks: Task[]
}

function createTaskFormData(appContext: AppContext | null, projectId: string | null): TaskFormData {
  return {
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    appContext,
    dueDate: '',
    projectId,
    isRecurring: false,
    recurrencePattern: 'daily',
    recurrenceInterval: 1,
    timeEstimate: '',
  }
}

export function TasksContent({ initialTasks }: TasksContentProps) {
  const router = useRouter()
  const { selectedProjectId, projects } = useProject()
  const [tasks, setTasks] = useState(initialTasks)
  const [appFilter, setAppFilter] = useState<AppContext | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [formData, setFormData] = useState<TaskFormData>(() => createTaskFormData(null, selectedProjectId))
  const [saving, setSaving] = useState(false)
  const [trackingTaskId, setTrackingTaskId] = useState<string | null>(null)

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
    setFormData(createTaskFormData(appFilter, selectedProjectId))
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

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
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

  async function toggleTimeTracking(task: Task, e: MouseEvent<HTMLButtonElement>) {
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
        <KanbanColumn
          title="To Do"
          tasks={todoTasks}
          color="bg-muted"
          openEditTaskModal={openEditTaskModal}
          toggleTimeTracking={toggleTimeTracking}
        />
        <KanbanColumn
          title="In Progress"
          tasks={inProgressTasks}
          color="bg-secondary"
          openEditTaskModal={openEditTaskModal}
          toggleTimeTracking={toggleTimeTracking}
        />
        <KanbanColumn
          title="Done"
          tasks={doneTasks}
          color="bg-lime"
          openEditTaskModal={openEditTaskModal}
          toggleTimeTracking={toggleTimeTracking}
        />
      </div>

      {/* Task Modal */}
      {showModal && (
        <TaskModal
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          handleDelete={handleDelete}
          saving={saving}
          editingTask={editingTask}
          projects={projects}
          setShowModal={setShowModal}
        />
      )}
    </div>
  )
}
