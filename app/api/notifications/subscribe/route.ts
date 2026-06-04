import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { subscription } = await request.json()

  if (!subscription || !subscription.endpoint) {
    return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
  }

  const { error } = await supabase.from('push_subscriptions').upsert({
    user_id: user.id,
    endpoint: subscription.endpoint,
    p256dh: subscription.keys.p256dh,
    auth: subscription.keys.auth,
  }, {
    onConflict: 'user_id,endpoint',
  })

  if (error) {
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 })
  }

  // Update user preferences
  await supabase.from('user_preferences').update({
    push_enabled: true,
  }).eq('user_id', user.id)

  return NextResponse.json({ success: true })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { endpoint } = await request.json()

  await supabase.from('push_subscriptions').delete()
    .eq('user_id', user.id)
    .eq('endpoint', endpoint)

  // Check if user has any subscriptions left
  const { data: remaining } = await supabase.from('push_subscriptions')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)

  if (!remaining || remaining.length === 0) {
    await supabase.from('user_preferences').update({
      push_enabled: false,
    }).eq('user_id', user.id)
  }

  return NextResponse.json({ success: true })
}
