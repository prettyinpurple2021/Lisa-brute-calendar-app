import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    
    // Exchange the code for a session - this also gives us the provider token
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.session) {
      // Get the GitHub access token from the session
      const providerToken = data.session.provider_token
      
      if (providerToken) {
        // Fetch GitHub user info to get username
        const githubUserResponse = await fetch('https://api.github.com/user', {
          headers: {
            Authorization: `Bearer ${providerToken}`,
            Accept: 'application/vnd.github.v3+json',
          },
        })
        
        let githubUsername = null
        if (githubUserResponse.ok) {
          const githubUser = await githubUserResponse.json()
          githubUsername = githubUser.login
        }

        // Store the token and username in the user's profile
        await supabase
          .from('profiles')
          .update({
            github_access_token: providerToken,
            github_username: githubUsername,
          })
          .eq('id', data.session.user.id)
      }

      return NextResponse.redirect(`${origin}/settings?github=connected`)
    }
  }

  return NextResponse.redirect(`${origin}/settings?github=error`)
}
