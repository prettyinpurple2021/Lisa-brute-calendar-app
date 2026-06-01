import {
  convertToModelMessages,
  streamText,
  UIMessage,
  tool,
  stepCountIs,
} from 'ai'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 30

// Tool to get today's events from the calendar
const getTodaysEventsTool = tool({
  description: 'Get the user\'s calendar events for today',
  inputSchema: z.object({}),
  execute: async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: 'Not authenticated' }
    }

    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', user.id)
      .gte('start_time', startOfDay.toISOString())
      .lt('start_time', endOfDay.toISOString())
      .order('start_time', { ascending: true })

    if (error) {
      return { error: error.message }
    }

    return { events: events || [] }
  },
})

// Tool to get pending tasks
const getPendingTasksTool = tool({
  description: 'Get the user\'s pending tasks (not completed)',
  inputSchema: z.object({
    appContext: z.string().nullable().describe('Filter by app context (calendar, tasks, notes, analytics, ai-chat, files, settings) or null for all'),
  }),
  execute: async ({ appContext }) => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: 'Not authenticated' }
    }

    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .neq('status', 'done')
      .order('created_at', { ascending: false })

    if (appContext) {
      query = query.eq('app_context', appContext)
    }

    const { data: tasks, error } = await query

    if (error) {
      return { error: error.message }
    }

    return { tasks: tasks || [] }
  },
})

// Tool to create a new task
const createTaskTool = tool({
  description: 'Create a new task for the user',
  inputSchema: z.object({
    title: z.string().describe('The task title'),
    description: z.string().nullable().describe('Optional task description'),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).describe('Task priority'),
    appContext: z.enum(['calendar', 'tasks', 'notes', 'analytics', 'ai-chat', 'files', 'settings']).nullable().describe('Which app this task relates to'),
    dueDate: z.string().nullable().describe('Optional due date in YYYY-MM-DD format'),
  }),
  execute: async ({ title, description, priority, appContext, dueDate }) => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: 'Not authenticated' }
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        title,
        description,
        priority,
        app_context: appContext,
        due_date: dueDate,
        status: 'todo',
      })
      .select()
      .single()

    if (error) {
      return { error: error.message }
    }

    return { success: true, task }
  },
})

// Tool to get habit progress
const getHabitProgressTool = tool({
  description: 'Get the user\'s habit tracking progress',
  inputSchema: z.object({}),
  execute: async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: 'Not authenticated' }
    }

    const { data: habits, error: habitsError } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)

    if (habitsError) {
      return { error: habitsError.message }
    }

    const today = new Date().toISOString().split('T')[0]
    const { data: completions, error: completionsError } = await supabase
      .from('habit_completions')
      .select('*')
      .eq('user_id', user.id)
      .eq('completed_date', today)

    if (completionsError) {
      return { error: completionsError.message }
    }

    return {
      habits: habits || [],
      todaysCompletions: completions || [],
    }
  },
})

// Tool to get energy level history
const getEnergyHistoryTool = tool({
  description: 'Get the user\'s recent energy level logs',
  inputSchema: z.object({
    days: z.number().describe('Number of days to look back (default 7)'),
  }),
  execute: async ({ days = 7 }) => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: 'Not authenticated' }
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data: logs, error } = await supabase
      .from('energy_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('logged_at', startDate.toISOString())
      .order('logged_at', { ascending: false })

    if (error) {
      return { error: error.message }
    }

    return { energyLogs: logs || [] }
  },
})

// Tool to get quick captures/inbox items
const getInboxItemsTool = tool({
  description: 'Get unprocessed quick capture items from the user\'s inbox',
  inputSchema: z.object({}),
  execute: async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { error: 'Not authenticated' }
    }

    const { data: captures, error } = await supabase
      .from('quick_captures')
      .select('*')
      .eq('user_id', user.id)
      .eq('processed', false)
      .order('created_at', { ascending: false })

    if (error) {
      return { error: error.message }
    }

    return { inboxItems: captures || [] }
  },
})

const tools = {
  getTodaysEvents: getTodaysEventsTool,
  getPendingTasks: getPendingTasksTool,
  createTask: createTaskTool,
  getHabitProgress: getHabitProgressTool,
  getEnergyHistory: getEnergyHistoryTool,
  getInboxItems: getInboxItemsTool,
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: 'openai/gpt-4o-mini',
    system: `You are VibeBot, a friendly and enthusiastic AI co-founder assistant for solo founders using the VibeOS productivity suite. You have a Y2K, Lisa Frank-inspired personality - upbeat, colorful, and encouraging!

Your role is to help the user:
- Stay organized and productive
- Manage their calendar, tasks, and habits
- Brainstorm ideas for their startup
- Provide encouragement and motivation
- Help them build their 7 apps (Calendar, Tasks, Notes, Analytics, AI Chat, Files, Settings)

You have access to tools that let you:
- View today's calendar events
- Get and create tasks (you can filter by which app they relate to)
- Check habit progress
- Review energy levels
- See unprocessed inbox items

When helping, be:
- Enthusiastic but not overwhelming
- Practical and action-oriented
- Supportive of their solo founder journey
- Aware they're building 7 apps and managing a lot

Keep responses concise unless asked for more detail. Use the tools to provide personalized, data-driven suggestions.`,
    messages: await convertToModelMessages(messages),
    tools,
    stopWhen: stepCountIs(5),
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse()
}
