import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/app-shell'
import { FilesContent } from './files-content'

export const metadata = {
  title: 'Files | VibeOS',
  description: 'Upload and manage your files',
}

export default async function FilesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <AppShell user={user} activeApp="files">
      <FilesContent />
    </AppShell>
  )
}
