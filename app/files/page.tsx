import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/app-shell'
import { Folder, Upload, Cloud, HardDrive } from 'lucide-react'

export default async function FilesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <AppShell>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="neo-card p-8 max-w-md bounce-in">
          <div className="w-20 h-20 bg-electric-blue neo-border rounded-full flex items-center justify-center mx-auto mb-6">
            <Folder className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black mb-4">Files Coming Soon</h2>
          <p className="text-muted-foreground mb-6">
            Store and organize your startup assets - pitch decks, brand assets, documents, and more. All in one place.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-primary" />
              <span>Upload Files</span>
            </div>
            <div className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-secondary" />
              <span>Cloud Storage</span>
            </div>
          </div>
        </div>
        
        {/* PLACEHOLDER NOTICE */}
        <div className="mt-8 neo-border bg-accent/20 px-4 py-2 rounded-lg">
          <p className="text-sm font-bold">
            PLACEHOLDER: Needs Vercel Blob integration for file storage
          </p>
        </div>
      </div>
    </AppShell>
  )
}
