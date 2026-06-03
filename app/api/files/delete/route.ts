import { del } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { pathname } = await request.json()

    if (!pathname) {
      return NextResponse.json({ error: 'No pathname provided' }, { status: 400 })
    }

    // Security: Ensure user can only delete their own files
    if (!pathname.startsWith(user.id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await del(pathname)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
  }
}
