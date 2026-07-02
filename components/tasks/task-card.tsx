import type { KeyboardEvent, MouseEvent } from 'react'
import type { Task } from '@/lib/types'
import { APP_FILTERS, PRIORITIES } from '@/app/tasks/constants'
import { Clock, Pause, Play, Repeat } from 'lucide-react'

interface TaskCardProps {
  task: Task
  openEditTaskModal: (task: Task) => void
  toggleTimeTracking: (task: Task, e: MouseEvent<HTMLButtonElement>) => void
}

export function TaskCard({ task, openEditTaskModal, toggleTimeTracking }: TaskCardProps) {
  const priorityConfig =
    PRIORITIES.find(p => p.id === task.priority) ??
    PRIORITIES.find(p => p.id === 'medium') ??
    PRIORITIES[0]
  const appConfig = APP_FILTERS.find(a => a.id === task.app_context)
  const timerLabel = task.is_tracking ? 'Stop timer' : 'Start timer'

  function handleCardKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openEditTaskModal(task)
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className={`neo-card bg-card p-3 cursor-pointer hover:translate-y-[-2px] transition-transform ${
        task.is_tracking ? 'ring-2 ring-lime ring-offset-2' : ''
      }`}
      onClick={() => openEditTaskModal(task)}
      onKeyDown={handleCardKeyDown}
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
            type="button"
            aria-label={timerLabel}
            onClick={(e) => toggleTimeTracking(task, e)}
            className={`p-1.5 rounded-lg transition-all ${
              task.is_tracking
                ? 'bg-lime neo-border animate-pulse'
                : 'bg-muted hover:bg-muted/80 neo-border border-2'
            }`}
            title={timerLabel}
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
