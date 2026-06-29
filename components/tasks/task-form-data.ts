import type { AppContext, Task } from '@/lib/types'

export interface TaskFormData {
  title: string
  description: string
  priority: Task['priority']
  status: Task['status']
  appContext: AppContext | null
  dueDate: string
  projectId: string | null
  isRecurring: boolean
  recurrencePattern: NonNullable<Task['recurrence_pattern']>
  recurrenceInterval: number
  timeEstimate: string
}
