import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'tasks'
  const format = searchParams.get('format') || 'csv'
  const projectId = searchParams.get('projectId')

  let data: Record<string, unknown>[] = []
  let filename = ''

  // Build query based on type
  if (type === 'tasks') {
    let query = supabase.from('tasks').select('*').eq('user_id', user.id)
    if (projectId) query = query.eq('project_id', projectId)
    const { data: tasks } = await query.order('created_at', { ascending: false })
    data = (tasks || []).map(t => ({
      Title: t.title,
      Description: t.description || '',
      Status: t.status,
      Priority: t.priority,
      'Due Date': t.due_date || '',
      'Time Estimate (min)': t.time_estimate_minutes || '',
      'Time Spent (min)': t.time_spent_minutes || 0,
      'Created At': new Date(t.created_at).toLocaleDateString(),
    }))
    filename = 'tasks'
  } else if (type === 'events') {
    let query = supabase.from('events').select('*').eq('user_id', user.id)
    if (projectId) query = query.eq('project_id', projectId)
    const { data: events } = await query.order('start_time', { ascending: false })
    data = (events || []).map(e => ({
      Title: e.title,
      Description: e.description || '',
      'Start Time': new Date(e.start_time).toLocaleString(),
      'End Time': new Date(e.end_time).toLocaleString(),
      'All Day': e.all_day ? 'Yes' : 'No',
      Recurring: e.is_recurring ? e.recurrence_pattern : 'No',
    }))
    filename = 'events'
  } else if (type === 'habits') {
    const { data: habits } = await supabase.from('habits').select('*').eq('user_id', user.id)
    const { data: completions } = await supabase.from('habit_completions').select('*').eq('user_id', user.id)
    
    data = (habits || []).map(h => {
      const habitCompletions = (completions || []).filter(c => c.habit_id === h.id)
      const totalCompletions = habitCompletions.reduce((sum, c) => sum + c.count, 0)
      return {
        Name: h.name,
        Frequency: h.frequency,
        Target: h.target_count,
        'Total Completions': totalCompletions,
        'Created At': new Date(h.created_at).toLocaleDateString(),
      }
    })
    filename = 'habits'
  } else if (type === 'notes') {
    const { data: captures } = await supabase.from('quick_captures').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    data = (captures || []).map(c => ({
      Content: c.content,
      Type: c.capture_type,
      Processed: c.processed ? 'Yes' : 'No',
      'Created At': new Date(c.created_at).toLocaleString(),
    }))
    filename = 'notes'
  } else if (type === 'time-sessions') {
    const { data: sessions } = await supabase.from('time_sessions').select('*, tasks(title)').eq('user_id', user.id).order('started_at', { ascending: false })
    data = (sessions || []).map(s => ({
      Task: (s.tasks as { title: string })?.title || 'Unknown',
      'Started At': new Date(s.started_at).toLocaleString(),
      'Ended At': s.ended_at ? new Date(s.ended_at).toLocaleString() : 'In Progress',
      'Duration (min)': s.duration_minutes || '',
    }))
    filename = 'time-sessions'
  }

  if (format === 'csv') {
    // Generate CSV
    if (data.length === 0) {
      return new NextResponse('No data to export', { status: 200 })
    }

    const headers = Object.keys(data[0])
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(h => {
          let val = String(row[h] ?? '').replace(/"/g, '""')
          if (/^\s*[=+\-@]/.test(val)) {
            val = "'" + val
          }
          return `"${val}"`
        }).join(',')
      )
    ]
    const csv = csvRows.join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } else {
    // Return JSON for PDF generation on client
    return NextResponse.json({ data, filename, type })
  }
}
