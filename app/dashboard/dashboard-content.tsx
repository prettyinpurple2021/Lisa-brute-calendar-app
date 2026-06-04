'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Profile, CalendarEvent, Task, Habit, HabitCompletion, QuickCapture, DailyGoal } from '@/lib/types'
import { useProject } from '@/lib/project-context'
import toast from 'react-hot-toast'
import {
  Calendar,
  CheckSquare,
  Zap,
  Battery,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  BatteryCharging,
  Clock,
  Flame,
  Inbox,
  ArrowRight,
  Sparkles,
  Target,
  Star,
  Plus,
  X,
  Check,
  Trash2,
} from 'lucide-react'

interface DashboardContentProps {
  profile: Profile | null
  todayEvents: CalendarEvent[]
  tasks: Task[]
  habits: Habit[]
  habitCompletions: HabitCompletion[]
  currentEnergy: number | null
  unprocessedCaptures: QuickCapture[]
  dailyGoals: DailyGoal[]
}

const energyLevels = [
  { level: 1, icon: BatteryLow, label: 'Very Low', color: 'bg-destructive' },
  { level: 2, icon: BatteryLow, label: 'Low', color: 'bg-hot-orange' },
  { level: 3, icon: BatteryMedium, label: 'Medium', color: 'bg-accent' },
  { level: 4, icon: BatteryFull, label: 'High', color: 'bg-lime' },
  { level: 5, icon: BatteryCharging, label: 'Peak', color: 'bg-secondary' },
]

const priorityColors = {
  urgent: 'bg-destructive text-destructive-foreground',
  high: 'bg-hot-orange text-foreground',
  medium: 'bg-accent text-accent-foreground',
  low: 'bg-muted text-muted-foreground',
}

