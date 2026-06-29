import type { FormEvent } from 'react'
import type { Task, AppContext, Project } from '@/lib/types'
import { APP_FILTERS, PRIORITIES, STATUSES } from '@/app/tasks/constants'
import { Repeat, Trash2, X } from 'lucide-react'
import type { TaskFormData } from './task-form-data'

interface TaskModalProps {
  formData: TaskFormData
  setFormData: (data: TaskFormData) => void
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void
  handleDelete: () => void
  saving: boolean
  editingTask: Task | null
  projects: Project[]
  setShowModal: (show: boolean) => void
}

export function TaskModal({
  formData,
  setFormData,
  handleSubmit,
  handleDelete,
  saving,
  editingTask,
  projects,
  setShowModal
}: TaskModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
      <div className="relative w-full max-w-lg bounce-in">
        <div className="neo-card overflow-hidden">
          <div className="bg-accent px-4 py-3 flex items-center justify-between border-b-4 border-foreground">
            <h3 className="font-bold">{editingTask ? 'Edit Task' : 'New Task'}</h3>
            <button
              type="button"
              aria-label="Close task modal"
              onClick={() => setShowModal(false)}
              className="hover:bg-foreground/10 p-1 rounded"
            >
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
                  aria-label="Delete task"
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
  )
}
