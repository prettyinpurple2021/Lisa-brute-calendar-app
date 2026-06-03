import { list } from '@vercel/blob'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    // Check authentication
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // List all blobs and filter by user ID prefix
    const { blobs } = await list()
    
    const userFiles = blobs
      .filter(blob => blob.pathname.startsWith(user.id))
      .map(blob => ({
        pathname: blob.pathname,
        size: blob.size,
        uploadedAt: blob.uploadedAt,
        filename: blob.pathname.split('/').pop()?.replace(/^\d+-/, '') || 'unknown',
      }))

    return NextResponse.json({ files: userFiles })
  } catch (error) {
    console.error('Error listing files:', error)
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 })
  }
}