export function DashboardContent({
  profile,
  todayEvents,
  tasks,
  habits,
  habitCompletions,
  currentEnergy,
  unprocessedCaptures,
  dailyGoals: initialDailyGoals,
}: DashboardContentProps) {
  const router = useRouter()
  const [selectedEnergy, setSelectedEnergy] = useState<number | null>(currentEnergy)
  const [savingEnergy, setSavingEnergy] = useState(false)
  const [dailyGoals, setDailyGoals] = useState(initialDailyGoals)
  const [newGoalText, setNewGoalText] = useState('')
  const [addingGoal, setAddingGoal] = useState(false)
  
  const { selectedProjectId } = useProject()

  const today = new Date().toISOString().split('T')[0]
  const greeting = getGreeting()
  
  // Filter by project
  const filteredEvents = selectedProjectId 
    ? todayEvents.filter(e => e.project_id === selectedProjectId)
    : todayEvents
  const filteredTasks = selectedProjectId
    ? tasks.filter(t => t.project_id === selectedProjectId)
    : tasks
  const filteredHabits = selectedProjectId
    ? habits.filter(h => h.project_id === selectedProjectId)
    : habits
  const filteredGoals = selectedProjectId
    ? dailyGoals.filter(g => g.project_id === selectedProjectId)
    : dailyGoals

  async function logEnergy(level: number) {
    setSelectedEnergy(level)
    setSavingEnergy(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('energy_logs').insert({
      user_id: user.id,
      level,
    })

    setSavingEnergy(false)
    router.refresh()
  }

  async function addDailyGoal() {
    if (!newGoalText.trim()) return
    setAddingGoal(true)
    
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase.from('daily_goals').insert({
      user_id: user.id,
      title: newGoalText.trim(),
      goal_date: today,
      project_id: selectedProjectId,
    }).select().single()

    if (error) {
      toast.error('Failed to add goal')
    } else if (data) {
      setDailyGoals([...dailyGoals, data])
      setNewGoalText('')
      toast.success('Goal added!')
    }
    setAddingGoal(false)
  }

  async function toggleGoal(goal: DailyGoal) {
    const supabase = createClient()
    const newCompleted = !goal.completed
    
    const { error } = await supabase
      .from('daily_goals')
      .update({ completed: newCompleted })
      .eq('id', goal.id)

    if (error) {
      toast.error('Failed to update goal')
    } else {
      setDailyGoals(dailyGoals.map(g => g.id === goal.id ? { ...g, completed: newCompleted } : g))
      if (newCompleted) {
        toast.success('Goal completed!')
      }
    }
  }

  async function deleteGoal(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from('daily_goals').delete().eq('id', id)

    if (error) {
      toast.error('Failed to delete goal')
    } else {
      setDailyGoals(dailyGoals.filter(g => g.id !== id))
      toast.success('Goal deleted!')
    }
  }

  async function toggleHabit(habit: Habit) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const existingCompletion = habitCompletions.find(
      c => c.habit_id === habit.id && c.completed_date === today
    )

    if (existingCompletion) {
      await supabase.from('habit_completions').delete().eq('id', existingCompletion.id)
    } else {
      await supabase.from('habit_completions').insert({
        habit_id: habit.id,
        user_id: user.id,
        completed_date: today,
      })
    }

    router.refresh()
  }

  function getStreak(habitId: string): number {
    const completions = habitCompletions
      .filter(c => c.habit_id === habitId)
      .map(c => c.completed_date)
      .sort()
      .reverse()

    let streak = 0
    const checkDate = new Date()
    
    for (let i = 0; i < 30; i++) {
      const dateStr = checkDate.toISOString().split('T')[0]
      if (completions.includes(dateStr)) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else if (i === 0) {
        // Today not complete yet, check yesterday
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }

    return streak
  }

  const urgentTasks = filteredTasks.filter(t => t.priority === 'urgent' || t.priority === 'high')
  const totalTasks = filteredTasks.length
  const completedTodayHabits = filteredHabits.filter(h => 
    habitCompletions.some(c => c.habit_id === h.id && c.completed_date === today)
  ).length
  const completedGoals = filteredGoals.filter(g => g.completed).length

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="neo-card p-6 y2k-gradient-warm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-foreground">
              {greeting}, {profile?.display_name || 'Founder'}!
            </h2>
            <p className="text-foreground/80 font-medium mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-3">
            <div className="neo-card bg-card p-3 text-center min-w-[80px]">
              <p className="text-2xl font-black">{filteredEvents.length}</p>
              <p className="text-xs font-semibold text-muted-foreground">Events</p>
            </div>
            <div className="neo-card bg-card p-3 text-center min-w-[80px]">
              <p className="text-2xl font-black">{urgentTasks.length}</p>
              <p className="text-xs font-semibold text-muted-foreground">Urgent</p>
            </div>
            <div className="neo-card bg-card p-3 text-center min-w-[80px]">
              <p className="text-2xl font-black">{completedTodayHabits}/{filteredHabits.length}</p>
              <p className="text-xs font-semibold text-muted-foreground">Habits</p>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Goals */}
      <div className="neo-card p-5 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black flex items-center gap-2">
            <Target className="w-5 h-5" />
            Today&apos;s Goals
            {filteredGoals.length > 0 && (
              <span className="px-2 py-0.5 bg-primary text-primary-foreground rounded-full text-sm">
                {completedGoals}/{filteredGoals.length}
              </span>
            )}
          </h3>
        </div>
        
        {/* Add Goal Input */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Add a goal for today..."
            value={newGoalText}
            onChange={(e) => setNewGoalText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addDailyGoal()}
            className="neo-input flex-1"
          />
          <button
            onClick={addDailyGoal}
            disabled={addingGoal || !newGoalText.trim()}
            className="neo-btn bg-primary text-primary-foreground disabled:opacity-50"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Goals List */}
        {filteredGoals.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Target className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="font-medium">No goals set for today</p>
            <p className="text-sm">Add some goals to stay focused!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredGoals.map((goal) => (
              <div
                key={goal.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all neo-border border-2 ${
                  goal.completed ? 'bg-lime/20' : 'bg-card'
                }`}
              >
                <button
                  onClick={() => toggleGoal(goal)}
                  className={`w-6 h-6 rounded-full neo-border flex items-center justify-center transition-all ${
                    goal.completed ? 'bg-lime' : 'bg-card hover:bg-muted'
                  }`}
                >
                  {goal.completed && <Check className="w-4 h-4" />}
                </button>
                <p className={`flex-1 font-medium ${goal.completed ? 'line-through opacity-60' : ''}`}>
                  {goal.title}
                </p>
                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Energy Tracker */}
        <div className="neo-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black flex items-center gap-2">
              <Battery className="w-5 h-5" />
              Energy Level
            </h3>
            {selectedEnergy && (
              <span className={`px-3 py-1 rounded-full neo-border text-sm font-bold ${energyLevels[selectedEnergy - 1].color}`}>
                {energyLevels[selectedEnergy - 1].label}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {energyLevels.map((e) => {
              const Icon = e.icon
              const isSelected = selectedEnergy === e.level
              return (
                <button
                  key={e.level}
                  onClick={() => logEnergy(e.level)}
                  disabled={savingEnergy}
                  className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-lg transition-all neo-hover ${
                    isSelected
                      ? `${e.color} neo-border neo-shadow`
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs font-bold">{e.level}</span>
                </button>
              )
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Track your energy to optimize when you schedule deep work
          </p>
        </div>

        {/* Today's Schedule */}
        <div className="neo-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Today&apos;s Schedule
            </h3>
            <Link href="/calendar" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="font-medium">No events scheduled today</p>
              <Link href="/calendar" className="text-sm text-primary hover:underline">
                Add an event
              </Link>
            </div>
          ) : (
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-3 bg-muted rounded-lg neo-border border-2"
                >
                  <div className={`w-3 h-3 rounded-full bg-${event.color === 'pink' ? 'primary' : event.color === 'cyan' ? 'secondary' : event.color === 'yellow' ? 'accent' : 'lime'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      {' - '}
                      {new Date(event.end_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Habit Streaks */}
        <div className="neo-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black flex items-center gap-2">
              <Flame className="w-5 h-5" />
              Daily Habits
            </h3>
            <Link href="/analytics" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
              Details <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {filteredHabits.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="font-medium">No habits tracked yet</p>
              <Link href="/analytics" className="text-sm text-primary hover:underline">
                Add a habit
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredHabits.map((habit) => {
                const isCompleted = habitCompletions.some(
                  c => c.habit_id === habit.id && c.completed_date === today
                )
                const streak = getStreak(habit.id)
                return (
                  <button
                    key={habit.id}
                    onClick={() => toggleHabit(habit)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all neo-hover ${
                      isCompleted
                        ? 'bg-lime neo-border neo-shadow-sm'
                        : 'bg-muted hover:bg-muted/80 neo-border border-muted'
                    }`}
                  >
                    <span className="text-2xl">{habit.icon}</span>
                    <div className="flex-1 text-left">
                      <p className="font-bold">{habit.name}</p>
                      {streak > 0 && (
                        <p className="text-xs flex items-center gap-1">
                          <Flame className="w-3 h-3 text-hot-orange" />
                          {streak} day streak
                        </p>
                      )}
                    </div>
                    <div className={`w-6 h-6 rounded-full neo-border flex items-center justify-center ${
                      isCompleted ? 'bg-foreground' : 'bg-card'
                    }`}>
                      {isCompleted && <Star className="w-4 h-4 text-card" />}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Priority Tasks */}
        <div className="neo-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black flex items-center gap-2">
              <CheckSquare className="w-5 h-5" />
              Top Tasks
            </h3>
            <Link href="/tasks" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Sparkles className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="font-medium">All caught up!</p>
              <Link href="/tasks" className="text-sm text-primary hover:underline">
                Add a task
              </Link>
            </div>
          ) : (
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {filteredTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 bg-muted rounded-lg neo-border border-2"
                >
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${priorityColors[task.priority]}`}>
                    {task.priority.toUpperCase()}
                  </span>
                  <p className="flex-1 font-medium truncate">{task.title}</p>
                  {task.app_context && (
                    <span className="text-xs text-muted-foreground bg-card px-2 py-0.5 rounded">
                      {task.app_context}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Inbox Preview */}
      {unprocessedCaptures.length > 0 && (
        <div className="neo-card p-5 bg-secondary/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black flex items-center gap-2">
              <Inbox className="w-5 h-5" />
              Inbox
              <span className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full text-sm">
                {unprocessedCaptures.length}
              </span>
            </h3>
            <Link href="/notes" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
              Process all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {unprocessedCaptures.map((capture) => (
              <div
                key={capture.id}
                className="flex-shrink-0 w-64 neo-card bg-card p-3"
              >
                <p className="text-xs font-bold text-muted-foreground mb-1 capitalize">
                  {capture.capture_type}
                </p>
                <p className="font-medium line-clamp-2">{capture.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}
