'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Habit, HabitCompletion, EnergyLog, Task } from '@/lib/types'
import { useProject } from '@/lib/project-context'
import toast from 'react-hot-toast'
import {
  Flame,
  Plus,
  X,
  Trash2,
  TrendingUp,
  Battery,
  Target,
  CheckCircle,
  Calendar,
  Zap,
} from 'lucide-react'

interface AnalyticsContentProps {
  initialHabits: Habit[]
  initialCompletions: HabitCompletion[]
  initialEnergyLogs: EnergyLog[]
  tasks: Task[]
}

const HABIT_COLORS = [
  { id: 'pink', class: 'bg-primary' },
  { id: 'cyan', class: 'bg-secondary' },
  { id: 'yellow', class: 'bg-accent' },
  { id: 'lime', class: 'bg-lime' },
  { id: 'purple', class: 'bg-neon-purple' },
  { id: 'orange', class: 'bg-hot-orange' },
]

const HABIT_ICONS = ['🎯', '💪', '📚', '🧘', '💧', '🏃', '✍️', '🎨', '🎵', '💤', '🥗', '☀️']

export function AnalyticsContent({
  initialHabits,
  initialCompletions,
  initialEnergyLogs,
  tasks,
}: AnalyticsContentProps) {
  const router = useRouter()
  const [habits, setHabits] = useState(initialHabits)
  const [completions, setCompletions] = useState(initialCompletions)
  const [showHabitModal, setShowHabitModal] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    icon: '🎯',
    color: 'cyan',
    projectId: null as string | null,
  })
  const [saving, setSaving] = useState(false)
  const pendingChanges = useRef<{
    [key: string]: { habitId: string, date: string, toState: boolean, originalId?: string }
  }>({})
  const syncTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (syncTimeout.current) clearTimeout(syncTimeout.current)
    }
  }, [])

  
  const { selectedProjectId, projects } = useProject()
  
  // Filter habits by project
  const filteredHabits = selectedProjectId
    ? habits.filter(h => h.project_id === selectedProjectId)
    : habits
  
  // Filter tasks by project
  const filteredTasks = selectedProjectId
    ? tasks.filter(t => t.project_id === selectedProjectId)
    : tasks

  const today = new Date().toISOString().split('T')[0]

  // Generate last 30 days for the heatmap
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    return date.toISOString().split('T')[0]
  })

  // Calculate stats
  const completedTasksCount = filteredTasks.filter(t => t.status === 'done').length
  const totalTasksCount = filteredTasks.length
  const avgEnergy = initialEnergyLogs.length > 0
    ? (initialEnergyLogs.reduce((sum, log) => sum + log.level, 0) / initialEnergyLogs.length).toFixed(1)
    : '-'

  function getStreak(habitId: string): number {
    const habitCompletions = completions
      .filter(c => c.habit_id === habitId)
      .map(c => c.completed_date)
      .sort()
      .reverse()

    let streak = 0
    const checkDate = new Date()
    
    for (let i = 0; i < 30; i++) {
      const dateStr = checkDate.toISOString().split('T')[0]
      if (habitCompletions.includes(dateStr)) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else if (i === 0) {
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }

    return streak
  }

  function isHabitCompletedOnDate(habitId: string, date: string): boolean {
    return completions.some(c => c.habit_id === habitId && c.completed_date === date)
  }

  async function toggleHabitCompletion(habitId: string, date: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setCompletions(prev => {
      const existing = prev.find(c => c.habit_id === habitId && c.completed_date === date)
      if (existing) {
        return prev.filter(c => c.id !== existing.id)
      } else {
        const tempId = `temp-${Date.now()}-${Math.random()}`
        return [...prev, {
          id: tempId,
          habit_id: habitId,
          user_id: user.id,
          completed_date: date,
          count: 1,
          created_at: new Date().toISOString()
        }]
      }
    })

    const key = `${habitId}-${date}`
    const currentlyPending = pendingChanges.current[key]

    if (currentlyPending) {
      // User reversed their action before sync
      delete pendingChanges.current[key]
    } else {
      // We don't have the existingCompletion from current closure reliably since we use functional update,
      // but we wait for the update or just rely on finding it in the 'completions' array from closure.
      // Actually, 'completions' in closure is fine for finding the ORIGINAL state before this click.
      const existingInClosure = completions.find(
        c => c.habit_id === habitId && c.completed_date === date
      )
      pendingChanges.current[key] = {
        habitId,
        date,
        toState: !existingInClosure,
        originalId: existingInClosure?.id
      }
    }

    if (syncTimeout.current) clearTimeout(syncTimeout.current)

    syncTimeout.current = setTimeout(async () => {
      const batch = pendingChanges.current
      pendingChanges.current = {} // clear queue
      const changes = Object.values(batch)
      if (changes.length === 0) return

      const toDelete = changes.filter(c => !c.toState && c.originalId && !c.originalId.startsWith('temp-')).map(c => c.originalId!)
      const toInsert = changes.filter(c => c.toState).map(c => ({
        habit_id: c.habitId,
        user_id: user.id,
        completed_date: c.date,
      }))

      let newInserted: HabitCompletion[] = []
      let syncFailed = false

      try {
        if (toDelete.length > 0) {
          const { error } = await supabase.from('habit_completions').delete().in('id', toDelete)
          if (error) {
            syncFailed = true
          }
        }

        if (!syncFailed && toInsert.length > 0) {
          const { data, error } = await supabase.from('habit_completions').insert(toInsert).select()
          if (error) {
            syncFailed = true
          } else if (data) {
            newInserted = data
          }
        }
      } catch (e) {
        syncFailed = true
      }

      if (syncFailed) {
        toast.error('Failed to sync habit completions. Please try again.')
        pendingChanges.current = { ...batch, ...pendingChanges.current }
        return
      }

      // Replace temporary entries with real ones from DB
      if (newInserted.length > 0) {
        setCompletions(prev => {
          // Only filter out temp- prefixed IDs that match the habitId and completed_date of the new inserts
          const newInsertedSet = new Set(newInserted.map(c => `${c.habit_id}-${c.completed_date}`))
          const filtered = prev.filter(c => {
            if (c.id.startsWith('temp-')) {
              const key = `${c.habit_id}-${c.completed_date}`
              if (newInsertedSet.has(key)) return false
            }
            return true
          })
          return [...filtered, ...newInserted]
        })
      }

      router.refresh()
    }, 1000)
  }

  function openNewHabitModal() {
    setEditingHabit(null)
    setFormData({ name: '', icon: '🎯', color: 'cyan', projectId: selectedProjectId })
    setShowHabitModal(true)
  }

  function openEditHabitModal(habit: Habit) {
    setEditingHabit(habit)
    setFormData({
      name: habit.name,
      icon: habit.icon,
      color: habit.color,
      projectId: habit.project_id,
    })
    setShowHabitModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.name.trim()) return

    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const habitData = {
      user_id: user.id,
      name: formData.name.trim(),
      icon: formData.icon,
      color: formData.color,
      project_id: formData.projectId,
    }

    if (editingHabit) {
      const { data, error } = await supabase
        .from('habits')
        .update(habitData)
        .eq('id', editingHabit.id)
        .select()
        .single()

      if (!error && data) {
        setHabits(habits.map(h => h.id === editingHabit.id ? data : h))
        toast.success('Habit updated!')
      } else if (error) {
        toast.error('Failed to update habit')
      }
    } else {
      const { data, error } = await supabase
        .from('habits')
        .insert(habitData)
        .select()
        .single()

      if (!error && data) {
        setHabits([...habits, data])
        toast.success('Habit created!')
      } else if (error) {
        toast.error('Failed to create habit')
      }
    }

    setSaving(false)
    setShowHabitModal(false)
    router.refresh()
  }

  async function handleDeleteHabit() {
    if (!editingHabit) return

    const supabase = createClient()
    const { error } = await supabase.from('habits').delete().eq('id', editingHabit.id)
    
    if (error) {
      toast.error('Failed to delete habit')
    } else {
      setHabits(habits.filter(h => h.id !== editingHabit.id))
      setCompletions(completions.filter(c => c.habit_id !== editingHabit.id))
      toast.success('Habit deleted!')
    }
    setShowHabitModal(false)
    router.refresh()
  }

  // Energy heatmap data
  const energyByDate = initialEnergyLogs.reduce((acc, log) => {
    const date = log.logged_at.split('T')[0]
    if (!acc[date] || new Date(log.logged_at) > new Date(acc[date].logged_at)) {
      acc[date] = log
    }
    return acc
  }, {} as Record<string, EnergyLog>)

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="neo-card p-4 bg-primary/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-lg neo-border flex items-center justify-center">
              <Target className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-black">{filteredHabits.length}</p>
              <p className="text-xs font-semibold text-muted-foreground">Active Habits</p>
            </div>
          </div>
        </div>
        
        <div className="neo-card p-4 bg-lime/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-lime rounded-lg neo-border flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black">{completedTasksCount}/{totalTasksCount}</p>
              <p className="text-xs font-semibold text-muted-foreground">Tasks Done (30d)</p>
            </div>
          </div>
        </div>
        
        <div className="neo-card p-4 bg-secondary/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-secondary rounded-lg neo-border flex items-center justify-center">
              <Battery className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black">{avgEnergy}</p>
              <p className="text-xs font-semibold text-muted-foreground">Avg Energy</p>
            </div>
          </div>
        </div>
        
        <div className="neo-card p-4 bg-hot-orange/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-hot-orange rounded-lg neo-border flex items-center justify-center">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black">
                {filteredHabits.length > 0 ? Math.max(...filteredHabits.map(h => getStreak(h.id))) : 0}
              </p>
              <p className="text-xs font-semibold text-muted-foreground">Best Streak</p>
            </div>
          </div>
        </div>
      </div>

      {/* Habits Section */}
      <div className="neo-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black flex items-center gap-2">
            <Flame className="w-5 h-5" />
            Habit Tracker
          </h3>
          <button
            onClick={openNewHabitModal}
            className="neo-btn bg-secondary text-secondary-foreground flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Habit
          </button>
        </div>

        {filteredHabits.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="font-bold">No habits yet</p>
            <p className="text-sm">Start tracking your daily habits</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHabits.map((habit) => {
              const colorClass = HABIT_COLORS.find(c => c.id === habit.color)?.class || 'bg-secondary'
              const streak = getStreak(habit.id)
              
              return (
                <div key={habit.id} className="neo-border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-center justify-between mb-3">
                    <button
                      onClick={() => openEditHabitModal(habit)}
                      className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                    >
                      <span className="text-2xl">{habit.icon}</span>
                      <div>
                        <p className="font-bold text-left">{habit.name}</p>
                        {streak > 0 && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Flame className="w-3 h-3 text-hot-orange" />
                            {streak} day streak
                          </p>
                        )}
                      </div>
                    </button>
                    <button
                      onClick={() => toggleHabitCompletion(habit.id, today)}
                      className={`w-10 h-10 rounded-lg neo-border flex items-center justify-center transition-all ${
                        isHabitCompletedOnDate(habit.id, today)
                          ? `${colorClass} neo-shadow-sm`
                          : 'bg-card hover:bg-muted'
                      }`}
                    >
                      {isHabitCompletedOnDate(habit.id, today) && (
                        <CheckCircle className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  
                  {/* Mini heatmap */}
                  <div className="flex gap-1 overflow-x-auto pb-1">
                    {last30Days.map((date) => {
                      const isCompleted = isHabitCompletedOnDate(habit.id, date)
                      const isToday = date === today
                      return (
                        <button
                          key={date}
                          onClick={() => toggleHabitCompletion(habit.id, date)}
                          className={`w-5 h-5 rounded flex-shrink-0 transition-all ${
                            isCompleted
                              ? colorClass
                              : 'bg-muted hover:bg-muted/80'
                          } ${isToday ? 'ring-2 ring-foreground ring-offset-1' : ''}`}
                          title={date}
                        />
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Energy Heatmap */}
      <div className="neo-card p-5">
        <h3 className="text-lg font-black flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5" />
          Energy History (30 days)
        </h3>
        <div className="flex gap-1 overflow-x-auto pb-2">
          {last30Days.map((date) => {
            const log = energyByDate[date]
            const level = log?.level || 0
            const colorClasses = [
              'bg-muted',
              'bg-destructive/50',
              'bg-hot-orange/50',
              'bg-accent/50',
              'bg-lime/50',
              'bg-secondary',
            ]
            return (
              <div key={date} className="flex flex-col items-center gap-1 flex-shrink-0">
                <div
                  className={`w-8 h-8 rounded neo-border border-2 ${colorClasses[level]} flex items-center justify-center text-xs font-bold`}
                  title={`${date}: Level ${level || '-'}`}
                >
                  {level || '-'}
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {new Date(date).getDate()}
                </span>
              </div>
            )
          })}
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <span>Energy levels:</span>
          {['No data', 'Very Low', 'Low', 'Medium', 'High', 'Peak'].map((label, i) => (
            <div key={label} className="flex items-center gap-1">
              <div className={`w-4 h-4 rounded ${
                ['bg-muted', 'bg-destructive/50', 'bg-hot-orange/50', 'bg-accent/50', 'bg-lime/50', 'bg-secondary'][i]
              }`} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Habit Modal */}
      {showHabitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" onClick={() => setShowHabitModal(false)} />
          <div className="relative w-full max-w-md bounce-in">
            <div className="neo-card overflow-hidden">
              <div className="bg-neon-purple px-4 py-3 flex items-center justify-between border-b-4 border-foreground">
                <h3 className="font-bold text-white">{editingHabit ? 'Edit Habit' : 'New Habit'}</h3>
                <button onClick={() => setShowHabitModal(false)} className="hover:bg-foreground/10 p-1 rounded">
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Habit Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="neo-input w-full"
                    placeholder="e.g., Read for 30 minutes"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Icon</label>
                  <div className="flex gap-2 flex-wrap">
                    {HABIT_ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon })}
                        className={`w-10 h-10 text-xl rounded-lg transition-all ${
                          formData.icon === icon
                            ? 'bg-secondary neo-border neo-shadow-sm'
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">Color</label>
                  <div className="flex gap-2">
                    {HABIT_COLORS.map((color) => (
                      <button
                        key={color.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: color.id })}
                        className={`w-10 h-10 rounded-lg ${color.class} ${
                          formData.color === color.id
                            ? 'neo-border ring-2 ring-foreground ring-offset-2'
                            : 'neo-border border-2'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Project Selector */}
                <div>
                  <label className="block text-sm font-bold mb-2">Project</label>
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

                <div className="flex gap-2 pt-2">
                  {editingHabit && (
                    <button
                      type="button"
                      onClick={handleDeleteHabit}
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
                    {saving ? 'Saving...' : editingHabit ? 'Update Habit' : 'Create Habit'}
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
