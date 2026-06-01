import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/app-shell'
import { AnalyticsContent } from './analytics-content'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get data for last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [
    { data: habits },
    { data: habitCompletions },
    { data: energyLogs },
    { data: tasks },
  ] = await Promise.all([
    supabase.from('habits').select('*').eq('user_id', user.id),
    supabase.from('habit_completions').select('*').eq('user_id', user.id)
      .gte('completed_date', thirtyDaysAgo.toISOString().split('T')[0]),
    supabase.from('energy_logs').select('*').eq('user_id', user.id)
      .gte('logged_at', thirtyDaysAgo.toISOString())
      .order('logged_at', { ascending: true }),
    supabase.from('tasks').select('*').eq('user_id', user.id)
      .gte('created_at', thirtyDaysAgo.toISOString()),
  ])

  return (
    <AppShell>
      <AnalyticsContent
        initialHabits={habits || []}
        initialCompletions={habitCompletions || []}
        initialEnergyLogs={energyLogs || []}
        tasks={tasks || []}
      />
    </AppShell>
  )
}
