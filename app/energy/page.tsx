import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/app-shell'
import { EnergyContent } from './energy-content'

export default async function EnergyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch all energy logs
  const { data: energyLogs } = await supabase
    .from('energy_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('logged_at', { ascending: false })

  return (
    <AppShell>
      <EnergyContent initialEnergyLogs={energyLogs || []} />
    </AppShell>
  )
}
