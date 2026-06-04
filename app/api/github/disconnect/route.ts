import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Clear GitHub token and username from profile
  const { error } = await supabase
    .from('profiles')
    .update({
      github_access_token: null,
      github_username: null,
    })
    .eq('id', user.id)

  if (error) {
    return NextResponse.json({ error: 'Failed to disconnect GitHub' }, { status: 500 })
  }

  // Also clear any linked repos from projects
  await supabase
    .from('projects')
    .update({
      github_repo_url: null,
      github_repo_name: null,
      github_repo_full_name: null,
    })
    .eq('user_id', user.id)

  return NextResponse.json({ success: true })
}
