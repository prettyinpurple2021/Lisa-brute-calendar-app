import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/app-shell'
import { MessageCircle, Sparkles, Zap } from 'lucide-react'

export default async function AIChatPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <AppShell>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="neo-card p-8 max-w-md bounce-in">
          <div className="w-20 h-20 bg-hot-orange neo-border rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black mb-4">AI Chat Coming Soon</h2>
          <p className="text-muted-foreground mb-6">
            Your AI co-founder assistant will help you brainstorm ideas, write copy, debug code, and accelerate your startup journey.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>AI Brainstorming</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" />
              <span>Code Help</span>
            </div>
          </div>
        </div>
        
        {/* PLACEHOLDER NOTICE */}
        <div className="mt-8 neo-border bg-accent/20 px-4 py-2 rounded-lg">
          <p className="text-sm font-bold">
            PLACEHOLDER: Needs AI SDK integration with real chat functionality
          </p>
        </div>
      </div>
    </AppShell>
  )
}
