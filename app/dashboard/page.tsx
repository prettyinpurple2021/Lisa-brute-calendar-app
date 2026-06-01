import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/app-shell'
import { DashboardContent } from './dashboard-content'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get today's date range
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Fetch all data in parallel
  const [
    { data: profile },
    { data: todayEvents },
    { data: tasks },
    { data: habits },
    { data: habitCompletions },
    { data: todayEnergy },
    { data: unprocessedCaptures },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('events').select('*').eq('user_id', user.id)
      .gte('start_time', today.toISOString())
      .lt('start_time', tomorrow.toISOString())
      .order('start_time', { ascending: true }),
    supabase.from('tasks').select('*').eq('user_id', user.id)
      .neq('status', 'done')
      .order('priority', { ascending: false })
      .limit(10),
    supabase.from('habits').select('*').eq('user_id', user.id),
    supabase.from('habit_completions').select('*').eq('user_id', user.id)
      .gte('completed_date', new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
    supabase.from('energy_logs').select('*').eq('user_id', user.id)
      .gte('logged_at', today.toISOString())
      .order('logged_at', { ascending: false })
      .limit(1),
    supabase.from('quick_captures').select('*').eq('user_id', user.id)
      .eq('processed', false)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  return (
    <AppShell>
      <DashboardContent
        profile={profile}
        todayEvents={todayEvents || []}
        tasks={tasks || []}
        habits={habits || []}
        habitCompletions={habitCompletions || []}
        currentEnergy={todayEnergy?.[0]?.level || null}
        unprocessedCaptures={unprocessedCaptures || []}
      />
    </AppShell>
  )
}
