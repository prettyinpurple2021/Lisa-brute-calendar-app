import type { MouseEvent } from 'react'
import type { Task } from '@/lib/types'
import { TaskCard } from './task-card'

interface KanbanColumnProps {
  title: string
  tasks: Task[]
  color: string
  openEditTaskModal: (task: Task) => void
  toggleTimeTracking: (task: Task, e: MouseEvent<HTMLButtonElement>) => void
}

export function KanbanColumn({
  title,
  tasks,
  color,
  openEditTaskModal,
  toggleTimeTracking
}: KanbanColumnProps) {
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
          <TaskCard
            key={task.id}
            task={task}
            openEditTaskModal={openEditTaskModal}
            toggleTimeTracking={toggleTimeTracking}
          />
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
