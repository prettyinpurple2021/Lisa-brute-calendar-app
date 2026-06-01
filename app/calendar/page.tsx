import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/app-shell'
import { CalendarContent } from './calendar-content'

export default async function CalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Get events for current month and surrounding months
  const today = new Date()
  const startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1)
  const endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0)

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', user.id)
    .gte('start_time', startDate.toISOString())
    .lte('end_time', endDate.toISOString())
    .order('start_time', { ascending: true })

  return (
    <AppShell>
      <CalendarContent initialEvents={events || []} />
    </AppShell>
  )
}
