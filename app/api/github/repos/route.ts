import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface GithubRepo {
  id: number
  name: string
  full_name: string
  html_url: string
  description: string | null
  private: boolean
  updated_at: string
}

export async function GET() {
  const supabase = await createClient()
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get the user's GitHub token from their profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('github_access_token')
    .eq('id', user.id)
    .single()

  if (!profile?.github_access_token) {
    return NextResponse.json({ error: 'GitHub not connected' }, { status: 400 })
  }

  try {
    // Fetch user's repositories from GitHub API
    const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
      headers: {
        Authorization: `Bearer ${profile.github_access_token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        // Token is invalid or expired, clear it
        await supabase
          .from('profiles')
          .update({ github_access_token: null, github_username: null })
          .eq('id', user.id)
        
        return NextResponse.json({ error: 'GitHub token expired. Please reconnect.' }, { status: 401 })
      }
      throw new Error('Failed to fetch repositories')
    }

    const repos: GithubRepo[] = await response.json()
    
    // Return simplified repo data
    const simplifiedRepos = repos.map((repo) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      html_url: repo.html_url,
      description: repo.description,
      private: repo.private,
      updated_at: repo.updated_at,
    }))

    return NextResponse.json({ repos: simplifiedRepos })
  } catch (error) {
    console.error('GitHub API error:', error)
    return NextResponse.json({ error: 'Failed to fetch repositories' }, { status: 500 })
  }
}
