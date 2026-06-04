import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/app-shell'
import { ProjectsContent } from './projects-content'

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Check if GitHub is connected
  const { data: profile } = await supabase
    .from('profiles')
    .select('github_access_token')
    .eq('id', user.id)
    .single()

  const githubConnected = !!profile?.github_access_token

  return (
    <AppShell currentPage="projects">
      <ProjectsContent githubConnected={githubConnected} />
    </AppShell>
  )
}
